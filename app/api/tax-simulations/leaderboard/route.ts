import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-server"
import { connectMongoose } from "@/lib/mongoose"
import TaxLeaderboard from "@/lib/models/TaxLeaderboard"
import { getDb } from "@/lib/mongodb"

// GET /api/tax-simulations/leaderboard?type=GST|TDS|OVERALL&limit=50
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "OVERALL"
    const limit = parseInt(searchParams.get("limit") || "50", 10)

    await connectMongoose()

    const leaderboard = await TaxLeaderboard.find({ type })
      .sort({ totalScore: -1, lastUpdated: 1 })
      .limit(limit)
      .lean()

    // Update ranks
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1
    })

    // Find current user's position
    const userEntry = leaderboard.find(entry => entry.userId === user.sub)

    return NextResponse.json({
      leaderboard,
      userEntry,
      type,
    }, { status: 200 })
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}

// POST /api/tax-simulations/leaderboard/update - Update leaderboard (called after simulation completion)
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { type, score, simulationId } = body

    if (!type || score === undefined) {
      return NextResponse.json({ error: "Missing type or score" }, { status: 400 })
    }

    await connectMongoose()

    // Get user info
    const db = await getDb()
    const usersCollection = db.collection("users")
    const userData = await usersCollection.findOne({ id: user.sub })
    const userName = userData?.name || "Unknown User"

    // Update or create leaderboard entry
    let entry = await TaxLeaderboard.findOne({ userId: user.sub, type })
    
    if (!entry) {
      entry = await TaxLeaderboard.create({
        userId: user.sub,
        userName,
        type,
        totalScore: score,
        simulationsCompleted: 1,
        averageScore: score,
      })
    } else {
      entry.simulationsCompleted += 1
      entry.totalScore += score
      entry.averageScore = Math.round(entry.totalScore / entry.simulationsCompleted)
      entry.lastUpdated = new Date()
      await entry.save()
    }

    // Recalculate ranks for this type
    await recalculateRanks(type)

    return NextResponse.json({ entry: entry.toObject() }, { status: 200 })
  } catch (error) {
    console.error("Error updating leaderboard:", error)
    return NextResponse.json({ error: "Failed to update leaderboard" }, { status: 500 })
  }
}

// Helper function to recalculate ranks
async function recalculateRanks(type: string) {
  const entries = await TaxLeaderboard.find({ type }).sort({ totalScore: -1, lastUpdated: 1 })
  
  for (let i = 0; i < entries.length; i++) {
    entries[i].rank = i + 1
    await entries[i].save()
  }
}
