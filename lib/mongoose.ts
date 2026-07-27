import mongoose from "mongoose"
import dns from "dns"

// Override DNS servers in Node.js to bypass local SRV resolution failures
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  console.warn("Failed to set DNS servers:", e);
}


const dbName = process.env.MONGODB_DB || "saa_accounting_platform"

declare global {
  var mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined
}

const cached = globalThis.mongooseCache || { conn: null, promise: null }
if (!globalThis.mongooseCache) {
  globalThis.mongooseCache = cached
}

export async function connectMongoose(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is not set. Add it to your .env.local file.")
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(`${mongoUri}`, {
      dbName,
      bufferCommands: false,
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    cached.promise = null
    throw err
  }

  return cached.conn
}
