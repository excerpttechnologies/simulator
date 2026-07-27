"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import type { Course } from "@/lib/types"

const courseSchema = z.object({
  title: z.string().min(5, "Course title is required").max(120),
  description: z.string().min(20, "Description must be at least 20 characters").max(320),
  category: z.string().min(1, "Category is required"),
  instructor: z.string().min(3, "Instructor name is required"),
  duration: z.string().min(1, "Duration is required"),
  lessons: z.number().min(1, "Lessons must be at least 1"),
  rating: z.number().min(0).max(5),
  students: z.number().min(0),
})

type CourseFormValues = z.infer<typeof courseSchema>

interface CourseModuleForm {
  id: string
  title: string
  description: string
  lessons: string
}

interface CourseFormProps {
  initialData?: Course | null
  onSaved?: () => void
}

function createUUID() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `module-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`
}

export function CourseForm({ initialData, onSaved }: CourseFormProps) {
  const router = useRouter()
  const [modules, setModules] = useState<CourseModuleForm[]>([
    { id: createUUID(), title: "", description: "", lessons: "" },
  ])
  const [assignmentInput, setAssignmentInput] = useState("")
  const [assignments, setAssignments] = useState<string[]>(initialData?.assignments ?? [])
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      category: initialData?.category ?? "GST",
      instructor: initialData?.instructor ?? "",
      duration: initialData?.duration ?? "0 hours",
      lessons: initialData?.lessons ?? 0,
      rating: initialData?.rating ?? 0,
      students: initialData?.students ?? 0,
    },
  })

  useEffect(() => {
    if (!initialData) return
    reset({
      title: initialData.title,
      description: initialData.description,
      category: initialData.category,
      instructor: initialData.instructor,
      duration: initialData.duration,
      lessons: initialData.lessons,
      rating: initialData.rating,
      students: initialData.students,
    })
    setModules(
      initialData.modules.map((module) => ({
        id: module.id,
        title: module.title,
        description: module.description,
        lessons: module.lessons.join(", "),
      })),
    )
    setAssignments(initialData.assignments ?? [])
  }, [initialData, reset])

  const moduleCount = useMemo(() => modules.length, [modules])
  const assignmentCount = useMemo(() => assignments.length, [assignments])

  function addModule() {
    setModules((current) => [
      ...current,
      { id: createUUID(), title: "", description: "", lessons: "" },
    ])
  }

  function updateModule(id: string, field: keyof CourseModuleForm, value: string) {
    setModules((current) =>
      current.map((module) => (module.id === id ? { ...module, [field]: value } : module)),
    )
  }

  function removeModule(id: string) {
    setModules((current) => current.filter((module) => module.id !== id))
  }

  function addAssignment() {
    const value = assignmentInput.trim()
    if (!value) return
    if (!assignments.includes(value)) {
      setAssignments((current) => [...current, value])
    }
    setAssignmentInput("")
  }

  function removeAssignment(label: string) {
    setAssignments((current) => current.filter((item) => item !== label))
  }

  async function onSubmit(values: CourseFormValues) {
    if (modules.length === 0) {
      toast({ title: "Add at least one module", description: "Courses need at least one module to publish." })
      return
    }

    setSubmitting(true)
    try {
      const payload: any = {
        title: values.title,
        description: values.description,
        category: values.category,
        instructor: values.instructor,
        duration: values.duration,
        lessons: values.lessons,
        rating: values.rating,
        students: values.students,
        modules: modules.map((module) => ({
          id: module.id,
          title: module.title,
          description: module.description,
          lessons: module.lessons
            .split(",")
            .map((lesson) => lesson.trim())
            .filter(Boolean),
          resources: [],
        })),
        assignments,
      }

      if (initialData) {
        payload.id = initialData.id
      }

      const response = await fetch("/api/courses", {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()
      if (!response.ok) {
        toast({ title: "Unable to save course", description: result.error || "Please try again." })
        return
      }

      toast({
        title: initialData ? "Course updated" : "Course created",
        description: "Your course was saved successfully.",
      })

      if (onSaved) {
        onSaved()
      } else {
        router.push("/admin/courses")
      }
    } catch (error) {
      toast({ title: "Network error", description: "Could not save the course." })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">Course title</label>
            <input className="w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">Instructor</label>
            <input className="w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("instructor")} />
            {errors.instructor && <p className="text-sm text-destructive">{errors.instructor.message}</p>}
          </div>
          <div className="space-y-3 lg:col-span-2">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">Short description</label>
            <textarea rows={4} className="w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("description")} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">Category</label>
            <select className="w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("category")}> 
              <option value="GST">GST</option>
              <option value="TDS">TDS</option>
              <option value="Income Tax">Income Tax</option>
              <option value="VAT">VAT</option>
              <option value="EPFO">EPFO</option>
              <option value="Accounting">Accounting</option>
              <option value="Banking">Banking</option>
              <option value="Payroll">Payroll</option>
            </select>
            {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">Duration</label>
            <input className="w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("duration")} />
            {errors.duration && <p className="text-sm text-destructive">{errors.duration.message}</p>}
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">Lessons</label>
              <input type="number" min={1} className="w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("lessons", { valueAsNumber: true })} />
              {errors.lessons && <p className="text-sm text-destructive">{errors.lessons.message}</p>}
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">Course rating</label>
              <input type="number" step="0.1" min={0} max={5} className="w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("rating", { valueAsNumber: true })} />
              {errors.rating && <p className="text-sm text-destructive">{errors.rating.message}</p>}
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">Students enrolled</label>
              <input type="number" min={0} className="w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("students", { valueAsNumber: true })} />
              {errors.students && <p className="text-sm text-destructive">{errors.students.message}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">Modules</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Drive structured learning with course modules and lesson outlines.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addModule}>
            Add module
          </Button>
        </div>

        <div className="mt-6 space-y-6">
          {modules.map((module, moduleIndex) => (
            <div key={module.id} className="rounded-3xl border border-neutral-200 bg-slate-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Module {moduleIndex + 1}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Add a title, summary, and comma-separated lesson titles.</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeModule(module.id)}>
                  Remove
                </Button>
              </div>
              <div className="grid gap-4 mt-4 lg:grid-cols-3">
                <div className="lg:col-span-1 space-y-3">
                  <label className="block text-sm font-medium text-slate-900 dark:text-white">Title</label>
                  <input className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-slate-100" value={module.title} onChange={(event) => updateModule(module.id, "title", event.target.value)} />
                </div>
                <div className="lg:col-span-1 space-y-3">
                  <label className="block text-sm font-medium text-slate-900 dark:text-white">Description</label>
                  <input className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-slate-100" value={module.description} onChange={(event) => updateModule(module.id, "description", event.target.value)} />
                </div>
                <div className="lg:col-span-1 space-y-3">
                  <label className="block text-sm font-medium text-slate-900 dark:text-white">Lessons</label>
                  <input className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-slate-100" value={module.lessons} onChange={(event) => updateModule(module.id, "lessons", event.target.value)} placeholder="Comma-separated lessons" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{moduleCount} module(s) defined.</p>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">Assignments</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Add learning activities, projects, or quizzes for the course.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={assignmentInput}
                onChange={(event) => setAssignmentInput(event.target.value)}
                placeholder="New assignment title"
                className="w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100"
              />
              <Button type="button" onClick={addAssignment}>
                Add
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {assignments.map((assignment) => (
              <div key={assignment} className="rounded-full border border-neutral-200 bg-slate-100 px-4 py-2 text-sm text-slate-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-200 flex items-center gap-2">
                <span>{assignment}</span>
                <button type="button" className="text-destructive" onClick={() => removeAssignment(assignment)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{assignmentCount} assignment(s) added.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Save course</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Create a course record and make it available to your learners.</p>
        </div>
        <Button type="submit" disabled={submitting} className="rounded-3xl px-6 py-3">
          {submitting ? "Saving..." : initialData ? "Update course" : "Create course"}
        </Button>
      </div>
    </form>
  )
}
