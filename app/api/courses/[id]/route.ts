import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-server"
import { getDb } from "@/lib/mongodb"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const routeParams = await params
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }

  const db = await getDb()
  
  // Try by id field first, then by slug
  let courseDoc = await db.collection("courses").findOne({ id: routeParams.id })
  if (!courseDoc) {
    courseDoc = await db.collection("courses").findOne({ slug: routeParams.id })
  }

  if (!courseDoc) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 })
  }

  const { _id, ...course } = courseDoc
  return NextResponse.json({ course })
}
