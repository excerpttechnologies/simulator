import { NextResponse, NextRequest } from "next/server"
import { getPayloadFromRequest, authorizeRoles } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import type { User } from "@/lib/types"

export async function GET(request: NextRequest) {
  const payload = getPayloadFromRequest(request)
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!authorizeRoles(payload, "Admin")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const db = await getDb()
  const users = await db.collection("users").find({}).sort({ createdAt: -1 }).toArray()
  const normalized = users.map(({ _id, passwordHash, ...rest }) => rest)
  return NextResponse.json({ users: normalized })
}

export async function PUT(request: NextRequest) {
  const payload = getPayloadFromRequest(request)
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!authorizeRoles(payload, "Admin")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await request.json()
  const { userId, enrolledCourseIds, assignedCourseIds } = body

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const db = await getDb()
  const updates: Record<string, any> = {}
  if (Array.isArray(enrolledCourseIds)) updates.enrolledCourseIds = enrolledCourseIds
  if (Array.isArray(assignedCourseIds)) updates.assignedCourseIds = assignedCourseIds

  await db.collection("users").updateOne({ id: userId }, { $set: updates })
  return NextResponse.json({ ok: true })
}
