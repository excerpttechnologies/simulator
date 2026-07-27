import { NextResponse, NextRequest } from "next/server"
import { getPayloadFromRequest } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = getPayloadFromRequest(request)
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: courseId } = await params

  if (!courseId || courseId.trim() === "") {
    return NextResponse.json({ error: "Invalid course ID" }, { status: 400 })
  }

  const db = await getDb()

  // Look up videos directly by courseId string (e.g. "course-tds")
  // Also try looking up by the course's MongoDB id field
  const videos = await db
    .collection("course_videos")
    .find({ courseId: courseId })
    .sort({ lessonNumber: 1, createdAt: 1 })
    .project({ fileName: 0 }) // hide server file paths from students
    .toArray()

  return NextResponse.json({ videos })
}
