import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { ADMIN_USER } from "@/lib/auth-config";

export const runtime = "nodejs";

// To re-enable database auth: restore connectDB + User.findById(session.userId).
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user: {
      id: ADMIN_USER.id,
      name: ADMIN_USER.name,
      username: ADMIN_USER.username,
      email: ADMIN_USER.email,
      role: ADMIN_USER.role,
      isActive: true,
    },
  });
}
