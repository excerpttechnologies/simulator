import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/session";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ success: true, message: "Logged out" });
  res.cookies.delete(AUTH_COOKIE);
  return res;
}
