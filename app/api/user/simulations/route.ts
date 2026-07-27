import { NextResponse } from "next/server"
import { getUserSimulationSummaries } from "@/lib/simulation"
import { getUserFromRequest } from "@/lib/auth-server"

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
    }

    const { summaries, stats } = await getUserSimulationSummaries(user.id)
    return NextResponse.json({ simulations: summaries, stats })
  } catch (err: any) {
    console.error("[/api/user/simulations] ERROR:", err?.message ?? err)
    return NextResponse.json(
      { error: "Failed to load simulations. Please try again." },
      { status: 500 }
    )
  }
}
