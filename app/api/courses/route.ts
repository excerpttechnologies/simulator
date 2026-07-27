import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-server"
import { authorizeRoles } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { randomUUID } from "crypto"

function makeSlug(title: string) {
  return title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}

function normalizeCourse(doc: any, enrolledIds: string[] = [], role = "Student") {
  const { _id, ...rest } = doc
  const id = rest.id || String(_id)
  let status = rest.status ?? "available"

  if (role === "Admin") {
    status = "admin"
  } else if (role === "Faculty") {
    status = "faculty"
  } else {
    // Student
    status = enrolledIds.includes(id) ? "enrolled" : "available"
  }

  return {
    ...rest,
    id,
    slug: rest.slug || makeSlug(rest.title || ""),
    status,
    progress: enrolledIds.includes(id) ? (rest.progress ?? 0) : 0,
    students: rest.students ?? 0,
    enrolledCount: rest.enrolledCount ?? 0,
    modules: rest.modules ?? [],
    assignments: rest.assignments ?? [],
  }
}

export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }

  const db = await getDb()
  // All roles see all courses from DB — role only affects status label
  const docs = await db.collection("courses").find({}).sort({ createdAt: -1 }).toArray()
  const enrolledIds = user.enrolledCourseIds || []
  const courses = docs.map((doc) => normalizeCourse(doc, enrolledIds, user.role))

  return NextResponse.json({ courses })
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user || !authorizeRoles(user, "Admin")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 })
  }

  const body = await req.json()
  const title = String(body.title || "").trim()
  const description = String(body.description || "").trim()
  const category = String(body.category || "").trim()
  const instructor = String(body.instructor || "").trim()
  const duration = String(body.duration || "").trim()
  const lessons = Number(body.lessons || 0)
  const rating = Number(body.rating || 0)
  const modules = Array.isArray(body.modules) ? body.modules : []
  const assignments = Array.isArray(body.assignments) ? body.assignments : []

  if (!title || !description || !category) {
    return NextResponse.json(
      { error: "Title, description and category are required." },
      { status: 400 }
    )
  }

  const id = randomUUID()
  const slug = makeSlug(title)

  const db = await getDb()

  // Ensure slug is unique
  const existing = await db.collection("courses").findOne({ slug })
  const finalSlug = existing ? `${slug}-${id.slice(0, 6)}` : slug

  const newCourse = {
    id,
    slug: finalSlug,
    title,
    description,
    category,
    instructor: instructor || "Admin",
    duration: duration || "0 hours",
    lessons,
    rating,
    students: 0,
    enrolledCount: 0,
    modules,
    assignments,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: user.id,
  }

  await db.collection("courses").insertOne(newCourse)
  return NextResponse.json({ course: newCourse }, { status: 201 })
}

export async function PUT(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user || !authorizeRoles(user, "Admin")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 })
  }

  const body = await req.json()
  const courseId = String(body.id || "").trim()
  if (!courseId) {
    return NextResponse.json({ error: "Course id is required." }, { status: 400 })
  }

  const db = await getDb()
  const existing = await db.collection("courses").findOne({ id: courseId })
  if (!existing) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 })
  }

  const updates: Record<string, any> = { updatedAt: new Date().toISOString() }
  const fields = ["title", "description", "category", "instructor", "duration", "modules", "assignments"]
  for (const f of fields) {
    if (body[f] !== undefined) updates[f] = body[f]
  }
  if (body.lessons !== undefined) updates.lessons = Number(body.lessons)
  if (body.rating !== undefined) updates.rating = Number(body.rating)
  if (body.students !== undefined) updates.students = Number(body.students)

  await db.collection("courses").updateOne({ id: courseId }, { $set: updates })

  const updated = await db.collection("courses").findOne({ id: courseId })
  const { _id, ...rest } = updated!
  return NextResponse.json({ course: rest })
}

export async function DELETE(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user || !authorizeRoles(user, "Admin")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 })
  }

  const body = await req.json()
  const courseId = String(body.id || "").trim()
  if (!courseId) {
    return NextResponse.json({ error: "Course id is required." }, { status: 400 })
  }

  const db = await getDb()
  const result = await db.collection("courses").deleteOne({ id: courseId })
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 })
  }

  // Also delete associated videos
  await db.collection("course_videos").deleteMany({ courseId })

  return NextResponse.json({ ok: true })
}
