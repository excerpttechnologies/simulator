import type { Role } from "./types"

const JWT_SECRET = process.env.JWT_SECRET || "saa_secret_key"
const TOKEN_EXPIRATION_MS = 8 * 60 * 60 * 1000
const COOKIE_NAME = "saa_auth_token"
const encoder = new TextEncoder()
const decoder = new TextDecoder()

function toUint8Array(value: string | Uint8Array) {
  return value instanceof Uint8Array ? value : encoder.encode(value)
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

function rightRotate(value: number, shift: number) {
  return (value >>> shift) | (value << (32 - shift))
}

function sha256(message: Uint8Array) {
  const h = new Uint32Array([
    0x6a09e667,
    0xbb67ae85,
    0x3c6ef372,
    0xa54ff53a,
    0x510e527f,
    0x9b05688c,
    0x1f83d9ab,
    0x5be0cd19,
  ])

  const k = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ])

  const messageLength = message.length
  const bitLength = messageLength * 8
  const withOne = new Uint8Array(messageLength + 1)
  withOne.set(message)
  withOne[messageLength] = 0x80

  let paddedLength = withOne.length
  while (paddedLength % 64 !== 56) paddedLength += 1

  const padded = new Uint8Array(paddedLength + 8)
  padded.set(withOne)
  const view = new DataView(padded.buffer)
  view.setUint32(padded.length - 8, Math.floor(bitLength / 0x100000000), false)
  view.setUint32(padded.length - 4, bitLength >>> 0, false)

  const w = new Uint32Array(64)

  for (let i = 0; i < padded.length; i += 64) {
    for (let j = 0; j < 16; j += 1) {
      w[j] = view.getUint32(i + j * 4, false)
    }

    for (let j = 16; j < 64; j += 1) {
      const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3)
      const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10)
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0
    }

    let a = h[0]
    let b = h[1]
    let c = h[2]
    let d = h[3]
    let e = h[4]
    let f = h[5]
    let g = h[6]
    let hh = h[7]

    for (let j = 0; j < 64; j += 1) {
      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)
      const ch = (e & f) ^ (~e & g)
      const temp1 = (hh + s1 + ch + k[j] + w[j]) >>> 0
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)
      const maj = (a & b) ^ (a & c) ^ (b & c)
      const temp2 = (s0 + maj) >>> 0

      hh = g
      g = f
      f = e
      e = (d + temp1) >>> 0
      d = c
      c = b
      b = a
      a = (temp1 + temp2) >>> 0
    }

    h[0] = (h[0] + a) >>> 0
    h[1] = (h[1] + b) >>> 0
    h[2] = (h[2] + c) >>> 0
    h[3] = (h[3] + d) >>> 0
    h[4] = (h[4] + e) >>> 0
    h[5] = (h[5] + f) >>> 0
    h[6] = (h[6] + g) >>> 0
    h[7] = (h[7] + hh) >>> 0
  }

  const digest = new Uint8Array(32)
  const digestView = new DataView(digest.buffer)
  for (let i = 0; i < 8; i += 1) {
    digestView.setUint32(i * 4, h[i], false)
  }

  return digest
}

function hmacSha256(key: string, message: string) {
  const blockSize = 64
  let keyBytes = toUint8Array(key)
  if (keyBytes.length > blockSize) {
    keyBytes = sha256(keyBytes)
  }

  if (keyBytes.length < blockSize) {
    const paddedKey = new Uint8Array(blockSize)
    paddedKey.set(keyBytes)
    keyBytes = paddedKey
  }

  const oKeyPad = new Uint8Array(blockSize)
  const iKeyPad = new Uint8Array(blockSize)

  for (let i = 0; i < blockSize; i += 1) {
    oKeyPad[i] = keyBytes[i] ^ 0x5c
    iKeyPad[i] = keyBytes[i] ^ 0x36
  }

  const innerHash = sha256(new Uint8Array([...iKeyPad, ...toUint8Array(message)]))
  const outerHash = sha256(new Uint8Array([...oKeyPad, ...innerHash]))
  return toHex(outerHash)
}

function base64UrlEncode(value: string) {
  const bytes = encoder.encode(value)
  let binary = ""
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  const base64 = typeof btoa !== "undefined" ? btoa(binary) : Buffer.from(bytes).toString("base64")
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function base64UrlDecode(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4)
  const binary = typeof atob !== "undefined" ? atob(padded) : Buffer.from(padded, "base64").toString("binary")

  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }

  return decoder.decode(bytes)
}

function signHmac(data: string) {
  return hmacSha256(JWT_SECRET, data)
}

export function hashPassword(password: string) {
  return signHmac(password)
}

export function createToken(payload: { sub: string; email: string; role: Role }) {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const body = base64UrlEncode(
    JSON.stringify({ ...payload, exp: Date.now() + TOKEN_EXPIRATION_MS })
  )
  const signature = signHmac(`${header}.${body}`)
  return `${header}.${body}.${signature}`
}

export function verifyToken(token: string) {
  try {
    const [header, body, signature] = token.split(".")
    if (!header || !body || !signature) return null

    const expected = signHmac(`${header}.${body}`)
    if (signature !== expected) return null

    const payload = JSON.parse(base64UrlDecode(body)) as { sub: string; email: string; role: Role; exp: number }
    if (payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export function getAuthCookieName() {
  return COOKIE_NAME
}
