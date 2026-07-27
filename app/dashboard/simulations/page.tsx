"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, ChevronRight, ArrowLeft, Clock, BookOpen, Play } from "lucide-react"
import { CATEGORY_GROUPS, COURSE_NAME_TO_ID, type CategoryGroup, type CourseEntry, type AssignmentTask } from "@/data/assignmentData"

// ─── Types ────────────────────────────────────────────────────────────────────

type View = "groups" | "courses" | "task"

type ProgressMap = Record<string, number> // courseId → completed task count

// ─── Helpers ─────────────────────────────────────────────────────────────────

function progressPercent(completed: number, total: number) {
  return total === 0 ? 0 : Math.round((completed / total) * 100)
}

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

// ─── Category Group Card ──────────────────────────────────────────────────────

function CategoryCard({
  group,
  progress,
  onClick,
}: {
  group: CategoryGroup
  progress: ProgressMap
  onClick: () => void
}) {
  const totalTasks = group.courses.reduce((s, c) => s + c.taskCount, 0)
  const completedTasks = group.courses.reduce((s, c) => s + (progress[c.id] ?? 0), 0)
  const pct = progressPercent(completedTasks, totalTasks)
  const isCompleted = pct === 100

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug">{group.title}</h3>
        {isCompleted && <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />}
      </div>
      <p className="mt-1 text-xs text-gray-500">{group.courses.length} Course{group.courses.length !== 1 ? "s" : ""}</p>
      <div className="mt-3">
        <div className="h-1.5 w-full rounded-full bg-gray-100">
          <div
            className="h-1.5 rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: isCompleted ? "#22c55e" : "#94a3b8" }}
          />
        </div>
        <p className="mt-1 text-right text-xs text-gray-400">{pct}%</p>
      </div>
      <p className="mt-2 text-xs text-gray-500">Total Duration: {group.totalDurationLabel}</p>
    </button>
  )
}

// ─── Course List View ─────────────────────────────────────────────────────────

function CourseListView({
  group,
  progress,
  tasksByCourseName,
  onCourseClick,
  onBack,
}: {
  group: CategoryGroup
  progress: ProgressMap
  tasksByCourseName: Record<string, AssignmentTask[]>
  onCourseClick: (course: CourseEntry, tasks: AssignmentTask[]) => void
  onBack: () => void
}) {
  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400">
        <button onClick={onBack} className="hover:underline flex items-center gap-1">
          <span>🏠</span>
        </button>
        <span>/</span>
        <button onClick={onBack} className="hover:underline">Essentials Of Digital Statutory…</button>
        <span>/</span>
        <span className="hover:underline cursor-pointer" onClick={onBack}>Assignment</span>
        <span>/</span>
        <span className="text-gray-600 font-medium">{group.title}</span>
      </nav>

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900">{group.title}</h1>

      {/* Course rows */}
      <div className="space-y-3">
        {group.courses.map((course, idx) => {
          const completed = progress[course.id] ?? 0
          const pct = progressPercent(completed, course.taskCount)
          const isCompleted = pct === 100
          // find matching tasks from JSON (for GST courses only)
          const jsonCourseName = Object.keys(COURSE_NAME_TO_ID).find(k => COURSE_NAME_TO_ID[k] === course.id)
          const tasks = jsonCourseName ? (tasksByCourseName[jsonCourseName] ?? []) : []

          return (
            <button
              key={course.id}
              onClick={() => onCourseClick(course, tasks)}
              className="w-full text-left rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
            >
              {/* Number circle */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500 text-white font-bold text-sm">
                {idx + 1}
              </div>

              {/* Title + meta */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm leading-snug">{course.title}</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {course.taskCount} Tasks • Duration: {course.durationLabel}
                </p>
              </div>

              {/* Progress / Completed */}
              <div className="flex items-center gap-3 shrink-0">
                {isCompleted ? (
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Completed
                  </span>
                ) : pct > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-gray-100">
                      <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-12 text-right">{pct.toFixed(2)}%</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-gray-100" />
                    <span className="text-xs text-gray-400 w-12 text-right">0%</span>
                  </div>
                )}
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div className="pt-4 flex items-center justify-between text-xs text-gray-300">
        <span>v3.2.7</span>
        <span className="flex gap-3">
          <span>Privacy</span><span>•</span><span>Terms</span><span>•</span><span>FAQ</span>
        </span>
        <span>©NERGY INDIA PVT LTD</span>
      </div>
    </div>
  )
}

// ─── Task Detail View ─────────────────────────────────────────────────────────

function TaskDetailView({
  course,
  tasks,
  progress,
  onProgressChange,
  onBack,
  groupTitle,
}: {
  course: CourseEntry
  tasks: AssignmentTask[]
  progress: ProgressMap
  onProgressChange: (courseId: string, count: number) => void
  onBack: () => void
  groupTitle: string
}) {
  const router = useRouter()
  const [activeTask, setActiveTask] = useState<AssignmentTask | null>(tasks[0] ?? null)
  const [completedIds, setCompletedIds] = useState<Set<number>>(() => new Set())

  // Use first 5 tasks (or pad with generated placeholders if fewer)
  const displayTasks = tasks.slice(0, course.taskCount)

  // Map course IDs to their interactive tax-lab simulation routes
  const SIM_ROUTES: Record<string, string> = {
    "epfo-registration": "/dashboard/tax-lab/labour/epfo",
    "esic-registration": "/dashboard/tax-lab/labour/esic",
    "trn-generation": "/dashboard/tax-lab/gst/registration",
    "gst-registration-via-trn": "/dashboard/tax-lab/gst/registration",
    "gstr-3b-filing": "/dashboard/tax-lab/gst/returns",
    "nil-return-filing": "/dashboard/tax-lab/gst/returns",
    "gst-composition-return-filing": "/dashboard/tax-lab/gst/returns",
    "e-way-bill": "/dashboard/tax-lab",
    "msme-registration": "/dashboard/tax-lab/msme",
    "dsc-registration": "/dashboard/tax-lab/dsc",
    "dsc-renewal": "/dashboard/tax-lab/dsc",
    "dsc-revocation": "/dashboard/tax-lab/dsc",
  }
  const simRoute = SIM_ROUTES[course.id]

  function markComplete(seq: number) {
    setCompletedIds(prev => {
      if (prev.has(seq)) return prev
      const next = new Set(prev)
      next.add(seq)
      return next
    })
  }

  // Sync completed count to parent whenever completedIds changes
  useEffect(() => {
    onProgressChange(course.id, completedIds.size)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedIds])

  const renderTaskData = (task: AssignmentTask) => {
    // Render sales_details table if present
    const sales = task.sales_details as Array<Record<string,unknown>> | undefined
    const invoiceSummary = task.invoice_summary as Array<Record<string,unknown>> | undefined
    const applicantDetails = task.applicant_details as Record<string,unknown> | undefined
    const credentials = task.credentials as Record<string,string> | undefined
    const goods = task.goods

    // Format scenario text: strip leading task_id line if present
    const rawScenario = task.scenario || ""
    const scenarioLines = rawScenario.split("\n").filter(l => l.trim())
    const firstLineIsTaskId = scenarioLines[0]?.trim() === task.task_id
    const scenarioText = firstLineIsTaskId
      ? scenarioLines.slice(1).join("\n").trim()
      : rawScenario.trim()

    return (
      <div className="space-y-4 text-sm">
        {/* Portal badge */}
        {task.portal_name && (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              🌐 {task.portal_name as string}
            </span>
            {task.portal_url && (
              <a
                href={task.portal_url as string}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline"
              >
                {task.portal_url as string}
              </a>
            )}
          </div>
        )}

        {/* Scenario */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-1">Scenario</p>
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{scenarioText}</p>
        </div>

        {/* Business / Task Info Grid */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Task Details</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {[
              ["Task ID", task.task_id],
              ["Business / Applicant", (task.business_name ?? task.applicant_name) as string],
              ["Location", (task.location ?? task.from_location) as string],
              ["Period", task.period as string],
              ["Duration", formatDuration(task.duration_minutes)],
              ["Category", task.category],
              ["Business Type", task.business_type as string],
              ["GST Rate", task.gst_rate as string],
              ["Tax Scheme", task.tax_scheme as string],
              ["GSTIN", task.gstin as string],
              ["TRN", task.trn as string],
              ["Goods", goods as string],
              ["To Location", task.to_location as string],
              ["Invoice Value", task.invoice_value ? `₹${(task.invoice_value as number).toLocaleString("en-IN")}` : undefined],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label as string}>
                <span className="text-gray-400">{label}: </span>
                <span className="font-medium text-gray-900">{value as string}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Credentials */}
        {credentials && Object.keys(credentials).length > 0 && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-green-700 mb-3">Login Credentials</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm font-mono">
              {Object.entries(credentials).map(([k, v]) => (
                <div key={k}>
                  <span className="text-green-600 capitalize">{k.replace(/_/g," ")}: </span>
                  <span className="font-semibold text-gray-900">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applicant Details (from legacy assignment.json) */}
        {applicantDetails && (
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Applicant Details</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {Object.entries(applicantDetails).map(([k, v]) => (
                <div key={k}>
                  <span className="text-gray-400 capitalize">{k.replace(/_/g," ")}: </span>
                  <span className="font-medium text-gray-900">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sales Table */}
        {sales && sales.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <p className="px-4 pt-4 text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Sales Details</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {Object.keys(sales[0]).map(k => (
                      <th key={k} className="px-3 py-2 text-left font-semibold text-gray-600 capitalize whitespace-nowrap">
                        {k.replace(/_/g," ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sales.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {Object.values(row).map((v, j) => (
                        <td key={j} className="px-3 py-2 text-gray-700">
                          {v == null ? "—" : typeof v === "number" ? `₹${v.toLocaleString("en-IN")}` : String(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Invoice Summary Table */}
        {invoiceSummary && invoiceSummary.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <p className="px-4 pt-4 text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Invoice Summary</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {Object.keys(invoiceSummary[0]).map(k => (
                      <th key={k} className="px-3 py-2 text-left font-semibold text-gray-600 capitalize whitespace-nowrap">
                        {k.replace(/_/g," ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoiceSummary.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {Object.values(row).map((v, j) => (
                        <td key={j} className="px-3 py-2 text-gray-700">
                          {v == null ? "—" : typeof v === "number" ? `₹${v.toLocaleString("en-IN")}` : String(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
        <button onClick={onBack} className="hover:underline">🏠</button>
        <span>/</span>
        <button onClick={onBack} className="hover:underline">Essentials Of Digital Statutory…</button>
        <span>/</span>
        <button onClick={onBack} className="hover:underline">Assignment</button>
        <span>/</span>
        <button onClick={onBack} className="hover:underline">{groupTitle}</button>
        <span>/</span>
        <span className="text-gray-600 font-medium">{course.title}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="rounded-full p-1.5 hover:bg-gray-100 text-gray-500">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-3">
            <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{course.taskCount} Tasks</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{course.durationLabel}</span>
          </p>
        </div>
      </div>

      {/* Objective */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <span className="font-semibold">Learning Objective: </span>{course.objective}
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Task list sidebar */}
        <div className="lg:w-72 shrink-0 space-y-2">
          {displayTasks.length > 0 ? displayTasks.map((task, idx) => (
            <button
              key={task.task_id}
              onClick={() => setActiveTask(task)}
              className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${
                activeTask?.task_id === task.task_id
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-blue-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  completedIds.has(task.seq_no) ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  {completedIds.has(task.seq_no) ? "✓" : idx + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">
                    {(task.business_name ?? task.applicant_name ?? task.task_id) as string}
                  </p>
                  <p className="text-xs text-gray-400">{(task.period ?? task.location ?? task.category) as string}</p>
                </div>
              </div>
            </button>
          )) : (
            Array.from({ length: course.taskCount }).map((_, idx) => (
              <div key={idx} className="rounded-xl border border-gray-200 bg-white px-4 py-3 opacity-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-400">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-gray-300">Loading…</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Task detail panel */}
        <div className="flex-1 min-w-0">
          {activeTask ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Task #{activeTask.seq_no}</h2>
                <div className="flex items-center gap-2">
                  {simRoute && (
                    <button
                      onClick={() => router.push(simRoute)}
                      className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
                    >
                      <Play className="h-3.5 w-3.5" /> Start Simulation
                    </button>
                  )}
                  {!completedIds.has(activeTask.seq_no) ? (
                    <button
                      onClick={() => markComplete(activeTask.seq_no)}
                      className="rounded-xl bg-green-500 px-4 py-2 text-xs font-semibold text-white hover:bg-green-600"
                    >
                      Mark Complete
                    </button>
                  ) : (
                    <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                      <CheckCircle2 className="h-4 w-4" /> Completed
                    </span>
                  )}
                </div>
              </div>
              {renderTaskData(activeTask)}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
              Select a task to view details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SimulationPage() {
  const [view, setView] = useState<View>("groups")
  const [activeGroup, setActiveGroup] = useState<CategoryGroup | null>(null)
  const [activeCourse, setActiveCourse] = useState<CourseEntry | null>(null)
  const [activeTasks, setActiveTasks] = useState<AssignmentTask[]>([])
  const [progress, setProgress] = useState<ProgressMap>({})
  // Tasks loaded from /assignment.json, keyed by course name
  const [tasksByCourseName, setTasksByCourseName] = useState<Record<string, AssignmentTask[]>>({})
  const [loadingTasks, setLoadingTasks] = useState(false)

  // Load assignment.json once on mount
  useEffect(() => {
    setLoadingTasks(true)
    fetch("/assignment.json")
      .then(r => r.json())
      .then((data: AssignmentTask[]) => {
        const grouped: Record<string, AssignmentTask[]> = {}
        for (const task of data) {
          if (!grouped[task.course]) grouped[task.course] = []
          grouped[task.course].push(task)
        }
        // Sort each group by seq_no, keep first 5
        for (const key of Object.keys(grouped)) {
          grouped[key] = grouped[key]
            .sort((a, b) => a.seq_no - b.seq_no)
            .slice(0, 5)
        }
        setTasksByCourseName(grouped)
      })
      .catch(() => {})
      .finally(() => setLoadingTasks(false))
  }, [])

  const handleProgressChange = useCallback((courseId: string, count: number) => {
    setProgress(prev => ({ ...prev, [courseId]: count }))
  }, [])

  // ── View: group cards ──
  if (view === "groups") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Simulations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Practice compliance scenarios across GST, Income Tax, Labour Laws, MCA, MSME, and DSC.
          </p>
        </div>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <span>🏠</span>
          <span>/</span>
          <span>Essentials Of Digital Statutory…</span>
          <span>/</span>
          <span className="text-gray-600 font-medium">Assignment</span>
        </nav>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_GROUPS.map(group => (
            <CategoryCard
              key={group.id}
              group={group}
              progress={progress}
              onClick={() => {
                setActiveGroup(group)
                setView("courses")
              }}
            />
          ))}
        </div>
        <p className="text-center text-xs text-gray-300 pt-2">v3.2.7 &nbsp;•&nbsp; © Nergy India Pvt Ltd</p>
      </div>
    )
  }

  // ── View: course list ──
  if (view === "courses" && activeGroup) {
    return (
      <CourseListView
        group={activeGroup}
        progress={progress}
        tasksByCourseName={tasksByCourseName}
        onCourseClick={(course, tasks) => {
          setActiveCourse(course)
          setActiveTasks(tasks)
          setView("task")
        }}
        onBack={() => {
          setActiveGroup(null)
          setView("groups")
        }}
      />
    )
  }

  // ── View: task detail ──
  if (view === "task" && activeCourse && activeGroup) {
    return (
      <TaskDetailView
        course={activeCourse}
        tasks={activeTasks}
        progress={progress}
        onProgressChange={handleProgressChange}
        groupTitle={activeGroup.title}
        onBack={() => {
          setActiveCourse(null)
          setActiveTasks([])
          setView("courses")
        }}
      />
    )
  }

  return null
}
