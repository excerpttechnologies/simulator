import { MongoClient, Db } from "mongodb"
import dns from "dns"

// Override DNS servers in Node.js to bypass local SRV resolution failures
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  console.warn("Failed to set DNS servers:", e);
}


const dbName = process.env.MONGODB_DB || "saa_accounting_platform"

let client: MongoClient | null = null
let db: Db | null = null

export async function getDb(): Promise<Db> {
  if (db) return db

  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error(
      "MONGODB_URI environment variable is not set. Add it to your .env.local file."
    )
  }

  if (!client) {
    client = new MongoClient(uri, {
      // Reasonable timeouts so errors surface quickly
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    })
  }

  try {
    await client.connect()
    db = client.db(dbName)
    return db
  } catch (error) {
    // Reset so next call retries with a fresh client
    client = null
    db = null
    throw new Error(
      `Failed to connect to MongoDB: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
