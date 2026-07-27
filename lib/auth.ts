import type { Role } from "./types"
import { getAuthCookieName } from "./security"
import { verifyToken } from "./security"

export { getAuthCookieName }
export { createToken, hashPassword } from "./security"

export type AuthPayload = {
  sub: string
  email: string
  role: Role
  exp: number
}

export function getPayloadFromToken(token: string | undefined) {
  if (!token) return null
  return verifyToken(token)
}

export function getPayloadFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") || ""
  const cookieName = getAuthCookieName()

  const entry = cookieHeader
    .split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith(`${cookieName}=`))

  if (!entry) return null

  // Use indexOf to avoid truncating tokens that contain "=" (base64 padding)
  const token = entry.slice(cookieName.length + 1)

  if (!token) return null
  return getPayloadFromToken(token)
}

export function authorizeRoles(user: { role: Role } | null, ...allowedRoles: Role[]) {
  if (!user) return false
  return allowedRoles.includes(user.role)
}
