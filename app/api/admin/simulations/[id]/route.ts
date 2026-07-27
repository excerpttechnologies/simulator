import { NextResponse } from "next/server"
import { cloneSimulation, deleteSimulation, getSimulationById, reorderSimulation, updateSimulation } from "@/lib/simulation"
import { getUserFromRequest } from "@/lib/auth-server"
import { authorizeRoles } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const routeParams = await params
  const user = await getUserFromRequest(req)
  if (!user || !authorizeRoles(user, "Admin")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 })
  }

  const simulation = await getSimulationById(routeParams.id)
  if (!simulation) {
    return NextResponse.json({ error: "Not found." }, { status: 404 })
  }

  return NextResponse.json({ simulation })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const routeParams = await params
  const user = await getUserFromRequest(req)
  if (!user || !authorizeRoles(user, "Admin")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 })
  }

  await deleteSimulation(routeParams.id)
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const routeParams = await params
  const user = await getUserFromRequest(req)
  if (!user || !authorizeRoles(user, "Admin")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 })
  }

  const body = await req.json()
  const action = String(body.action || "").trim()

  if (action === "toggle-publish") {
    const simulation = await updateSimulation(routeParams.id, {
      status: body.currentStatus === "published" ? "draft" : "published",
    })
    if (!simulation) return NextResponse.json({ error: "Not found." }, { status: 404 })
    return NextResponse.json({ simulation })
  }

  if (action === "archive") {
    const simulation = await updateSimulation(routeParams.id, { status: "archived" })
    if (!simulation) return NextResponse.json({ error: "Not found." }, { status: 404 })
    return NextResponse.json({ simulation })
  }

  if (action === "clone") {
    const simulation = await cloneSimulation(routeParams.id, user.id)
    if (!simulation) return NextResponse.json({ error: "Not found." }, { status: 404 })
    return NextResponse.json({ simulation })
  }

  if (action === "reorder") {
    const direction = body.direction === "down" ? "down" : "up"
    const simulation = await reorderSimulation(routeParams.id, direction)
    if (!simulation) return NextResponse.json({ error: "Not found." }, { status: 404 })
    return NextResponse.json({ simulation })
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 })
}
