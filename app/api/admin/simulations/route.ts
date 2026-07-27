import { NextResponse } from "next/server"
import { createSimulation, getAllSimulations, updateSimulation, getSimulationCounts, getAdminSimulationAnalytics } from "@/lib/simulation"
import { getUserFromRequest } from "@/lib/auth-server"
import { authorizeRoles } from "@/lib/auth"

const requiredFields = [
  "title",
  "description",
  "category",
  "difficulty",
  "duration",
  "tags",
  "thumbnailUrl",
  "videoUrl",
  "instructions",
  "status",
  "slug",
]

function parseJson(value: any) {
  if (!value) return {}
  if (typeof value === "object") return value
  try {
    return JSON.parse(String(value))
  } catch {
    return {}
  }
}

function parseSimulationBody(body: any) {
  return {
    title: String(body.title),
    description: String(body.description),
    category: String(body.category) as any,
    difficulty: String(body.difficulty) as any,
    duration: String(body.duration),
    tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
    thumbnailUrl: String(body.thumbnailUrl),
    videoUrl: String(body.videoUrl),
    scenario: body.scenario ? String(body.scenario) : "",
    instructions: String(body.instructions),
    assessmentRules: body.assessmentRules ? String(body.assessmentRules) : "",
    attachments: Array.isArray(body.attachments) ? body.attachments : [],
    passingScore: body.passingScore ? Number(body.passingScore) : 70,
    attemptsAllowed: body.attemptsAllowed ? Number(body.attemptsAllowed) : 3,
    certificateEligible: body.certificateEligible !== false,
    assignmentRules: body.assignmentRules || {},
    schedule: body.schedule || {},
    engineType: body.engineType ? String(body.engineType) : undefined,
    questionSet: parseJson(body.questionSet),
    learningObjectives: Array.isArray(body.learningObjectives)
      ? body.learningObjectives.map(String)
      : typeof body.learningObjectives === "string"
      ? String(body.learningObjectives).split(",").map((item) => item.trim()).filter(Boolean)
      : [],
    status: String(body.status) as any,
    slug: String(body.slug),
  }
}

export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user || !authorizeRoles(user, "Admin")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 })
  }

  const [simulations, counts, analytics] = await Promise.all([
    getAllSimulations(),
    getSimulationCounts(),
    getAdminSimulationAnalytics(),
  ])

  return NextResponse.json({ simulations, counts, analytics })
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user || !authorizeRoles(user, "Admin")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 })
  }

  const body = await req.json()
  for (const field of requiredFields) {
    if (!(field in body)) {
      return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 })
    }
  }

  try {
    const simulation = await createSimulation({
      ...parseSimulationBody(body),
      createdBy: user.id,
    })

    return NextResponse.json({ simulation })
  } catch (error) {
  console.error("========== CREATE SIMULATION ERROR ==========");
  console.error(error);

  if (error instanceof Error) {
    console.error(error.message);
    console.error(error.stack);
  }

  return NextResponse.json(
    {
      error: error instanceof Error
        ? error.message
        : "Unable to create simulation."
    },
    { status: 500 }
  )
}
}

export async function PUT(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user || !authorizeRoles(user, "Admin")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 })
  }

  const body = await req.json()
  const id = String(body.id || "").trim()
  if (!id) {
    return NextResponse.json({ error: "Simulation id is required." }, { status: 400 })
  }

  const updates = {
    title: body.title ? String(body.title) : undefined,
    description: body.description ? String(body.description) : undefined,
    category: body.category ? (String(body.category) as any) : undefined,
    difficulty: body.difficulty ? (String(body.difficulty) as any) : undefined,
    duration: body.duration ? String(body.duration) : undefined,
    tags: Array.isArray(body.tags) ? body.tags.map(String) : undefined,
    thumbnailUrl: body.thumbnailUrl ? String(body.thumbnailUrl) : undefined,
    videoUrl: body.videoUrl ? String(body.videoUrl) : undefined,
    scenario: body.scenario ? String(body.scenario) : undefined,
    instructions: body.instructions ? String(body.instructions) : undefined,
    assessmentRules: body.assessmentRules ? String(body.assessmentRules) : undefined,
    attachments: Array.isArray(body.attachments) ? body.attachments : undefined,
    passingScore: body.passingScore !== undefined ? Number(body.passingScore) : undefined,
    attemptsAllowed: body.attemptsAllowed !== undefined ? Number(body.attemptsAllowed) : undefined,
    certificateEligible: body.certificateEligible !== undefined ? Boolean(body.certificateEligible) : undefined,
    assignmentRules: body.assignmentRules || undefined,
    schedule: body.schedule || undefined,
    engineType: body.engineType ? String(body.engineType) : undefined,
    questionSet: body.questionSet ? parseJson(body.questionSet) : undefined,
    learningObjectives: Array.isArray(body.learningObjectives)
      ? body.learningObjectives.map(String)
      : typeof body.learningObjectives === "string"
      ? String(body.learningObjectives).split(",").map((item) => item.trim()).filter(Boolean)
      : undefined,
    status: body.status ? (String(body.status) as any) : undefined,
    slug: body.title
      ? String(body.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      : undefined,
  }

  try {
    const simulation = await updateSimulation(id, updates)
    if (!simulation) {
      return NextResponse.json({ error: "Simulation not found." }, { status: 404 })
    }
    return NextResponse.json({ simulation })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update simulation." }, { status: 500 })
  }
}
