import { NextResponse, NextRequest } from "next/server"
import { getPayloadFromRequest, authorizeRoles } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { unlink } from "fs/promises"
import path from "path"
import { existsSync } from "fs"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; videoId: string }> }
) {
  const payload = getPayloadFromRequest(request)
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!authorizeRoles(payload, "Admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { courseId, videoId } = await params

  if (!courseId || courseId.trim() === "") {
    return NextResponse.json({ error: "Invalid course ID" }, { status: 400 })
  }
  if (!ObjectId.isValid(videoId)) {
    return NextResponse.json({ error: "Invalid video ID" }, { status: 400 })
  }

  const db = await getDb()
  const video = await db.collection("course_videos").findOne({
    _id: new ObjectId(videoId),
    courseId: courseId,
  })

  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 })
  }

  const filePath = path.join(process.cwd(), "public", "uploads", "videos", courseId, video.fileName)
  if (existsSync(filePath)) {
    await unlink(filePath)
  }

  await db.collection("course_videos").deleteOne({ _id: new ObjectId(videoId) })

  return NextResponse.json({ message: "Video deleted successfully" })
}