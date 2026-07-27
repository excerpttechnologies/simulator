// import { NextResponse, NextRequest } from "next/server"
// import { getPayloadFromRequest, authorizeRoles } from "@/lib/auth"
// import { getDb } from "@/lib/mongodb"
// import { ObjectId } from "mongodb"
// import { writeFile, mkdir } from "fs/promises"
// import path from "path"
// import { existsSync } from "fs"

// export async function POST(
//   request: NextRequest,
//   { params }: { params: Promise<{ courseId: string }> }
// ) {
//   const payload = getPayloadFromRequest(request)
//   if (!payload) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//   }
//   if (!authorizeRoles(payload, "Admin")) {
//     return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 })
//   }

//   const { courseId } = await params

//   if (!courseId || courseId.trim() === "") {
//     return NextResponse.json({ error: "Invalid course ID" }, { status: 400 })
//   }

//   let formData: FormData
//   try {
//     formData = await request.formData()
//   } catch {
//     return NextResponse.json({ error: "Failed to parse form data" }, { status: 400 })
//   }

//   const file = formData.get("video") as File | null
//   const title = formData.get("title") as string | null
//   const description = formData.get("description") as string | null
//   const lessonNumber = formData.get("lessonNumber") as string | null

//   if (!file || !title) {
//     return NextResponse.json({ error: "Video file and title are required" }, { status: 400 })
//   }

//   const allowedTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"]
//   if (!allowedTypes.includes(file.type)) {
//     return NextResponse.json(
//       { error: "Invalid file type. Allowed: mp4, webm, ogg, mov, avi" },
//       { status: 400 }
//     )
//   }

//   const MAX_SIZE = 500 * 1024 * 1024
//   if (file.size > MAX_SIZE) {
//     return NextResponse.json({ error: "File too large. Max 500MB." }, { status: 400 })
//   }

//   const uploadDir = path.join(process.cwd(), "public", "uploads", "videos", courseId)
//   if (!existsSync(uploadDir)) {
//     await mkdir(uploadDir, { recursive: true })
//   }

//   const timestamp = Date.now()
//   const safeFileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`
//   const filePath = path.join(uploadDir, safeFileName)

//   const arrayBuffer = await file.arrayBuffer()
//   await writeFile(filePath, Buffer.from(arrayBuffer))

//   const videoUrl = `/uploads/videos/${courseId}/${safeFileName}`

//   const db = await getDb()

//   const videoDoc = {
//     courseId: courseId,
//     title: title.trim(),
//     description: description?.trim() || "",
//     lessonNumber: lessonNumber ? parseInt(lessonNumber, 10) : null,
//     fileName: safeFileName,
//     originalName: file.name,
//     mimeType: file.type,
//     size: file.size,
//     url: videoUrl,
//     uploadedBy: payload.sub,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   }

//   const result = await db.collection("course_videos").insertOne(videoDoc)

//   return NextResponse.json(
//     {
//       message: "Video uploaded successfully",
//       video: { ...videoDoc, _id: result.insertedId },
//     },
//     { status: 201 }
//   )
// }

// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ courseId: string }> }
// ) {
//   const payload = getPayloadFromRequest(request)
//   if (!payload) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//   }
//   if (!authorizeRoles(payload, "Admin")) {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 })
//   }

//   const { courseId } = await params

//   if (!courseId || courseId.trim() === "") {
//     return NextResponse.json({ error: "Invalid course ID" }, { status: 400 })
//   }

//   const db = await getDb()
//   const videos = await db
//     .collection("course_videos")
//     .find({ courseId: courseId })
//     .sort({ lessonNumber: 1, createdAt: 1 })
//     .toArray()

//   return NextResponse.json({ videos })
// }























/////////////////










import { NextResponse, NextRequest } from "next/server"
import { getPayloadFromRequest, authorizeRoles } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { existsSync } from "fs"

// export async function POST(
//   request: NextRequest,
//   { params }: { params: Promise<{ courseId: string }> }
// ) {
//   const payload = getPayloadFromRequest(request)
//   if (!payload) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//   }
//   if (!authorizeRoles(payload, "Admin")) {
//     return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 })
//   }

//   const { courseId } = await params

//   if (!courseId || courseId.trim() === "") {
//     return NextResponse.json({ error: "Invalid course ID" }, { status: 400 })
//   }

//   let formData: FormData
//   try {
//     formData = await request.formData()
//   } catch {
//     return NextResponse.json({ error: "Failed to parse form data" }, { status: 400 })
//   }

//   const file = formData.get("video") as File | null
//   const title = formData.get("title") as string | null
//   const description = formData.get("description") as string | null
//   const lessonNumber = formData.get("lessonNumber") as string | null

//   if (!file || !title) {
//     return NextResponse.json({ error: "Video file and title are required" }, { status: 400 })
//   }

//   const allowedTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"]
//   if (!allowedTypes.includes(file.type)) {
//     return NextResponse.json(
//       { error: "Invalid file type. Allowed: mp4, webm, ogg, mov, avi" },
//       { status: 400 }
//     )
//   }

//   const MAX_SIZE = 500 * 1024 * 1024
//   if (file.size > MAX_SIZE) {
//     return NextResponse.json({ error: "File too large. Max 500MB." }, { status: 400 })
//   }

//   const uploadDir = path.join(process.cwd(), "public", "uploads", "videos", courseId)
//   if (!existsSync(uploadDir)) {
//     await mkdir(uploadDir, { recursive: true })
//   }

//   const timestamp = Date.now()
//   const safeFileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`
//   const filePath = path.join(uploadDir, safeFileName)

//   const arrayBuffer = await file.arrayBuffer()
//   await writeFile(filePath, Buffer.from(arrayBuffer))

//   const videoUrl = `/uploads/videos/${courseId}/${safeFileName}`

//   const db = await getDb()

//   const videoDoc = {
//     courseId: courseId,
//     title: title.trim(),
//     description: description?.trim() || "",
//     lessonNumber: lessonNumber ? parseInt(lessonNumber, 10) : null,
//     fileName: safeFileName,
//     originalName: file.name,
//     mimeType: file.type,
//     size: file.size,
//     url: videoUrl,
//     uploadedBy: payload.sub,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   }

//   const result = await db.collection("course_videos").insertOne(videoDoc)

//   return NextResponse.json(
//     {
//       message: "Video uploaded successfully",
//       video: { ...videoDoc, _id: result.insertedId },
//     },
//     { status: 201 }
//   )
// }









export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  console.log("VIDEO API HIT");

  const payload = getPayloadFromRequest(request);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!authorizeRoles(payload, "Admin")) {
    return NextResponse.json(
      { error: "Forbidden: Admins only" },
      { status: 403 }
    );
  }

  const { courseId } = await params;

  if (!courseId || courseId.trim() === "") {
    return NextResponse.json(
      { error: "Invalid course ID" },
      { status: 400 }
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch (error) {
    console.error("FORM DATA ERROR:", error);
    return NextResponse.json(
      { error: "Failed to parse form data" },
      { status: 400 }
    );
  }

  const file = formData.get("video") as File | null;
  const title = formData.get("title") as string | null;
  const description = formData.get("description") as string | null;
  const lessonNumber = formData.get("lessonNumber") as string | null;

  console.log("FILE:", file?.name);
  console.log("FILE SIZE:", file?.size);
  console.log("TITLE:", title);

  if (!file || !title) {
    return NextResponse.json(
      { error: "Video file and title are required" },
      { status: 400 }
    );
  }

  const allowedTypes = [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    "video/x-msvideo",
  ];

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Allowed: mp4, webm, ogg, mov, avi" },
      { status: 400 }
    );
  }

  const MAX_SIZE = 500 * 1024 * 1024;

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Max 500MB." },
      { status: 400 }
    );
  }

  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "videos",
    courseId
  );

  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const timestamp = Date.now();
  const safeFileName = `${timestamp}-${file.name.replace(
    /[^a-zA-Z0-9._-]/g,
    "_"
  )}`;

  const filePath = path.join(uploadDir, safeFileName);

  console.log("Saving file:", filePath);

  const arrayBuffer = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(arrayBuffer));

  const videoUrl = `/uploads/videos/${courseId}/${safeFileName}`;

  const db = await getDb();

  const videoDoc = {
    courseId,
    title: title.trim(),
    description: description?.trim() || "",
    lessonNumber: lessonNumber
      ? parseInt(lessonNumber, 10)
      : null,
    fileName: safeFileName,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
    url: videoUrl,
    uploadedBy: payload.sub,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db
    .collection("course_videos")
    .insertOne(videoDoc);

  return NextResponse.json(
    {
      message: "Video uploaded successfully",
      video: {
        ...videoDoc,
        _id: result.insertedId,
      },
    },
    { status: 201 }
  );
}




export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const payload = getPayloadFromRequest(request)
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!authorizeRoles(payload, "Admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { courseId } = await params

  if (!courseId || courseId.trim() === "") {
    return NextResponse.json({ error: "Invalid course ID" }, { status: 400 })
  }

  const db = await getDb()
  const videos = await db
    .collection("course_videos")
    .find({ courseId: courseId })
    .sort({ lessonNumber: 1, createdAt: 1 })
    .toArray()

  return NextResponse.json({ videos })
}