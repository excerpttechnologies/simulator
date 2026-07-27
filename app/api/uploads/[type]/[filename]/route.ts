import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; filename: string }> }
) {
  try {
    // IMPORTANT: Await the params Promise
    const { type, filename } = await params;
    
    console.log(`📥 Serving: ${type}/${filename}`);
    
    // Security: Only allow videos and thumbnails
    if (!["videos", "thumbnails"].includes(type)) {
      return new NextResponse("Invalid type", { status: 400 });
    }
    
    // Build file path
    const filePath = path.join(process.cwd(), "storage", type, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Not found: ${filePath}`);
      return new NextResponse("File not found", { status: 404 });
    }
    
    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Get content type
    const ext = path.extname(filePath).toLowerCase();
    const contentType = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
    }[ext] || 'application/octet-stream';
    
    console.log(`✅ Serving file: ${filename} (${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
    
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    });
    
  } catch (error) {
    console.error("Error:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}