import { randomUUID } from "crypto"
import { NextResponse } from "next/server"
import { createToken, getAuthCookieName, hashPassword } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import type { Role, User } from "@/lib/types"

const roleMap: Record<string, Role> = {
  student: "Student",
  trainer: "Faculty",
  institute: "Admin",
}

export async function POST(req: Request) {
  const body = await req.json()
  const name = String(body.name || "").trim()
  const email = String(body.email || "").trim().toLowerCase()
  const password = String(body.password || "")
  const userType = String(body.userType || "student").trim()

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 })
  }

  let db
  try {
    db = await getDb()
  } catch (error) {
    return NextResponse.json(
      { error: `Unable to connect to database: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    )
  }

  const existingUser = await db.collection<User>("users").findOne({ email })
  if (existingUser) {
    return NextResponse.json(
      { error: "A user with this email already exists. Please log in instead." },
      { status: 409 }
    )
  }

  const role = roleMap[userType] || "Student"
  const user: User = {
    id: randomUUID(),
    name,
    email,
    passwordHash: hashPassword(password),
    role,
    assignedCourseIds: [],
    enrolledCourseIds: [],
    createdAt: new Date().toISOString(),
  }

  await db.collection<User>("users").insertOne(user as any)

  const token = createToken({ sub: user.id, email: user.email, role: user.role })
  const response = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  })

  response.cookies.set({
    name: getAuthCookieName(),
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60,
  })

  return response
}
