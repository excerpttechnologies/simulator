"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ChevronRight, ChevronLeft, AlertCircle } from "lucide-react"

interface Field {
  label: string
  type: "text" | "select" | "date" | "otp"
  options?: string[]
  hint?: string
  correctAnswer?: string
}
interface Step {
  stepNumber: number
  name: string
  fields: Field[]
}
interface Task {
  taskId: string
  taskNumber: number
  businessName: string
  location: string
  bizType: string
  scenario: string
  applicantDetails: Record<string, string>
  steps: Step[]
}

interface Props {
  scenario: { tasks?: Task[] } | Task[]
  onSubmit: (responses: Record<string, string>, timeSpent: number) => void
  initialResponses?: Record<string, string>
}

export default function DscSimulation({ scenario, onSubmit, initialResponses = {} }: Props) {
  const tasks: Task[] = Array.isArray(scenario)
    ? scenario
    : (scenario?.tasks ?? [])

  const [taskIdx, setTaskIdx] = useState(0)
  const [stepIdx, setStepIdx] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>(initialResponses)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [startTime] = useState(Date.now())

  const task = tasks[taskIdx]
  if (!task) return <div className="p-8 text-center text-muted-foreground">No tasks available.</div>

  const step = task.steps[stepIdx]
  const totalSteps = task.steps.length
  const totalTasks = tasks.length
  const isLastStep = stepIdx === totalSteps - 1
  const isLastTask = taskIdx === totalTasks - 1

  function key(taskId: string, stepNum: number, label: string) {
    return `${taskId}__s${stepNum}__${label}`
  }

  function validate() {
    const newErrors: Record<string, string> = {}
    for (const f of step.fields) {
      const k = key(task.taskId, step.stepNumber, f.label)
      if (!responses[k]?.trim()) newErrors[k] = "This field is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleNext() {
    if (!validate()) return
    if (!isLastStep) {
      setStepIdx(s => s + 1)
    } else if (!isLastTask) {
      setTaskIdx(t => t + 1)
      setStepIdx(0)
    } else {
      onSubmit(responses, Math.round((Date.now() - startTime) / 1000))
    }
  }

  const progressPct = Math.round(((taskIdx * totalSteps + stepIdx + 1) / (totalTasks * totalSteps)) * 100)

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Task {taskIdx + 1} of {totalTasks} — Step {stepIdx + 1} of {totalSteps}</span>
          <span>{progressPct}% complete</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Task scenario */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-1 flex items-center gap-1.5">
          🔐 Task {task.taskNumber} — {task.businessName}
        </p>
        <p className="text-sm text-gray-800 leading-relaxed">{task.scenario}</p>
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-600">
          <div><span className="text-gray-400">Location: </span>{task.location}</div>
          <div><span className="text-gray-400">Type: </span>{task.bizType}</div>
          {Object.entries(task.applicantDetails ?? {}).slice(0, 4).map(([k, v]) => (
            <div key={k}><span className="text-gray-400 capitalize">{k.replace(/([A-Z])/g," $1")}: </span>{String(v)}</div>
          ))}
        </div>
      </div>

      {/* Step form */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">
            {step.stepNumber}
          </div>
          <h3 className="font-semibold text-foreground">{step.name}</h3>
        </div>

        {step.fields.map((field) => {
          const k = key(task.taskId, step.stepNumber, field.label)
          return (
            <div key={k} className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{field.label}</label>
              {field.hint && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{field.hint}
                </p>
              )}
              {field.type === "select" ? (
                <select
                  value={responses[k] ?? ""}
                  onChange={e => { setResponses(r => ({ ...r, [k]: e.target.value })); setErrors(er => ({ ...er, [k]: "" })) }}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select…</option>
                  {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={field.type === "date" ? "text" : "text"}
                  placeholder={field.type === "date" ? "DD/MM/YYYY" : `Enter ${field.label}`}
                  value={responses[k] ?? ""}
                  onChange={e => { setResponses(r => ({ ...r, [k]: e.target.value })); setErrors(er => ({ ...er, [k]: "" })) }}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
              {errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>}
            </div>
          )
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled={taskIdx === 0 && stepIdx === 0}
          onClick={() => { if (stepIdx > 0) setStepIdx(s => s - 1); else { setTaskIdx(t => t - 1); setStepIdx(totalSteps - 1) } }}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex gap-1">
          {tasks.map((_, ti) => (
            <div key={ti} className={`h-2 w-2 rounded-full ${ti < taskIdx ? "bg-primary" : ti === taskIdx ? "bg-primary/60" : "bg-muted"}`} />
          ))}
        </div>
        <Button onClick={handleNext}>
          {isLastStep && isLastTask ? (
            <><CheckCircle2 className="h-4 w-4 mr-1" /> Submit</>
          ) : (
            <>Next <ChevronRight className="h-4 w-4 ml-1" /></>
          )}
        </Button>
      </div>
    </div>
  )
}
