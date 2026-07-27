"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CourseForm } from "@/components/admin/CourseForm"
import { toast } from "@/components/ui/use-toast"
import type { Course } from "@/lib/types"

export default function AdminEditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCourse() {
      if (!params?.id) return
      setLoading(true)
      const response = await fetch(`/api/courses/${params.id}`)
      const data = await response.json()
      if (!response.ok) {
        toast({ title: "Unable to load course", description: data.error || "Please try again." })
        setLoading(false)
        return
      }
      setCourse(data.course)
      setLoading(false)
    }

    loadCourse()
  }, [params?.id])

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-primary">Edit course</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{course?.title ?? "Loading..."}</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/courses">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-neutral-200 bg-white p-10 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : course ? (
        <CourseForm initialData={course} onSaved={() => router.push("/admin/courses")} />
      ) : (
        <div className="rounded-3xl border border-neutral-200 bg-white p-10 text-center text-slate-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-slate-300">
          Unable to load the course.
        </div>
      )}
    </div>
  )
}
