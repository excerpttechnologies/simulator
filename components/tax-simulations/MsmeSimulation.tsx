"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import {
  CheckCircle2, ChevronRight, ChevronLeft,
  Building2, User, TrendingUp, CreditCard, FileCheck, MapPin,
} from "lucide-react"

interface Field {
  label: string
  type: "text" | "select" | "date"
  options?: string[]
  correctAnswer: string
  hint?: string
}

interface Step { stepNumber: number; name: string; fields: Field[] }
interface Task {
  taskId: string; taskNumber: number; businessName: string
  location: string; bizType: string; scenario: string
  applicantDetails: Record<string, any>; steps: Step[]
}
interface Props {
  scenario: { tasks: Task[] }
  onSubmit: (responses: any, timeSpent: number) => void
  initialResponses?: any
}

const STEP_ICONS = [User, Building2, TrendingUp, CreditCard, FileCheck]

export default function MsmeSimulation({ scenario, onSubmit, initialResponses }: Props) {
  const [startTime] = useState(Date.now())
  const tasks: Task[] = scenario?.tasks ?? []
  const [taskIdx, setTaskIdx] = useState(0)
  const [stepIdx, setStepIdx] = useState(0)
  const [responses, setResponses] = useState<Record<number, Record<number, Record<string, string>>>>(initialResponses ?? {})
  const [taskScores, setTaskScores] = useState<Record<number, { correct: number; total: number }>>({})
  const [taskDone, setTaskDone] = useState<Record<number, boolean>>({})

  if (!tasks.length) return (
    <div className="rounded-3xl border border-dashed border-neutral-200 bg-slate-50 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900">
      <p className="font-semibold text-foreground">No tasks configured for this simulation.</p>
    </div>
  )

  const currentTask = tasks[taskIdx]
  const steps = currentTask?.steps ?? []
  const currentStep = steps[stepIdx]
  const StepIcon = STEP_ICONS[stepIdx] ?? FileCheck

  const getValue = (ti: number, si: number, label: string) => responses[ti]?.[si]?.[label] ?? ""
  const setValue = (ti: number, si: number, label: string, val: string) =>
    setResponses(p => ({ ...p, [ti]: { ...p[ti], [si]: { ...(p[ti]?.[si] ?? {}), [label]: val } } }))

  function scoreTask(ti: number) {
    const task = tasks[ti]; let correct = 0; let total = 0
    task.steps.forEach((step, si) => step.fields.forEach((f) => {
      total++
      const s = (getValue(ti, si, f.label) ?? "").trim().toLowerCase()
      const a = (f.correctAnswer ?? "").trim().toLowerCase()
      const ns = parseFloat(s); const na = parseFloat(a)
      if (s === a || (!isNaN(ns) && !isNaN(na) && Math.abs(ns - na) <= 1000)) correct++
    }))
    return { correct, total }
  }

  function handleNext() {
    const unfilled = currentStep.fields.filter(f => !getValue(taskIdx, stepIdx, f.label).trim())
    if (unfilled.length) { toast({ title: `Fill required: ${unfilled.map(f => f.label).join(", ")}`, variant: "destructive" }); return }
    if (stepIdx < steps.length - 1) { setStepIdx(stepIdx + 1) }
    else {
      const score = scoreTask(taskIdx)
      setTaskScores(p => ({ ...p, [taskIdx]: score }))
      setTaskDone(p => ({ ...p, [taskIdx]: true }))
      toast({ title: `Task ${taskIdx + 1} complete — ${score.correct}/${score.total} correct` })
    }
  }

  function handleNextTask() {
    if (taskIdx < tasks.length - 1) { setTaskIdx(taskIdx + 1); setStepIdx(0) }
    else {
      const allScores = tasks.map((_, i) => taskScores[i] ?? scoreTask(i))
      const totalCorrect = allScores.reduce((s, sc) => s + sc.correct, 0)
      const totalFields = allScores.reduce((s, sc) => s + sc.total, 0)
      onSubmit({ responses, taskScores: allScores, totalCorrect, totalFields }, Math.floor((Date.now() - startTime) / 1000))
    }
  }

  const isLastStep = stepIdx === steps.length - 1
  const isLastTask = taskIdx === tasks.length - 1
  const currentTaskComplete = !!taskDone[taskIdx]

  const classMap: Record<string, string> = {
    "Micro": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    "Small": "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    "Medium": "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  }
  const category = currentTask.bizType.includes("Micro") ? "Micro" : currentTask.bizType.includes("Small") ? "Small" : "Medium"

  return (
    <div className="space-y-5">
      {/* Task pills */}
      <div className="flex flex-wrap gap-2">
        {tasks.map((t, i) => (
          <button key={i} onClick={() => { if (taskDone[i] || i <= taskIdx) { setTaskIdx(i); setStepIdx(0) } }}
            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${i === taskIdx ? "bg-primary text-white border-primary" : taskDone[i] ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-muted text-muted-foreground border-border"}`}>
            {taskDone[i] ? "✓ " : ""}{t.businessName}
          </button>
        ))}
      </div>

      {/* Scenario card */}
      <Card className="p-5 border border-violet-200 bg-violet-50 dark:border-violet-900/40 dark:bg-violet-950/20">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-bold text-violet-600 uppercase tracking-widest">Task {taskIdx + 1} of {tasks.length} — Udyam Registration</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${classMap[category]}`}>{category} Enterprise</span>
            </div>
            <h3 className="font-bold text-foreground">{currentTask.businessName}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{currentTask.location}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{currentTask.bizType}</p>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{currentTask.scenario}</p>
          </div>
          <div className="rounded-xl border border-violet-200 bg-white/70 p-3 text-xs space-y-1 min-w-[180px] dark:bg-violet-950/30 dark:border-violet-900/40">
            {Object.entries(currentTask.applicantDetails ?? {}).map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}:</span>
                <span className="font-semibold text-foreground">
                  {k === "investment" || k === "turnover" ? `₹${Number(v).toLocaleString("en-IN")}` : String(v)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Step form or completion card */}
      {!currentTaskComplete ? (
        <Card className="p-6 border border-neutral-200 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <StepIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground font-medium">Step {stepIdx + 1} of {steps.length}</p>
              <h3 className="font-bold text-foreground">{currentStep?.name}</h3>
            </div>
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all ${i < stepIdx ? "bg-emerald-500" : i === stepIdx ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {currentStep?.fields.map((field) => (
              <div key={field.label}>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {field.label} <span className="text-destructive">*</span>
                </label>
                {field.type === "select" ? (
                  <select value={getValue(taskIdx, stepIdx, field.label)}
                    onChange={e => setValue(taskIdx, stepIdx, field.label, e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100">
                    <option value="">— Select —</option>
                    {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <Input type="text" value={getValue(taskIdx, stepIdx, field.label)}
                    onChange={e => setValue(taskIdx, stepIdx, field.label, e.target.value)}
                    placeholder={field.hint ?? `Enter ${field.label.toLowerCase()}`}
                    className="rounded-xl" />
                )}
                {field.hint && <p className="mt-1 text-xs text-muted-foreground">{field.hint}</p>}
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-8 pt-4 border-t border-border">
            <Button variant="outline" disabled={stepIdx === 0} onClick={() => setStepIdx(s => s - 1)} className="rounded-xl">
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button onClick={handleNext} className="rounded-xl bg-primary hover:bg-primary/90">
              {isLastStep ? "Complete Task" : "Next Step"} <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-8 border border-emerald-200 bg-emerald-50 text-center dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-foreground mb-1">Task {taskIdx + 1} Complete!</h3>
          <p className="text-muted-foreground text-sm mb-2">
            {currentTask.businessName} — {taskScores[taskIdx]?.correct ?? 0}/{taskScores[taskIdx]?.total ?? 0} fields correct
          </p>
          <div className="w-full bg-emerald-200 rounded-full h-2 mb-6 dark:bg-emerald-900/40">
            <div className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${taskScores[taskIdx] ? (taskScores[taskIdx].correct / taskScores[taskIdx].total) * 100 : 0}%` }} />
          </div>
          <Button onClick={handleNextTask} className="rounded-xl bg-primary hover:bg-primary/90 px-8">
            {isLastTask ? "Submit All Tasks" : `Next: ${tasks[taskIdx + 1]?.businessName}`}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Card>
      )}
    </div>
  )
}
