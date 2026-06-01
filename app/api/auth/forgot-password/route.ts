import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid email" }, { status: 400 });
    }

    await connectDB();
    // Always return success to prevent email enumeration
    await User.findOne({ email: parsed.data.email });

    return NextResponse.json({
      success: true,
      message: "If that email exists, a reset link has been sent",
    });
  } catch (err) {
    console.error("[FORGOT_PASSWORD]", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
