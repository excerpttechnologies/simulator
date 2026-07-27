"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Clock, FileText, Play, Star, Users, Video, X, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import type { Course } from "@/lib/types"

interface VideoItem {
  _id: string
  title: string
  description: string
  lessonNumber: number | null
  url: string
  size: number
  createdAt: string
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export default function CourseDetailPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Videos
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [videosLoading, setVideosLoading] = useState(false)
  const [videosFetched, setVideosFetched] = useState(false)
  const [videosOpen, setVideosOpen] = useState(false)
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/courses/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.course) {
          setCourse(data.course)
        } else {
          setNotFound(true)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  async function loadVideos(courseId: string) {
    if (videosFetched) return
    setVideosLoading(true)
    try {
      const res = await fetch(`/api/courses/${courseId}/videos`)
      const data = await res.json()
      if (res.ok) setVideos(data.videos || [])
    } finally {
      setVideosLoading(false)
      setVideosFetched(true)
    }
  }

  function handleToggleVideos() {
    if (!videosOpen && !videosFetched && course) {
      loadVideos(course.id)
    }
    setVideosOpen((prev) => !prev)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (notFound || !course) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="rounded-3xl border border-neutral-200 bg-white p-10 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Course not found</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Please return to the courses dashboard and choose a different course.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/courses"
              className="inline-flex rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Back to courses
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <Link
              href="/dashboard/courses"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ChevronLeft className="h-4 w-4" /> Back to courses
            </Link>
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {course.category}
              </div>
              <h1 className="text-4xl font-semibold text-slate-950 dark:text-white">{course.title}</h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">{course.description}</p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 dark:bg-white/5">
                <Play className="h-4 w-4" /> {course.lessons} lessons
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 dark:bg-white/5">
                <Clock className="h-4 w-4" /> {course.duration}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 dark:bg-white/5">
                <Users className="h-4 w-4" /> {(course.students || 0).toLocaleString()} students
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 dark:bg-white/5">
                <Star className="h-4 w-4" /> {course.rating}
              </span>
            </div>
          </div>
        </div>

        {/* Instructor */}
        {course.instructor && (
          <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Instructor: <span className="font-medium text-slate-800 dark:text-slate-200">{course.instructor}</span>
          </div>
        )}
      </div>

      {/* Video Lessons Section */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <button
          onClick={handleToggleVideos}
          className="w-full flex items-center justify-between text-left"
        >
          <div>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Video Lessons
              {videosFetched && (
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                  ({videos.length} video{videos.length !== 1 ? "s" : ""})
                </span>
              )}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Watch video lessons for this course.</p>
          </div>
          {videosOpen ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </button>

        {videosOpen && (
          <div className="mt-6">
            {/* Active Video Player */}
            {activeVideo && (
              <div className="mb-6 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-black relative">
                <button
                  onClick={() => setActiveVideo(null)}
                  className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <video
                  key={activeVideo._id}
                  controls
                  autoPlay
                  className="w-full max-h-[480px]"
                  src={activeVideo.url}
                >
                  Your browser does not support the video tag.
                </video>
                <div className="px-4 py-3 bg-white dark:bg-neutral-950">
                  <p className="font-medium text-slate-900 dark:text-white">{activeVideo.title}</p>
                  {activeVideo.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{activeVideo.description}</p>
                  )}
                </div>
              </div>
            )}

            {/* Video List */}
            {videosLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : videos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8 text-center">
                <Video className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No video lessons uploaded yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {videos.map((video) => (
                  <button
                    key={video._id}
                    onClick={() => setActiveVideo(activeVideo?._id === video._id ? null : video)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-colors border ${
                      activeVideo?._id === video._id
                        ? "bg-primary/10 border-primary/20 text-primary"
                        : "bg-slate-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-primary/30 text-slate-900 dark:text-white"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      {video.lessonNumber ? (
                        <span className="text-sm font-bold text-primary">{video.lessonNumber}</span>
                      ) : (
                        <Play className={`h-4 w-4 ${activeVideo?._id === video._id ? "fill-primary text-primary" : "text-primary"}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{video.title}</p>
                      {video.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{video.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">{formatFileSize(video.size)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modules & Assignments */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Modules */}
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Course Modules</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Review the module structure and lesson plan for this course.
          </p>
          <div className="mt-6 space-y-4">
            {(course.modules || []).length === 0 ? (
              <div className="rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                No modules added yet.
              </div>
            ) : (
              course.modules.map((module: any, i: number) => (
                <div
                  key={module.id || i}
                  className="rounded-3xl border border-neutral-200 p-4 dark:border-neutral-800"
                >
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{module.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{module.description}</p>
                  {Array.isArray(module.lessons) && module.lessons.length > 0 && (
                    <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <p className="font-medium">Lessons</p>
                      <ul className="list-disc space-y-1 pl-5">
                        {module.lessons.map((lesson: string, li: number) => (
                          <li key={li}>{lesson}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(module.resources) && module.resources.length > 0 && (
                    <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                      <p className="font-medium">Resources</p>
                      <ul className="list-disc space-y-1 pl-5">
                        {module.resources.map((resource: any, ri: number) => (
                          <li key={ri}>{resource.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Assignments */}
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 xl:col-span-2">
          <div>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Assignments & Resources</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Complete these tasks as you progress through the course.
            </p>
          </div>
          <div className="mt-6 space-y-4">
            {(course.assignments || []).length > 0 ? (
              (course.assignments as string[]).map((assignment, i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-neutral-200 bg-slate-50 p-4 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <p className="font-medium text-slate-900 dark:text-white">{assignment}</p>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-neutral-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-400">
                No assignments have been added to this course yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
