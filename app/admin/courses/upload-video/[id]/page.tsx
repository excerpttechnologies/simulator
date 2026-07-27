"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Upload,
  ArrowLeft,
  Video,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Play,
  FileVideo,
  X,
  Clock,
  Hash,
} from "lucide-react"

interface VideoItem {
  _id: string
  title: string
  description: string
  lessonNumber: number | null
  url: string
  size: number
  mimeType: string
  originalName: string
  createdAt: string
}

export default function UploadVideoPage() {
const { id: courseId } = useParams<{ id: string }>()
  const router = useRouter()

  // Existing videos
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loadingVideos, setLoadingVideos] = useState(true)

  // Upload form state
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [lessonNumber, setLessonNumber] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [uploadMessage, setUploadMessage] = useState("")

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchVideos()
  }, [courseId])

  async function fetchVideos() {
    setLoadingVideos(true)
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/videos`)
      const data = await res.json()
      if (res.ok) setVideos(data.videos || [])
    } catch {
      // silently fail
    } finally {
      setLoadingVideos(false)
    }
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("video/")) {
      setSelectedFile(file)
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "))
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "))
    }
  }

  async function handleUpload() {
    if (!selectedFile || !title.trim()) return

    setUploading(true)
    setUploadProgress(0)
    setUploadStatus("idle")

    const formData = new FormData()
    formData.append("video", selectedFile)
    formData.append("title", title.trim())
    formData.append("description", description.trim())
    if (lessonNumber) formData.append("lessonNumber", lessonNumber)

    // Simulate progress using XHR for real progress tracking
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100))
        }
      })

      xhr.addEventListener("load", () => {
        if (xhr.status === 201) {
          setUploadStatus("success")
          setUploadMessage("Video uploaded successfully!")
          setSelectedFile(null)
          setTitle("")
          setDescription("")
          setLessonNumber("")
          setUploadProgress(0)
          fetchVideos()
          resolve()
        } else {
          try {
            const data = JSON.parse(xhr.responseText)
            setUploadMessage(data.error || "Upload failed.")
          } catch {
            setUploadMessage("Upload failed.")
          }
          setUploadStatus("error")
          reject()
        }
      })

      xhr.addEventListener("error", () => {
        setUploadMessage("Network error during upload.")
        setUploadStatus("error")
        reject()
      })

      xhr.withCredentials = true
      xhr.open("POST", `/api/admin/courses/${courseId}/videos`)
      xhr.send(formData)
    }).catch(() => {})

    setUploading(false)
  }

  async function handleDelete(videoId: string) {
    if (!confirm("Delete this video? This cannot be undone.")) return
    setDeletingId(videoId)
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/videos/${videoId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setVideos((prev) => prev.filter((v) => v._id !== videoId))
      }
    } finally {
      setDeletingId(null)
    }
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/courses">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Courses
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Course Videos</h1>
          <p className="text-sm text-muted-foreground">Upload and manage video lessons for this course.</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload New Video
        </h2>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
          onClick={() => !selectedFile && fileInputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer
            ${dragOver
              ? "border-primary bg-primary/5 scale-[1.01]"
              : selectedFile
              ? "border-accent bg-accent/5 cursor-default"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
            } p-8 flex flex-col items-center justify-center gap-3 min-h-[160px]`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo"
            className="hidden"
            onChange={handleFileSelect}
          />

          {selectedFile ? (
            <>
              <FileVideo className="h-10 w-10 text-accent" />
              <div className="text-center">
                <p className="font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }}
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </>
          ) : (
            <>
              <Video className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <p className="font-medium text-foreground">Drop video here or click to browse</p>
                <p className="text-sm text-muted-foreground">MP4, WebM, OGG, MOV, AVI — max 500MB</p>
              </div>
            </>
          )}
        </div>

        {/* Form Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Video Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to GST Filing"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1">
              <Hash className="h-3 w-3" />
              Lesson Number
            </label>
            <input
              type="number"
              value={lessonNumber}
              onChange={(e) => setLessonNumber(e.target.value)}
              placeholder="e.g. 1"
              min={1}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of what this lesson covers..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-colors resize-none"
          />
        </div>

        {/* Upload Progress */}
        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Uploading...
                </span>
                <span className="font-medium text-foreground">{uploadProgress}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Message */}
        <AnimatePresence>
          {uploadStatus !== "idle" && !uploading && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium
                ${uploadStatus === "success"
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}
            >
              {uploadStatus === "success"
                ? <CheckCircle2 className="h-4 w-4" />
                : <AlertCircle className="h-4 w-4" />
              }
              {uploadMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          className="w-full sm:w-auto"
          onClick={handleUpload}
          disabled={!selectedFile || !title.trim() || uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading ({uploadProgress}%)...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Video
            </>
          )}
        </Button>
      </div>

      {/* Existing Videos List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Play className="h-5 w-5 text-primary" />
          Uploaded Videos
          {!loadingVideos && (
            <span className="text-sm font-normal text-muted-foreground">({videos.length})</span>
          )}
        </h2>

        {loadingVideos ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : videos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
            <Video className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No videos uploaded yet for this course.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {videos.map((video, i) => (
              <motion.div
                key={video._id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  {video.lessonNumber ? (
                    <span className="text-lg font-bold text-primary">{video.lessonNumber}</span>
                  ) : (
                    <Video className="h-5 w-5 text-primary" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{video.title}</p>
                  {video.description && (
                    <p className="text-sm text-muted-foreground truncate">{video.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(video.createdAt).toLocaleDateString()}
                    </span>
                    <span>{formatFileSize(video.size)}</span>
                    <span>{video.originalName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a href={video.url} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm">
                      <Play className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(video._id)}
                    disabled={deletingId === video._id}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                  >
                    {deletingId === video._id
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <Trash2 className="h-3 w-3" />
                    }
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}