"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Plus, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/admin/EmptyState"
import { StatsCards } from "@/components/admin/StatsCards"
import { CourseTable } from "@/components/admin/CourseTable"
import { toast } from "@/components/ui/use-toast"
import type { Course } from "@/lib/types"

const initialCounts = { total: 0, modules: 0, students: 0, averageRating: 0 }

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [counts, setCounts] = useState(initialCounts)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    refreshCourses()
  }, [])

  async function refreshCourses() {
    setLoading(true)
    try {
      const response = await fetch("/api/courses", { cache: "no-store" })
      const data = await response.json()
      if (!response.ok) {
        toast({ title: "Unable to load courses", description: data.error || "Please try again." })
        setCourses([])
        setCounts(initialCounts)
        return
      }
      setCourses(data.courses || [])
      const modules = (data.courses || []).reduce((sum: number, course: Course) => sum + course.modules.length, 0)
      const students = (data.courses || []).reduce((sum: number, course: Course) => sum + course.students, 0)
      const averageRating = (data.courses || []).length
        ? Math.round(((data.courses || []).reduce((sum: number, course: Course) => sum + course.rating, 0) / (data.courses || []).length) * 10) / 10
        : 0
      setCounts({ total: data.courses.length, modules, students, averageRating })
    } catch (error) {
      toast({ title: "Network error", description: "Unable to load courses." })
      setCourses([])
      setCounts(initialCounts)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this course permanently?")) return
    const response = await fetch("/api/courses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    if (!response.ok) {
      const error = await response.json()
      toast({ title: "Unable to delete", description: error.error || "Please try again." })
      return
    }
    toast({ title: "Deleted", description: "Course removed successfully." })
    refreshCourses()
  }

  const stats = [
    { label: "Total courses", value: counts.total, hint: "Courses available in the course catalog.", accent: "primary" as const },
    { label: "Modules", value: counts.modules, hint: "Structured modules across all courses.", accent: "accent" as const },
    { label: "Enrolled students", value: counts.students, hint: "Students enrolled in your courses.", accent: "success" as const },
    { label: "Average rating", value: counts.averageRating, hint: "Average rating across active courses.", accent: "muted" as const },
  ]

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-primary">Admin</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">Course Management</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Create and manage structured courses, modules, assignments, and student progress.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2" onClick={refreshCourses}>
              <RefreshCcw className="h-4 w-4" /> Refresh
            </Button>
            <Link href="/admin/courses/create">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Create course
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <StatsCards stats={stats} />

      {courses.length === 0 && !loading ? (
        <EmptyState
          title="No courses available yet"
          description="Add your first course and structure lessons with modules and assignments."
          actionLabel="Refresh"
          onAction={refreshCourses}
        />
      ) : (
        <CourseTable courses={courses} loading={loading} onEdit={(id) => window.location.assign(`/admin/courses/edit/${id}`)} onDelete={handleDelete} />
      )}
    </div>
  )
}
