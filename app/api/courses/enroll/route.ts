import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-server"
import { getDb } from "@/lib/mongodb"

export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }

  const body = await req.json()
  const courseId = String(body.courseId || "").trim()
  if (!courseId) {
    return NextResponse.json({ error: "courseId is required." }, { status: 400 })
  }

  const db = await getDb()

  // Check course exists
  const course = await db.collection("courses").findOne({ id: courseId })
  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 })
  }

  // Add to user's enrolled courses
  const enrolledIds = user.enrolledCourseIds || []
  if (!enrolledIds.includes(courseId)) {
    await db.collection("users").updateOne(
      { id: user.id },
      {
        $addToSet: { enrolledCourseIds: courseId },
        $set: { updatedAt: new Date().toISOString() },
      }
    )
    // Increment course student count
    await db.collection("courses").updateOne(
      { id: courseId },
      { $inc: { students: 1, enrolledCount: 1 } }
    )
  }

  return NextResponse.json({ ok: true, message: "Enrolled successfully." })
}
