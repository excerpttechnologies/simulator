"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { VideoUploader } from "@/components/admin/VideoUploader"
import { toast } from "@/components/ui/use-toast"
import type { Simulation } from "@/lib/types"

const simulationSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(120),
  description: z.string().min(20, "Description must be at least 20 characters").max(280),
  category: z.string().min(1, "Category is required"),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  duration: z.string().min(1, "Duration is required"),
  tags: z.array(z.string().min(1)).max(8),
thumbnailUrl: z.string().min(1, "Thumbnail upload is required"),
videoUrl: z.string().min(1, "Video upload is required"),
  scenario: z.string().max(800).optional(),
  instructions: z.string().min(50, "Add detailed instructions for learners."),
  assessmentRules: z.string().max(600).optional(),
  engineType: z.string().optional(),
  questionSetJson: z.string().optional(),
  passingScore: z.number().min(0).max(100).default(70),
  attemptsAllowed: z.number().min(1).max(20).default(3),
  certificateEligible: z.boolean().default(true),
  assignmentTargetType: z.enum(["student", "batch", "department", "institution", "course"]).default("course"),
  assignmentTargetIds: z.string().optional(),
  assignmentStartDate: z.string().optional(),
  assignmentEndDate: z.string().optional(),
  assignmentMandatory: z.boolean().default(true),
  assignmentAttemptLimit: z.number().min(1).max(20).default(3),
  completionRequirement: z.string().default("completion"),
  attachmentTitle: z.string().optional(),
  attachmentUrl: z.string().url().optional(),
  scheduleStartDate: z.string().optional(),
  scheduleEndDate: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]),
})

type SimulationFormValues = z.infer<typeof simulationSchema>

interface SimulationFormProps {
  initialData?: Simulation | null
  onSaved?: () => void
}

export function SimulationForm({ initialData, onSaved }: SimulationFormProps) {
  const router = useRouter()
  const [tagInput, setTagInput] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, setValue, watch, formState, reset } = useForm<SimulationFormValues>({
    resolver: zodResolver(simulationSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      category: initialData?.category ?? "GST",
      difficulty: initialData?.difficulty ?? "Beginner",
      duration: initialData?.duration ?? "20 mins",
      tags: initialData?.tags ?? [],
      thumbnailUrl: initialData?.thumbnailUrl ?? "",
      videoUrl: initialData?.videoUrl ?? "",
      scenario: initialData?.scenario ?? "",
      instructions: initialData?.instructions ?? "",
      assessmentRules: initialData?.assessmentRules ?? "",
      passingScore: initialData?.passingScore ?? 70,
      attemptsAllowed: initialData?.attemptsAllowed ?? 3,
      certificateEligible: initialData?.certificateEligible ?? true,
      assignmentTargetType: initialData?.assignmentRules?.targetType ?? "course",
      assignmentTargetIds: initialData?.assignmentRules?.targetIds?.join(", ") ?? "",
      assignmentStartDate: initialData?.assignmentRules?.startDate ?? "",
      assignmentEndDate: initialData?.assignmentRules?.endDate ?? "",
      assignmentMandatory: initialData?.assignmentRules?.mandatory ?? true,
      assignmentAttemptLimit: initialData?.assignmentRules?.attemptLimit ?? 3,
      completionRequirement: initialData?.assignmentRules?.completionRequirement ?? "completion",
      attachmentTitle: initialData?.attachments?.[0]?.title ?? "",
      attachmentUrl: initialData?.attachments?.[0]?.url ?? "",
      scheduleStartDate: initialData?.schedule?.startDate ?? "",
      scheduleEndDate: initialData?.schedule?.endDate ?? "",
      engineType: initialData?.engineType ?? "JOURNAL",
      questionSetJson: initialData?.questionSet ? JSON.stringify(initialData.questionSet, null, 2) : "",
      status: initialData?.status ?? "draft",
    },
  })

  const tags = watch("tags") || []
  const videoUrl = watch("videoUrl")
  const thumbnailUrl = watch("thumbnailUrl")

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        description: initialData.description,
        category: initialData.category,
        difficulty: initialData.difficulty,
        duration: initialData.duration,
        tags: initialData.tags,
        thumbnailUrl: initialData.thumbnailUrl,
        videoUrl: initialData.videoUrl,
        scenario: initialData.scenario ?? "",
        instructions: initialData.instructions,
        assessmentRules: initialData.assessmentRules ?? "",
        passingScore: initialData.passingScore ?? 70,
        attemptsAllowed: initialData.attemptsAllowed ?? 3,
        certificateEligible: initialData.certificateEligible ?? true,
        assignmentTargetType: initialData.assignmentRules?.targetType ?? "course",
        assignmentTargetIds: initialData.assignmentRules?.targetIds?.join(", ") ?? "",
        assignmentStartDate: initialData.assignmentRules?.startDate ?? "",
        assignmentEndDate: initialData.assignmentRules?.endDate ?? "",
        assignmentMandatory: initialData.assignmentRules?.mandatory ?? true,
        assignmentAttemptLimit: initialData.assignmentRules?.attemptLimit ?? 3,
        completionRequirement: initialData.assignmentRules?.completionRequirement ?? "completion",
        attachmentTitle: initialData.attachments?.[0]?.title ?? "",
        attachmentUrl: initialData.attachments?.[0]?.url ?? "",
        scheduleStartDate: initialData.schedule?.startDate ?? "",
        scheduleEndDate: initialData.schedule?.endDate ?? "",
        engineType: initialData.engineType ?? "JOURNAL",
        questionSetJson: initialData.questionSet ? JSON.stringify(initialData.questionSet, null, 2) : "",
        status: initialData.status,
      })
    }
  }, [initialData, reset])

  const statusLabel = useMemo(() => {
    if (watch("status") === "published") return "Published"
    if (watch("status") === "archived") return "Archived"
    return "Draft"
  }, [watch("status")])

  function addTag() {
    const value = tagInput.trim()
    if (!value) return
    if (tags.includes(value)) {
      setTagInput("")
      return
    }
    setValue("tags", [...tags, value])
    setTagInput("")
  }

  function removeTag(tag: string) {
    setValue("tags", tags.filter((item) => item !== tag))
  }

  async function onSubmit(values: SimulationFormValues) {

     console.log("=== FORM SUBMIT ===");
  console.log("Values:", values);
  console.log("Thumbnail URL:", values.thumbnailUrl);
  console.log("Video URL:", values.videoUrl);
    setSubmitting(true)
    try {
      const payload = {
        ...values,
        createdBy: "admin",
        slug: values.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
        assignmentRules: {
          targetType: values.assignmentTargetType,
          targetIds: values.assignmentTargetIds
            ? values.assignmentTargetIds.split(",").map((item) => item.trim()).filter(Boolean)
            : [],
          startDate: values.assignmentStartDate || undefined,
          endDate: values.assignmentEndDate || undefined,
          mandatory: values.assignmentMandatory,
          attemptLimit: values.assignmentAttemptLimit,
          completionRequirement: values.completionRequirement,
        },
        schedule: {
          startDate: values.scheduleStartDate || undefined,
          endDate: values.scheduleEndDate || undefined,
        },
        engineType: values.engineType || "JOURNAL",
        questionSet: values.questionSetJson
          ? JSON.parse(values.questionSetJson)
          : {},
        attachments: values.attachmentUrl
          ? [
              {
                title: values.attachmentTitle || "Reference",
                url: values.attachmentUrl,
                type: "document",
              },
            ]
          : [],
      }

      const response = await fetch(
        initialData ? `/api/admin/simulations/${initialData.id}` : "/api/admin/simulations",
        {
          method: initialData ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      )

console.log("Response Status:", response.status);




      const result = await response.json()
      console.log("API Response:", result);
      if (!response.ok) {
        toast({ title: "Unable to save simulation", description: result.error || "Please try again." })
        return
      }

      toast({ title: initialData ? "Simulation updated" : "Simulation created", description: "Your simulation is now saved." })
      if (onSaved) {
        onSaved()
      } else {
        router.push("/admin/simulations")
      }
    } catch (error) {
      toast({ title: "Network error", description: "Could not save the simulation." })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">Simulation title</label>
            <input className="w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("title")} />
            {formState.errors.title && <p className="text-sm text-destructive">{formState.errors.title.message}</p>}
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">Short description</label>
            <textarea rows={4} className="w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("description")} />
            {formState.errors.description && <p className="text-sm text-destructive">{formState.errors.description.message}</p>}
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">Category</label>
            <select className="w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("category")}>
              <option value="Accounting">Accounting</option>
              <option value="Tally Prime">Tally Prime</option>
              <option value="GST">GST</option>
              <option value="Banking">Banking</option>
              <option value="Payroll">Payroll</option>
              <option value="Taxation">Taxation</option>
              <option value="Auditing">Auditing</option>
              <option value="ERP">ERP</option>
              <option value="Finance">Finance</option>
              <option value="Stock Market">Stock Market</option>
              <option value="Entrepreneurship">Entrepreneurship</option>
              <option value="HR">HR</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Excel">Excel</option>
              <option value="Business Analytics">Business Analytics</option>
              <option value="Mock Interview">Mock Interview</option>
              <option value="Communication Skills">Communication Skills</option>
              <option value="AI Tutor">AI Tutor</option>
            </select>
            {formState.errors.category && <p className="text-sm text-destructive">{formState.errors.category.message}</p>}
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">Difficulty</label>
            <select className="w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("difficulty")}>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">Duration</label>
            <input className="w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("duration")} />
          </div>
          <div className="space-y-3 lg:col-span-2">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">Scenario & learning objective</label>
            <textarea rows={5} className="w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("scenario")} placeholder="Describe the business scenario and the objectives for the student." />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">Thumbnail</label>
            <VideoUploader
              label="Upload thumbnail"
              mode="image"
              value={thumbnailUrl}
              onChange={(url) => setValue("thumbnailUrl", url ?? "")}
            />
            {formState.errors.thumbnailUrl && <p className="text-sm text-destructive">{formState.errors.thumbnailUrl.message}</p>}
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">Video upload</label>
            <VideoUploader
              label="Upload training video"
              mode="video"
              value={videoUrl}
              onChange={(url) => setValue("videoUrl", url ?? "")}
            />
            {formState.errors.videoUrl && <p className="text-sm text-destructive">{formState.errors.videoUrl.message}</p>}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">Assessment rules</label>
            <textarea rows={6} className="w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("assessmentRules")} placeholder="Describe how the simulation is graded, what counts as correct, and which skills are tested." />
          </div>
          <div className="grid gap-4">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">Engine type</label>
              <select className="w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("engineType")}>
                <option value="JOURNAL">Journal Entry</option>
                <option value="TRIAL_BALANCE">Trial Balance</option>
                <option value="TDS">TDS Calculator</option>
                <option value="GST_INVOICE">GST Invoice</option>
                <option value="GST_RETURN">GST Return</option>
                <option value="EWAYBILL">E-Way Bill</option>
                <option value="PAYROLL">Payroll</option>
                <option value="INCOME_TAX">Income Tax</option>
                <option value="AUDIT">Audit Procedure</option>
                <option value="BANKING">Banking Operations</option>
                <option value="ERP_PURCHASE">ERP Purchase</option>
                <option value="ERP_SALES">ERP Sales</option>
                <option value="ERP_INVENTORY">ERP Inventory</option>
                <option value="EXCEL">Excel Formula</option>
                <option value="LEDGER">Ledger Posting</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">Question set JSON</label>
              <textarea rows={8} className="w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("questionSetJson")} placeholder='{"questions": [...], "scenario": {...}}' />
              <p className="text-sm text-slate-500 dark:text-slate-400">Enter a JSON payload for the simulation question set and scenario data.</p>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">Passing score</label>
              <input type="number" min={0} max={100} className="w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("passingScore", { valueAsNumber: true })} />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">Attempt limit</label>
              <input type="number" min={1} className="w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("attemptsAllowed", { valueAsNumber: true })} />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">Certificate eligible</label>
              <div className="flex items-center gap-3">
                <input type="checkbox" {...register("certificateEligible")} className="h-4 w-4 rounded border border-neutral-300 text-primary focus:ring-primary" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Enable automatic certificate for passing learners</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">Instructions</label>
            <textarea rows={8} className="w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("instructions")} />
            {formState.errors.instructions && <p className="text-sm text-destructive">{formState.errors.instructions.message}</p>}
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">Assignment & schedule</label>
            <div className="grid gap-3">
              <div>
                <label className="text-sm text-slate-700 dark:text-slate-300">Target type</label>
                <select className="mt-2 w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("assignmentTargetType")}>
                  <option value="student">Individual student</option>
                  <option value="batch">Batch</option>
                  <option value="department">Department</option>
                  <option value="institution">Institution</option>
                  <option value="course">Course</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-700 dark:text-slate-300">Target IDs</label>
                <input type="text" placeholder="Comma-separated IDs" className="mt-2 w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("assignmentTargetIds")} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-slate-700 dark:text-slate-300">Start date</label>
                  <input type="date" className="mt-2 w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("assignmentStartDate")} />
                </div>
                <div>
                  <label className="text-sm text-slate-700 dark:text-slate-300">End date</label>
                  <input type="date" className="mt-2 w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("assignmentEndDate")} />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-slate-700 dark:text-slate-300">Completion requirement</label>
                  <input type="text" className="mt-2 w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("completionRequirement")} />
                </div>
                <div>
                  <label className="text-sm text-slate-700 dark:text-slate-300">Attempt limit</label>
                  <input type="number" min={1} className="mt-2 w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("assignmentAttemptLimit", { valueAsNumber: true })} />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <input type="checkbox" {...register("assignmentMandatory")} className="mt-1 h-4 w-4 rounded border border-neutral-300 text-primary focus:ring-primary" />
                <div>
                  <p className="text-sm text-slate-900 dark:text-slate-100">Mandatory assignment</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Require completion before learners can move ahead.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">Attachments</label>
            <input type="text" placeholder="Title" className="mt-2 w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("attachmentTitle")} />
            <input type="url" placeholder="https://" className="mt-3 w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("attachmentUrl")} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">Schedule</label>
            <div className="grid gap-3 sm:grid-cols-2 mt-2">
              <input type="date" className="w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("scheduleStartDate")} />
              <input type="date" className="w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("scheduleEndDate")} />
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Use schedule dates to make simulations available during a training window.</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">Publication status</label>
            <select className="mt-2 w-full max-w-xs rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100" {...register("status")}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-slate-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Status preview</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{statusLabel}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Ready to publish?</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Save as draft or publish immediately when you're done.</p>
        </div>
        <Button type="submit" disabled={submitting} className="rounded-3xl px-6 py-3">
          {submitting ? "Saving..." : initialData ? "Update simulation" : "Create simulation"}
        </Button>
      </div>
    </form>
  )
}
