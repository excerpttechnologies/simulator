// "use client"

// import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react"
// import { Loader2, Trash2, Upload } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { cn } from "@/lib/utils"

// interface VideoUploaderProps {
//   value: string | null
//   onChange: (url: string | null) => void
//   label: string
//   mode?: "video" | "image"
// }

// const MAX_VIDEO_SIZE = 350 * 1024 * 1024
// const MAX_IMAGE_SIZE = 8 * 1024 * 1024

// export function VideoUploader({ value, onChange, label, mode = "video" }: VideoUploaderProps) {
//   const [uploadState, setUploadState] = useState<"idle" | "uploading" | "error">("idle")
//   const [progress, setProgress] = useState(0)
//   const [errorMessage, setErrorMessage] = useState<string | null>(null)
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null)
//   const inputRef = useRef<HTMLInputElement | null>(null)

//   const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
//   const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

//   const acceptedTypes = useMemo(() => {
//     return mode === "video" ? "video/mp4,video/webm" : "image/png,image/jpeg,image/webp"
//   }, [mode])

//   useEffect(() => {
//     if (value) {
//       setPreviewUrl(value)
//     }
//   }, [value])

//   function resetState() {
//     setUploadState("idle")
//     setProgress(0)
//     setErrorMessage(null)
//   }

//   function validateFile(file: File) {
//     const maxSize = mode === "video" ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
//     if (!file.type.startsWith(mode)) {
//       return `Only ${mode} files are supported.`
//     }
//     if (file.size > maxSize) {
//       return `File must be smaller than ${mode === "video" ? "350MB" : "8MB"}.`
//     }
//     return null
//   }

//   async function uploadFile(file: File) {
//     if (!cloudName || !uploadPreset) {
//       throw new Error("Cloudinary configuration is missing.")
//     }

//     return new Promise<string>((resolve, reject) => {
//       const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${mode}/upload`
//       const formData = new FormData()
//       formData.append("file", file)
//       formData.append("upload_preset", uploadPreset)
//       formData.append("folder", "Accountin/simulations")

//       const xhr = new XMLHttpRequest()
//       xhr.open("POST", endpoint)

//       xhr.upload.onprogress = (event) => {
//         if (event.lengthComputable) {
//           setProgress(Math.round((event.loaded / event.total) * 100))
//         }
//       }

//       xhr.onload = () => {
//         if (xhr.status >= 200 && xhr.status < 300) {
//           const response = JSON.parse(xhr.responseText)
//           resolve(response.secure_url)
//         } else {
//           reject(new Error("Upload failed. Please try again."))
//         }
//       }

//       xhr.onerror = () => reject(new Error("Upload failed. Please check your network."))
//       xhr.send(formData)
//     })
//   }

//   async function handleFile(event: ChangeEvent<HTMLInputElement>) {
//     const file = event.target.files?.[0]
//     if (!file) return

//     const error = validateFile(file)
//     if (error) {
//       setUploadState("error")
//       setErrorMessage(error)
//       return
//     }

//     try {
//       resetState()
//       setUploadState("uploading")
//       const url = await uploadFile(file)
//       onChange(url)
//       setPreviewUrl(url)
//       setUploadState("idle")
//     } catch (uploadError) {
//       setUploadState("error")
//       setErrorMessage(uploadError instanceof Error ? uploadError.message : String(uploadError))
//     }
//   }

//   function handleRemove() {
//     onChange(null)
//     setPreviewUrl(null)
//     if (inputRef.current) {
//       inputRef.current.value = ""
//     }
//     resetState()
//   }

//   return (
//     <div className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
//       <div className="mb-4 flex items-center justify-between gap-4">
//         <div>
//           <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{label}</h3>
//           <p className="text-sm text-slate-500 dark:text-slate-400">Drag, drop, or click to upload {mode} content.</p>
//         </div>
//         {previewUrl ? (
//           <Button variant="outline" size="sm" onClick={handleRemove} className="gap-2">
//             <Trash2 className="h-4 w-4" /> Remove
//           </Button>
//         ) : null}
//       </div>

//       <label
//         className={cn(
//           "group flex min-h-[180px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-neutral-300 bg-slate-50 px-5 py-12 text-center transition-colors duration-200 hover:border-primary hover:bg-slate-100 dark:border-neutral-700 dark:bg-neutral-900/70 dark:hover:border-primary",
//           previewUrl ? "border-transparent bg-transparent dark:border-transparent" : "",
//         )}
//       >
//         {previewUrl ? (
//           mode === "video" ? (
//             <video
//               src={previewUrl}
//               controls
//               className="h-52 w-full rounded-3xl object-cover"
//             />
//           ) : (
//             <img src={previewUrl} alt="Preview" className="mx-auto h-52 w-full rounded-3xl object-cover" />
//           )
//         ) : (
//           <>
//             <Upload className="mb-4 h-8 w-8 text-primary" />
//             <p className="text-sm font-medium text-slate-900 dark:text-white">Click or drop a {mode} file</p>
//             <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Accepted: {acceptedTypes}. Max size: {mode === "video" ? "350MB" : "8MB"}.</p>
//           </>
//         )}
//         <input
//           ref={inputRef}
//           type="file"
//           accept={acceptedTypes}
//           className="sr-only"
//           onChange={handleFile}
//         />
//       </label>

//       {uploadState === "uploading" && (
//         <div className="mt-4 rounded-2xl bg-slate-100 p-3 dark:bg-neutral-900">
//           <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
//             <span>Uploading</span>
//             <span>{progress}%</span>
//           </div>
//           <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-neutral-800">
//             <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
//           </div>
//         </div>
//       )}

//       {uploadState === "error" && errorMessage ? (
//         <p className="mt-4 text-sm text-destructive">{errorMessage}</p>
//       ) : null}

//       {mode === "video" && !previewUrl && !cloudName ? (
//         <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Cloudinary upload is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.</p>
//       ) : null}
//     </div>
//   )
// }



"use client";

import { useState, useCallback, useEffect } from "react";
import { Upload, X, Video, Image } from "lucide-react";

interface VideoUploaderProps {
  label: string;
  mode: "video" | "image";
  value?: string;
  onChange: (url: string | null) => void;
}

export function VideoUploader({ label, mode, value, onChange }: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);

  useEffect(() => {
    setPreviewUrl(value || null);
  }, [value]);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", mode);
    
    try {
      console.log("Starting upload for:", file.name, "Size:", file.size);
      
      // Try the API route first
      const response = await fetch("/api/admin/upload/video", {
        method: "POST",
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary
      });
      
      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          throw new Error(`Upload failed with status ${response.status}`);
        }
        throw new Error(errorData.error || "Upload failed");
      }
      
      const data = await response.json();
      console.log("Upload success:", data.url);
      
      setPreviewUrl(data.url);
      onChange(data.url);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      console.error("Upload error:", err);
      
      // Show more detailed error in UI
      if (errorMessage.includes("FormData")) {
        setError("Upload configuration error. Please restart the development server.");
      } else {
        setError(errorMessage);
      }
      
      onChange(null);
    } finally {
      setUploading(false);
    }
  }, [mode, onChange]);
  
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size
    const maxSize = mode === "video" ? 500 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File too large. Max ${mode === "video" ? "500MB" : "10MB"}`);
      return;
    }
    
    // Validate file type
    const validVideoTypes = ["video/mp4", "video/webm", "video/ogg"];
    const validImageTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const validTypes = mode === "video" ? validVideoTypes : validImageTypes;
    
    if (!validTypes.includes(file.type)) {
      setError(`Invalid file type. Please upload ${mode === "video" ? "MP4, WebM, or OGG" : "JPEG, PNG, or WebP"}`);
      return;
    }
    
    handleUpload(file);
  }, [mode, handleUpload]);
  
  const removeFile = useCallback(() => {
    setPreviewUrl(null);
    onChange(null);
    setError(null);
  }, [onChange]);
  
  const inputId = `upload-${mode}-${Date.now()}`;
  const isVideo = mode === "video";
  const Icon = isVideo ? Video : Image;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-900 dark:text-white">
          {label}
        </label>
        {previewUrl && (
          <button
            type="button"
            onClick={removeFile}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-neutral-800"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {!previewUrl ? (
        <div className="relative">
          <input
            type="file"
            id={inputId}
            className="hidden"
            accept={isVideo ? "video/mp4,video/webm,video/ogg" : "image/jpeg,image/png,image/webp"}
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <label
            htmlFor={inputId}
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-slate-50 p-8 transition-all cursor-pointer hover:border-primary hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-primary dark:hover:bg-neutral-800 ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {uploading ? (
              <div className="text-center">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Uploading...</p>
              </div>
            ) : (
              <>
                <Upload className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Click to upload {isVideo ? "video" : "thumbnail"}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                  {isVideo 
                    ? "MP4, WebM, or OGG (max 500MB)" 
                    : "JPEG, PNG, or WebP (max 10MB)"}
                </p>
              </>
            )}
          </label>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-slate-50 dark:border-neutral-800 dark:bg-neutral-900">
          {isVideo ? (
            <video
              src={previewUrl}
              controls
              className="w-full max-h-[300px] object-contain"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={previewUrl}
              alt="Thumbnail"
              className="w-full max-h-[200px] object-contain"
              onError={(e) => {
                console.error("Image failed to load:", previewUrl);
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}