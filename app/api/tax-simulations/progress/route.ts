import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-server"
import { connectMongoose } from "@/lib/mongoose"
import StudentTaxProgress from "@/lib/models/StudentTaxProgress"
import TaxLeaderboard from "@/lib/models/TaxLeaderboard"

const safe = (obj: any, key: string) =>
  obj?.[key] ?? { completed: false, score: 0, attempts: 0 }

// GET /api/tax-simulations/progress
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectMongoose()

    let progress = await StudentTaxProgress.findOne({ userId: user.sub }).lean() as any
    if (!progress) {
      const created = await StudentTaxProgress.create({ userId: user.sub })
      progress = created.toObject()
    }

    // Provide safe defaults for any missing nested progress fields
    // so new fields added to the schema don't cause undefined errors
    const safeProgress = {
      ...progress,
      gstProgress: progress?.gstProgress ?? {},
      tdsProgress: progress?.tdsProgress ?? {},
      incomeTaxProgress: progress?.incomeTaxProgress ?? {},
      labourProgress: progress?.labourProgress ?? {},
      msmeProgress: progress?.msmeProgress ?? {},
      dscProgress: {
        registration: safe(progress?.dscProgress, "registration"),
        renewal:      safe(progress?.dscProgress, "renewal"),
        revocation:   safe(progress?.dscProgress, "revocation"),
        overallScore: progress?.dscProgress?.overallScore ?? 0,
        certificateEarned: progress?.dscProgress?.certificateEarned ?? false,
      },
    }

    const [gstLB, tdsLB, overallLB] = await Promise.all([
      TaxLeaderboard.findOne({ userId: user.sub, type: "GST" }).lean(),
      TaxLeaderboard.findOne({ userId: user.sub, type: "TDS" }).lean(),
      TaxLeaderboard.findOne({ userId: user.sub, type: "OVERALL" }).lean(),
    ])

    return NextResponse.json({
      progress: safeProgress,
      leaderboard: { gst: gstLB, tds: tdsLB, overall: overallLB },
    }, { status: 200 })
  } catch (error) {
    console.error("Error fetching tax progress:", error)
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
  }
}
