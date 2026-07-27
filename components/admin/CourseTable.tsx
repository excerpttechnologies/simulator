"use client"

import { Trash2, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Course } from "@/lib/types"

interface CourseTableProps {
  courses: Course[]
  loading?: boolean
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function CourseTable({ courses, loading, onEdit, onDelete }: CourseTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm shadow-slate-200/40 dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-black/10">
      <div className="hidden grid-cols-12 gap-4 border-b border-neutral-200 px-6 py-4 text-xs uppercase tracking-[0.16em] text-slate-500 dark:border-neutral-800 dark:text-slate-400 sm:grid">
        <span className="col-span-4">Course</span>
        <span className="col-span-2">Category</span>
        <span className="col-span-2">Instructor</span>
        <span className="col-span-1">Modules</span>
        <span className="col-span-1">Lessons</span>
        <span className="col-span-1">Students</span>
        <span className="col-span-1 text-right">Actions</span>
      </div>

      <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">No courses available yet.</div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="grid gap-4 px-6 py-5 text-sm sm:grid-cols-12 sm:items-center">
              <div className="sm:col-span-4">
                <p className="font-semibold text-slate-900 dark:text-white">{course.title}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{course.description}</p>
              </div>
              <div className="sm:col-span-2 text-slate-600 dark:text-slate-300">{course.category}</div>
              <div className="sm:col-span-2 text-slate-600 dark:text-slate-300">{course.instructor}</div>
              <div className="sm:col-span-1 text-slate-600 dark:text-slate-300">{course.modules.length}</div>
              <div className="sm:col-span-1 text-slate-600 dark:text-slate-300">{course.lessons}</div>
              <div className="sm:col-span-1 text-slate-600 dark:text-slate-300">{course.students}</div>
              <div className="sm:col-span-1 flex justify-end gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => onEdit(course.id)}>
                  <Edit3 className="h-4 w-4" /> Edit
                </Button>
                <Button variant="destructive" size="sm" className="gap-2" onClick={() => onDelete(course.id)}>
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
