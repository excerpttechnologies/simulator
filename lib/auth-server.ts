import { getPayloadFromRequest } from "./auth"
import { getDb } from "./mongodb"
import type { User } from "./types"

export async function getUserFromRequest(request: Request): Promise<User | null> {
  const payload = getPayloadFromRequest(request)
  if (!payload) return null

  try {
    const db = await getDb()
    const user = await db.collection<User>("users").findOne({ id: payload.sub })
    if (!user) return null
    const { _id, ...userWithoutId } = user as any
    return { ...userWithoutId, sub: user.id } as User
  } catch {
    return null
  }
}
