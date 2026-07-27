"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Play,
  Clock,
  CheckCircle2,
  Star,
  Search,
  BookOpen,
  ArrowRight,
  Users,
  Video,
  FileText,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  GraduationCap,
  Edit,
} from "lucide-react"

type CourseStatus = "admin" | "faculty" | "enrolled" | "available" | "completed"

interface Course {
  id: string
  slug: string
  title: string
  description: string
  category: string
  instructor: string
  duration: string
  lessons: number
  rating: number
  students: number
  enrolledCount: number
  modules: any[]
  assignments: string[]
  progress: number
  status: CourseStatus
}

interface VideoItem {
  _id: string
  title: string
  description: string
  lessonNumber: number | null
  url: string
  size: number
  createdAt: string
}

interface AuthUser {
  id: string
  role: "Admin" | "Faculty" | "Student"
  name: string
}

const categories = ["All", "GST", "TDS", "Income Tax", "VAT", "EPFO", "Accounting", "Banking", "Payroll"]

function useCurrentUser() {
  const [user, setUser] = useState<AuthUser | null>(null)
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d?.user ?? null))
      .catch(() => setUser(null))
  }, [])
  return user
}

function CourseVideos({ courseId }: { courseId: string }) {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null)

  async function loadVideos() {
    if (fetched) return
    setLoading(true)
    try {
      const res = await fetch(`/api/courses/${courseId}/videos`)
      const data = await res.json()
      if (res.ok) setVideos(data.videos || [])
    } finally {
      setLoading(false)
      setFetched(true)
    }
  }

  function handleToggle() {
    if (!open && !fetched) loadVideos()
    setOpen((prev) => !prev)
  }

  // After fetching, hide toggle if no videos
  if (fetched && !loading && videos.length === 0) return null

  return (
    <div className="border-t border-border mt-3 pt-3">
      <button
        onClick={handleToggle}
        className="flex items-center justify-between w-full text-sm font-medium text-foreground hover:text-primary transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Video className="h-3.5 w-3.5" />
          {fetched
            ? `${videos.length} video lesson${videos.length !== 1 ? "s" : ""}`
            : "View video lessons"}
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {activeVideo && (
              <div className="mt-3 rounded-lg overflow-hidden border border-border bg-black relative">
                <button
                  onClick={() => setActiveVideo(null)}
                  className="absolute top-2 right-2 z-10 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <video
                  key={activeVideo._id}
                  controls
                  autoPlay
                  className="w-full max-h-64"
                  src={activeVideo.url}
                >
                  Your browser does not support the video tag.
                </video>
                <div className="px-3 py-2 bg-card">
                  <p className="text-sm font-medium text-foreground">{activeVideo.title}</p>
                  {activeVideo.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{activeVideo.description}</p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-2 space-y-1">
              {loading ? (
                <p className="text-xs text-muted-foreground py-2 flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" /> Loading lessons...
                </p>
              ) : (
                videos.map((video) => (
                  <button
                    key={video._id}
                    onClick={() =>
                      setActiveVideo(activeVideo?._id === video._id ? null : video)
                    }
                    className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors ${
                      activeVideo?._id === video._id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      {activeVideo?._id === video._id ? (
                        <Play className="h-3 w-3 text-primary fill-primary" />
                      ) : video.lessonNumber ? (
                        <span className="text-[10px] font-bold text-primary">{video.lessonNumber}</span>
                      ) : (
                        <Play className="h-3 w-3 text-primary" />
                      )}
                    </div>
                    <span className="text-xs truncate flex-1">{video.title}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [enrollingId, setEnrollingId] = useState<string | null>(null)

  const currentUser = useCurrentUser()
  const isAdmin = currentUser?.role === "Admin"
  const isFaculty = currentUser?.role === "Faculty"

  useEffect(() => {
    fetchCourses()
  }, [])

  async function fetchCourses() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/courses", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to load courses.")
        setCourses([])
      } else {
        setCourses(data.courses || [])
      }
    } catch {
      setError("Unable to load courses. Please try again later.")
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  async function handleEnroll(courseId: string) {
    setEnrollingId(courseId)
    try {
      const res = await fetch("/api/courses/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      })
      if (res.ok) {
        setCourses((prev) =>
          prev.map((c) => (c.id === courseId ? { ...c, status: "enrolled" as CourseStatus } : c))
        )
      }
    } finally {
      setEnrollingId(null)
    }
  }

  async function handleDelete(courseId: string) {
    if (!confirm("Delete this course permanently? This will also remove all uploaded videos.")) return
    const res = await fetch("/api/courses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: courseId }),
    })
    if (res.ok) {
      setCourses((prev) => prev.filter((c) => c.id !== courseId))
    }
  }

  const filteredCourses = courses.filter((course) => {
    if (selectedCategory !== "All" && course.category !== selectedCategory) return false
    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const enrolledCount = courses.filter((c) => c.status === "enrolled" || c.status === "completed").length
  const completedCount = courses.filter((c) => c.status === "completed").length
  const inProgressCount = courses.filter((c) => c.status === "enrolled").length

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="rounded-xl border border-border bg-card px-8 py-10 text-center space-y-3">
          <Loader2 className="h-7 w-7 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-8 py-10 text-center">
          <p className="text-sm text-destructive font-medium">{error}</p>
          <button onClick={fetchCourses} className="mt-4 text-xs text-primary hover:underline">
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isAdmin ? "Course Management" : isFaculty ? "All Courses" : "My Courses"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Create and manage courses. Students and trainers see them instantly."
              : isFaculty
              ? "Browse all courses and view video lessons."
              : "Enroll in courses and watch video lessons."}
          </p>
        </div>
        {isAdmin && (
          <Link href="/admin/courses/create">
            <Button className="bg-primary hover:bg-primary/90">
              <BookOpen className="mr-2 h-4 w-4" />
              Create New Course
            </Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{courses.length}</div>
              <div className="text-xs text-muted-foreground">Total courses</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {isAdmin ? courses.reduce((s, c) => s + (c.enrolledCount || 0), 0) : completedCount}
              </div>
              <div className="text-xs text-muted-foreground">
                {isAdmin ? "Total enrollments" : "Completed"}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {isAdmin
                  ? courses.reduce((s, c) => s + (c.modules?.length ?? 0), 0)
                  : inProgressCount}
              </div>
              <div className="text-xs text-muted-foreground">
                {isAdmin ? "Total modules" : "In progress"}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-5/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-chart-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {isAdmin
                  ? courses.reduce((s, c) => s + (c.students || 0), 0)
                  : enrolledCount}
              </div>
              <div className="text-xs text-muted-foreground">
                {isAdmin ? "Total students" : "Enrolled"}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border flex-1">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm outline-none placeholder:text-muted-foreground flex-1"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 ${selectedCategory === cat ? "bg-primary" : ""}`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filteredCourses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-14 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-medium text-foreground">
            {courses.length === 0 ? "No courses yet" : "No courses match your search"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin && courses.length === 0
              ? "Create your first course and it will appear here for students and trainers immediately."
              : "Try a different search or category."}
          </p>
          {isAdmin && courses.length === 0 && (
            <Link href="/admin/courses/create" className="mt-5 inline-block">
              <Button>Create your first course</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-colors"
            >
              {/* Thumbnail */}
              <div className="h-36 bg-gradient-to-br from-primary/20 via-accent/10 to-chart-4/10 relative flex items-center justify-center">
                <BookOpen className="h-14 w-14 text-primary/25" />

                {/* Category badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-background/85 text-xs font-medium text-foreground backdrop-blur-sm">
                  {course.category}
                </div>

                {/* Status badge */}
                {course.status === "completed" && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">
                    <CheckCircle2 className="h-3 w-3" /> Completed
                  </div>
                )}
                {course.status === "enrolled" && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                    <Play className="h-3 w-3" /> Enrolled
                  </div>
                )}
                {(course.status === "admin" || course.status === "faculty") && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 text-muted-foreground text-xs font-medium">
                    {course.students} students
                  </div>
                )}
              </div>

              {/* Card body */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground leading-snug">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
                </div>

                <p className="text-sm text-muted-foreground">
                  by <span className="text-foreground font-medium">{course.instructor}</span>
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Video className="h-3 w-3" /> {course.lessons} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-chart-4" /> {course.rating}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {(course.students || 0).toLocaleString()} students enrolled
                </div>

                {/* Progress bar for enrolled students */}
                {course.status === "enrolled" && course.progress > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">{course.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* ── ADMIN ACTIONS ── */}
                {isAdmin && (
                  <>
                    <div className="flex gap-2 pt-1">
                      <Link href={`/dashboard/courses/${course.slug}`} className="flex-1">
                        <Button className="w-full" variant="outline" size="sm">
                          <BookOpen className="mr-1 h-3.5 w-3.5" /> View
                        </Button>
                      </Link>
                      <Link href={`/admin/courses/edit/${course.id}`} className="flex-1">
                        <Button className="w-full" variant="outline" size="sm">
                          <Edit className="mr-1 h-3.5 w-3.5" /> Edit
                        </Button>
                      </Link>
                      <Link href={`/admin/courses/upload-video/${course.id}`} className="flex-1">
                        <Button className="w-full" size="sm">
                          <Upload className="mr-1 h-3.5 w-3.5" /> Videos
                        </Button>
                      </Link>
                    </div>
                    {/* Admin can also preview uploaded videos */}
                    <CourseVideos courseId={course.id} />
                  </>
                )}

                {/* ── FACULTY (TRAINER) ACTIONS ── */}
                {isFaculty && (
                  <>
                    <Link href={`/dashboard/courses/${course.slug}`} className="w-full block">
                      <Button className="w-full" variant="outline">
                        <GraduationCap className="mr-1 h-4 w-4" /> View Course
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                    {/* Trainers always see video lessons */}
                    <CourseVideos courseId={course.id} />
                  </>
                )}

                {/* ── STUDENT ACTIONS ── */}
                {!isAdmin && !isFaculty && (
                  <>
                    {course.status === "enrolled" || course.status === "completed" ? (
                      <Link href={`/dashboard/courses/${course.slug}`} className="w-full block">
                        <Button className="w-full">
                          {course.status === "completed" ? "Review Course" : "Continue Learning"}
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleEnroll(course.id)}
                        disabled={enrollingId === course.id}
                      >
                        {enrollingId === course.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enrolling...
                          </>
                        ) : (
                          <>
                            Enroll Now <ArrowRight className="ml-1 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                    {/* Students see videos only after enrolling */}
                    {(course.status === "enrolled" || course.status === "completed") && (
                      <CourseVideos courseId={course.id} />
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
