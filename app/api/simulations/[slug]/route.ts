import { NextResponse } from "next/server"
import { incrementSimulationViews } from "@/lib/simulation"

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const routeParams = await params
    const simulation = await incrementSimulationViews(routeParams.slug)
    if (!simulation || !simulation.published) {
      return NextResponse.json({ error: "Simulation not found." }, { status: 404 })
    }
    return NextResponse.json({ simulation })
  } catch (err: any) {
    console.error("[/api/simulations/[slug]]", err?.message ?? err)
    return NextResponse.json({ error: "Failed to load simulation." }, { status: 500 })
  }
}
