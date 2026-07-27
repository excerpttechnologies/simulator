import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-server"
import { connectMongoose } from "@/lib/mongoose"
import TaxSimulation from "@/lib/models/TaxSimulation"
import StudentTaxProgress from "@/lib/models/StudentTaxProgress"
import TaxLeaderboard from "@/lib/models/TaxLeaderboard"
import dns from "dns"

try { dns.setServers(["8.8.8.8", "8.8.4.4"]) } catch {}

// GET /api/admin/tax-simulations — analytics & all attempts
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || user.role !== "Admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectMongoose()

    const { searchParams } = new URL(req.url)
    const action = searchParams.get("action") || "overview"

    if (action === "overview") {
      const [totalAttempts, completedAttempts, allProgress, leaderboardData] = await Promise.all([
        TaxSimulation.countDocuments(),
        TaxSimulation.countDocuments({ status: "completed" }),
        StudentTaxProgress.find().lean(),
        TaxLeaderboard.find({ type: "OVERALL" }).sort({ totalScore: -1 }).limit(10).lean(),
      ])

      const avgScore = completedAttempts > 0
        ? (await TaxSimulation.aggregate([
            { $match: { status: "completed" } },
            { $group: { _id: null, avg: { $avg: "$percentage" } } }
          ]))[0]?.avg || 0
        : 0

      const gstCompleted = await TaxSimulation.countDocuments({ status: "completed", type: /^GST/ })
      const tdsCompleted = await TaxSimulation.countDocuments({ status: "completed", type: /^TDS/ })

      const typeBreakdown = await TaxSimulation.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 }, avgScore: { $avg: "$percentage" } } },
        { $sort: { count: -1 } },
      ])

      return NextResponse.json({
        overview: {
          totalAttempts,
          completedAttempts,
          completionRate: totalAttempts ? Math.round((completedAttempts / totalAttempts) * 100) : 0,
          avgScore: Math.round(avgScore),
          gstCompleted,
          tdsCompleted,
          activeStudents: allProgress.length,
          totalXPDistributed: allProgress.reduce((sum: number, p: any) => sum + (p.xp || 0), 0),
        },
        typeBreakdown,
        leaderboard: leaderboardData,
      })
    }

    if (action === "attempts") {
      const page = parseInt(searchParams.get("page") || "1", 10)
      const limit = parseInt(searchParams.get("limit") || "50", 10)
      const type = searchParams.get("type") || ""
      const status = searchParams.get("status") || ""

      const filter: any = {}
      if (type) filter.type = type
      if (status) filter.status = status

      const [attempts, total] = await Promise.all([
        TaxSimulation.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        TaxSimulation.countDocuments(filter),
      ])

      return NextResponse.json({ attempts, total, page, limit })
    }

    if (action === "students") {
      const students = await StudentTaxProgress.find().sort({ totalScore: -1 }).lean()
      return NextResponse.json({ students })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (error) {
    console.error("Admin tax simulations error:", error)
    return NextResponse.json({ error: "Failed to fetch admin data" }, { status: 500 })
  }
}

// PATCH /api/admin/tax-simulations — reset or flag attempts
export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || user.role !== "Admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await req.json()
    const { action, attemptId, userId } = body

    await connectMongoose()

    if (action === "reset-progress" && userId) {
      await StudentTaxProgress.findOneAndUpdate(
        { userId },
        {
          $set: {
            gstProgress: { registration: { completed: false, score: 0, attempts: 0 }, invoicing: { completed: false, score: 0, attempts: 0 }, returns: { completed: false, score: 0, attempts: 0 }, reconciliation: { completed: false, score: 0, attempts: 0 }, audit: { completed: false, score: 0, attempts: 0 }, overallScore: 0, certificateEarned: false },
            tdsProgress: { deduction: { completed: false, score: 0, attempts: 0 }, challan: { completed: false, score: 0, attempts: 0 }, returnFiling: { completed: false, score: 0, attempts: 0 }, form16: { completed: false, score: 0, attempts: 0 }, overallScore: 0, certificateEarned: false },
            xp: 0, badges: [], streak: 0, totalScore: 0,
          }
        },
        { upsert: true }
      )
      return NextResponse.json({ success: true, message: "Progress reset" })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to perform admin action" }, { status: 500 })
  }
}
