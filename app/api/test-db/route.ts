import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dns from "dns";

// Override Node.js DNS servers if querySrv ECONNREFUSED occurs
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  console.warn("Failed to set DNS servers:", e);
}

export async function GET() {
  try {
    console.log("Connecting...");

    await mongoose.connect(process.env.MONGODB_URI!);

    console.log("MongoDB Connected");

    return NextResponse.json({
      success: true,
      message: "Connected",
    });
  } catch (error: any) {
    console.error("DB ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
