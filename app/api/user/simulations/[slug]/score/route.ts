import { NextResponse } from "next/server"
import { getSimulationBySlug, saveSimulationProgress, scoreSimulation } from "@/lib/simulation"
import { getUserFromRequest } from "@/lib/auth-server"

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
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
  const responses = body.responses ?? {}
  const progress = body.progress ?? {}
  const currentStep = String(body.currentStep ?? "completed")
  const timeSpent = Number(body.timeSpent ?? 0)
  const completed = body.completed !== false
  const engineType = simulation.engineType || (simulation.category === "GST" ? "GST_INVOICE" : "JOURNAL")
  const questionSet = simulation.questionSet || {}
  const score = scoreSimulation(engineType, questionSet.questions || questionSet, responses, questionSet.scenario || {})

  const result = await saveSimulationProgress({
    simulationId: simulation.id,
    userId: user.id,
    progress,
    responses,
    currentStep,
    timeSpent,
    status: completed ? "completed" : "in-progress",
    score: score.percentage ?? 0,
    completed,
  })

  if (!result) {
    return NextResponse.json({ error: "Unable to process score." }, { status: 500 })
  }

  return NextResponse.json({ score, attempt: result.attempt, certificate: result.certificate ?? null })
}
