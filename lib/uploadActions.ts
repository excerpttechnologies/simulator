"use server"

import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"

export async function uploadFile(formData: FormData) {
  try {
    const file = formData.get("file") as File
    const type = formData.get("type") as string

    if (!file) {
      return { success: false, error: "No file uploaded" }
    }

    console.log("Server Action: File received:", file.name, "Type:", type, "Size:", file.size)

    // Validate file type
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/ogg"]
    const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"]
    
    const allowedTypes = type === "video" ? allowedVideoTypes : allowedImageTypes
    
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: `Invalid file type. Please upload ${type === "video" ? "MP4, WebM, or OGG" : "JPEG, PNG, or WebP"}`
      }
    }

    // Validate file size (500MB for video, 10MB for image)
    const maxSize = type === "video" ? 500 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        success: false,
        error: `File too large. Max ${type === "video" ? "500MB" : "10MB"}`
      }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const filename = `${timestamp}-${safeName}`
    
    // Save under public/ directory
    const uuid = randomUUID()
    const subDir = type === "video" ? "videos" : "thumbnails"
    const uploadDir = path.join(process.cwd(), "public", "uploads", subDir, uuid)
    
    await mkdir(uploadDir, { recursive: true })
    
    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)
    
    console.log(`✅ File saved: ${filePath}`)
    console.log(`📁 File size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`)
    
    const fileUrl = `/uploads/${subDir}/${uuid}/${filename}`
    
    return {
      success: true,
      url: fileUrl,
      filename: filename,
      type: type
    }
  } catch (error) {
    console.error("Upload error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed"
    }
  }
}
