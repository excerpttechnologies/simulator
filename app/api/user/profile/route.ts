import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-server"
import { getDb } from "@/lib/mongodb"
import { hashPassword } from "@/lib/auth"

export async function PUT(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })

  const body = await req.json()
  const db = await getDb()
  const updates: Record<string, any> = { updatedAt: new Date().toISOString() }

  if (body.name && String(body.name).trim()) updates.name = String(body.name).trim()
  if (body.phone !== undefined) updates.phone = String(body.phone).trim()
  if (body.institute !== undefined) updates.institute = String(body.institute).trim()

  // Password change
  if (body.currentPassword && body.newPassword) {
    if (user.passwordHash !== hashPassword(body.currentPassword)) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 })
    }
    if (String(body.newPassword).length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 })
    }
    updates.passwordHash = hashPassword(body.newPassword)
  }

  await db.collection("users").updateOne({ id: user.id }, { $set: updates })

  // Return updated user (without passwordHash)
  const updated = await db.collection("users").findOne({ id: user.id })
  if (!updated) return NextResponse.json({ error: "User not found." }, { status: 404 })
  const { _id, passwordHash, ...safeUser } = updated as any

  return NextResponse.json({ user: safeUser })
}
