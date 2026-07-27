import { NextResponse } from "next/server"
import { getLatestSimulationAttempt, getSimulationBySlug, saveSimulationProgress } from "@/lib/simulation"
import { getUserFromRequest } from "@/lib/auth-server"

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const routeParams = await params
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
    }

    const simulation = await getSimulationBySlug(routeParams.slug)
    if (!simulation || !simulation.published) {
      return NextResponse.json({ error: "Simulation not found." }, { status: 404 })
    }

    const attempt = await getLatestSimulationAttempt(user.id, simulation.id)
    return NextResponse.json({ attempt })
  } catch (err: any) {
    console.error("[/api/user/simulations/[slug]/progress GET]", err?.message ?? err)
    return NextResponse.json({ error: "Failed to load progress." }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const routeParams = await params
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
    }

    const simulation = await getSimulationBySlug(routeParams.slug)
    if (!simulation || !simulation.published) {
      return NextResponse.json({ error: "Simulation not found." }, { status: 404 })
    }

    const body = await req.json()
    const result = await saveSimulationProgress({
      simulationId: simulation.id,
      userId: user.id,
      progress: body.progress ?? {},
      responses: body.responses ?? {},
      currentStep: String(body.currentStep ?? "workspace"),
      timeSpent: Number(body.timeSpent ?? 0),
      status: String(body.status ?? "in-progress") as any,
      score: Number(body.score ?? 0),
      completed: Boolean(body.completed ?? false),
    })

    if (!result) {
      return NextResponse.json({ error: "Unable to save progress." }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error("[/api/user/simulations/[slug]/progress POST]", err?.message ?? err)
    return NextResponse.json({ error: "Failed to save progress." }, { status: 500 })
  }
}
