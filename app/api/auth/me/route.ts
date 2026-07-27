import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-server"

export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      assignedCourseIds: user.assignedCourseIds,
      enrolledCourseIds: user.enrolledCourseIds,
    },
  })
}
