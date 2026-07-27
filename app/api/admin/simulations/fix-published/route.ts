import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-server"
import { authorizeRoles } from "@/lib/auth"
import { connectMongoose } from "@/lib/mongoose"
import SimulationModel from "@/lib/models/Simulation"

/**
 * POST /api/admin/simulations/fix-published
 * One-time repair: syncs the `published` boolean to match the `status` field
 * for all simulations in the database.
 * Only accessible by Admin.
 */
export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user || !authorizeRoles(user, "Admin")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 })
  }

  await connectMongoose()

  // Fix all published simulations where the boolean flag is wrong
  const publishedFix = await SimulationModel.updateMany(
    { status: "published", published: { $ne: true } },
    { $set: { published: true } }
  )

  // Fix all non-published simulations where the boolean flag is wrong
  const unpublishedFix = await SimulationModel.updateMany(
    { status: { $in: ["draft", "archived"] }, published: true },
    { $set: { published: false } }
  )

  const totalFixed = publishedFix.modifiedCount + unpublishedFix.modifiedCount

  console.log(`Fixed ${publishedFix.modifiedCount} published, ${unpublishedFix.modifiedCount} unpublished simulations`)

  return NextResponse.json({
    ok: true,
    fixed: totalFixed,
    publishedFixed: publishedFix.modifiedCount,
    unpublishedFixed: unpublishedFix.modifiedCount,
    message: `Synced published flag for ${totalFixed} simulation(s).`,
  })
}
