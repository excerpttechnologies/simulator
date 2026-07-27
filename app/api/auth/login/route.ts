import { NextResponse } from "next/server"
import type { User } from "@/lib/types"
import { createToken, getAuthCookieName, hashPassword } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"

export async function POST(req: Request) {
  const body = await req.json()
  const email = String(body.email || "").trim().toLowerCase()
  const password = String(body.password || "")

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 })
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

  const user = (await db.collection<User>("users").findOne({ email })) as User | null

  if (!user || user.passwordHash !== hashPassword(password)) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 })
  }

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
