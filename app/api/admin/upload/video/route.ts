// import { NextRequest, NextResponse } from "next/server";
// import { writeFile, mkdir } from "fs/promises";
// import path from "path";
// import { getUserFromRequest } from "@/lib/auth-server";
// import { authorizeRoles } from "@/lib/auth";

// export async function POST(req: NextRequest) {
//   try {
//     const user = await getUserFromRequest(req);
//     if (!user || !authorizeRoles(user, "Admin")) {
//       return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
//     }

//     const formData = await req.formData();
//     const file = formData.get("file") as File;
//     const type = formData.get("type") as string; // 'video' or 'image'

//     if (!file) {
//       return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//     }

//     // Validate file type
//     const allowedVideoTypes = ["video/mp4", "video/webm", "video/ogg"];
//     const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    
//     const allowedTypes = type === "video" ? allowedVideoTypes : allowedImageTypes;
    
//     if (!allowedTypes.includes(file.type)) {
//       return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
//     }

//     // Generate unique filename
//     const timestamp = Date.now();
//     const randomString = Math.random().toString(36).substring(2, 15);
//     const extension = file.name.split(".").pop();
//     const filename = `${type}_${timestamp}_${randomString}.${extension}`;
    
//     // Determine storage directory
//     const uploadDir = type === "video" 
//       ? path.join(process.cwd(), "storage", "videos")
//       : path.join(process.cwd(), "storage", "thumbnails");
    
//     // Create directory if it doesn't exist
//     await mkdir(uploadDir, { recursive: true });
    
//     // Convert file to buffer and save
//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);
//     const filePath = path.join(uploadDir, filename);
//     await writeFile(filePath, buffer);
    
//     // Return the URL path for frontend access
//     const fileUrl = `/api/uploads/${type === "video" ? "videos" : "thumbnails"}/${filename}`;
    
//     return NextResponse.json({ 
//       success: true, 
//       url: fileUrl,
//       filename: filename 
//     });
    
//   } catch (error) {
//     console.error("Upload error:", error);
//     return NextResponse.json({ error: "Upload failed" }, { status: 500 });
//   }
// }





import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// Configure route to handle large file uploads
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for large uploads

export async function POST(req: NextRequest) {
  try {
    // Log request details for debugging
    console.log("Upload request received");
    console.log("Content-Type:", req.headers.get("content-type"));
    
    // Get form data with error handling
    let formData;
    try {
      formData = await req.formData();
    } catch (parseError) {
      console.error("FormData parse error:", parseError);
      return NextResponse.json(
        { error: "Failed to parse form data. Ensure you're sending multipart/form-data." },
        { status: 400 }
      );
    }

    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // 'video' or 'image'

    console.log("File received:", file?.name, "Type:", type);

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/ogg"];
    const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    
    const allowedTypes = type === "video" ? allowedVideoTypes : allowedImageTypes;
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Please upload ${type === "video" ? "MP4, WebM, or OGG" : "JPEG, PNG, or WebP"}` },
        { status: 400 }
      );
    }

    // Validate file size (500MB for video, 10MB for image)
    const maxSize = type === "video" ? 500 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max ${type === "video" ? "500MB" : "10MB"}` },
        { status: 400 }
      );
    }

    // Generate unique filename with sanitized original name
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${timestamp}-${safeName}`;
    
    // ✅ Save under public/ so Next.js serves it directly
    const uuid = randomUUID();
    const subDir = type === "video" ? "videos" : "thumbnails";
    const uploadDir = path.join(process.cwd(), "public", "uploads", subDir, uuid);
    
    // Create directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true });
    
    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    
    console.log(`✅ File saved: ${filePath}`);
    console.log(`📁 File size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
    
    // ✅ Return a URL the browser can directly fetch (no API route needed)
    const fileUrl = `/uploads/${subDir}/${uuid}/${filename}`;
    
    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      filename: filename,
      type: type
    });
    
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };