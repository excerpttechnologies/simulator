import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-server"
import { getDb } from "@/lib/mongodb"

export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })

  const db = await getDb()

  const users = await db.collection("users").find({}, {
    projection: { id: 1, name: 1, role: 1 }
  }).toArray()

  const attempts = await db.collection("simulation_attempts")
    .find({ status: "completed" })
    .toArray()

  const memberMap = new Map<string, { id: string; name: string; role: string; scores: number[]; count: number }>()
  for (const u of users) {
    if (!u.id || !u.name) continue
    memberMap.set(u.id, { id: u.id, name: u.name, role: u.role, scores: [], count: 0 })
  }
  for (const attempt of attempts) {
    const entry = memberMap.get(attempt.userId)
    if (entry) { entry.scores.push(attempt.score ?? 0); entry.count++ }
  }

  const members = Array.from(memberMap.values())
    .map((m) => ({
      id: m.id, name: m.name, role: m.role,
      simulationsCompleted: m.count,
      avgScore: m.scores.length ? Math.round(m.scores.reduce((a, b) => a + b, 0) / m.scores.length) : 0,
    }))
    .sort((a, b) => b.avgScore - a.avgScore || b.simulationsCompleted - a.simulationsCompleted)
    .map((m, i) => ({ ...m, rank: i + 1 }))

  const allScores = attempts.map((a) => a.score ?? 0).filter(Boolean)
  const avgScore = allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0

  return NextResponse.json({
    members,
    stats: { totalMembers: members.length, avgScore, totalSimulations: attempts.length },
  })
}
