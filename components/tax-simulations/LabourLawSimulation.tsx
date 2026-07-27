"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import {
  CheckCircle2, ChevronRight, ChevronLeft,
  Building2, Users, FileText, MapPin, CreditCard,
} from "lucide-react"

interface Field {
  label: string
  type: "text" | "select" | "date" | "radio"
  options?: string[]
  correctAnswer: string
  hint?: string
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
  applicantDetails: Record<string, any>
  steps: Step[]
}

interface Props {
  scenario: { tasks: Task[] }
  onSubmit: (responses: any, timeSpent: number) => void
  initialResponses?: any
}

const STEP_ICONS = [Building2, Users, FileText, MapPin, CreditCard]

export default function LabourLawSimulation({ scenario, onSubmit, initialResponses }: Props) {
  const [startTime] = useState(Date.now())
  const tasks: Task[] = scenario?.tasks ?? []
  const [taskIdx, setTaskIdx] = useState(0)
  const [stepIdx, setStepIdx] = useState(0)
  // responses[taskIdx][stepIdx][fieldLabel] = value
  const [responses, setResponses] = useState<Record<number, Record<number, Record<string, string>>>>(
    initialResponses ?? {}
  )
  const [taskScores, setTaskScores] = useState<Record<number, { correct: number; total: number }>>({})
  const [taskDone, setTaskDone] = useState<Record<number, boolean>>({})

  if (!tasks.length) {
    return (
      <div className="rounded-3xl border border-dashed border-neutral-200 bg-slate-50 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900">
        <div className="text-4xl mb-3">📋</div>
        <p className="font-semibold text-foreground">No tasks configured for this simulation.</p>
      </div>
    )
  }

  const currentTask = tasks[taskIdx]
  const steps = currentTask?.steps ?? []
  const currentStep = steps[stepIdx]
  const StepIcon = STEP_ICONS[stepIdx] ?? FileText

  function getFieldValue(taskI: number, stepI: number, label: string) {
    return responses[taskI]?.[stepI]?.[label] ?? ""
  }

  function setFieldValue(taskI: number, stepI: number, label: string, value: string) {
    setResponses((prev) => ({
      ...prev,
      [taskI]: {
        ...prev[taskI],
        [stepI]: {
          ...(prev[taskI]?.[stepI] ?? {}),
          [label]: value,
        },
      },
    }))
  }

  function scoreCurrentTask(taskI: number) {
    const task = tasks[taskI]
    let correct = 0
    let total = 0
    task.steps.forEach((step, si) => {
      step.fields.forEach((field) => {
        total++
        const student = (getFieldValue(taskI, si, field.label) ?? "").trim().toLowerCase()
        const answer = (field.correctAnswer ?? "").trim().toLowerCase()
        const numStudent = parseFloat(student)
        const numAnswer = parseFloat(answer)
        const numericMatch = !isNaN(numStudent) && !isNaN(numAnswer) && Math.abs(numStudent - numAnswer) <= 10
        if (student === answer || numericMatch) correct++
      })
    })
    return { correct, total }
  }

  function handleNextStep() {
    // Validate all fields filled
    const unfilled = currentStep.fields.filter(
      (f) => !getFieldValue(taskIdx, stepIdx, f.label).trim()
    )
    if (unfilled.length) {
      toast({ title: `Please fill: ${unfilled.map((f) => f.label).join(", ")}`, variant: "destructive" })
      return
    }
    if (stepIdx < steps.length - 1) {
      setStepIdx(stepIdx + 1)
    } else {
      // Task complete — score it
      const score = scoreCurrentTask(taskIdx)
      setTaskScores((prev) => ({ ...prev, [taskIdx]: score }))
      setTaskDone((prev) => ({ ...prev, [taskIdx]: true }))
      toast({ title: `Task ${taskIdx + 1} complete! ${score.correct}/${score.total} correct` })
    }
  }

  function handleNextTask() {
    if (taskIdx < tasks.length - 1) {
      setTaskIdx(taskIdx + 1)
      setStepIdx(0)
    } else {
      // All tasks done — submit
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)
      const allScores = tasks.map((_, i) => taskScores[i] ?? scoreCurrentTask(i))
      const totalCorrect = allScores.reduce((s, sc) => s + sc.correct, 0)
      const totalFields = allScores.reduce((s, sc) => s + sc.total, 0)
      onSubmit({ responses, taskScores: allScores, totalCorrect, totalFields }, timeSpent)
    }
  }

  const isLastStep = stepIdx === steps.length - 1
  const isLastTask = taskIdx === tasks.length - 1
  const currentTaskComplete = !!taskDone[taskIdx]

  return (
    <div className="space-y-6">
      {/* Task progress pills */}
      <div className="flex flex-wrap gap-2">
        {tasks.map((t, i) => (
          <button
            key={t.taskId || i}
            onClick={() => { if (taskDone[i] || i <= taskIdx) { setTaskIdx(i); setStepIdx(0) } }}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all border ${
              i === taskIdx
                ? "bg-primary text-white border-primary"
                : taskDone[i]
                ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {taskDone[i] ? "✓ " : ""}{t.businessName}
          </button>
        ))}
      </div>

      {/* Task scenario card */}
      <Card className="p-5 border border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/20">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Task {taskIdx + 1} of {tasks.length}</span>
              <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs dark:bg-blue-950/60 dark:text-blue-300">{currentTask.bizType}</span>
            </div>
            <h3 className="font-bold text-foreground">{currentTask.businessName}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" /> {currentTask.location}
            </p>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{currentTask.scenario}</p>
          </div>
          {/* Applicant details */}
          <div className="rounded-xl border border-blue-200 bg-white/70 p-3 text-xs space-y-1 min-w-[200px] dark:bg-blue-950/30 dark:border-blue-900/40">
            {Object.entries(currentTask.applicantDetails ?? {}).map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}:</span>
                <span className="font-semibold text-foreground">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Step form */}
      {!currentTaskComplete ? (
        <Card className="p-6 border border-neutral-200 dark:border-neutral-800 dark:bg-neutral-950">
          {/* Step header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <StepIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Step {stepIdx + 1} of {steps.length}</p>
              <h3 className="font-bold text-foreground">{currentStep?.name}</h3>
            </div>
            {/* Step progress dots */}
            <div className="ml-auto flex gap-1.5">
              {steps.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all ${
                  i < stepIdx ? "bg-emerald-500" : i === stepIdx ? "bg-primary" : "bg-muted"
                }`} />
              ))}
            </div>
          </div>

          {/* Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            {currentStep?.fields.map((field) => (
              <div key={field.label}>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {field.label} <span className="text-destructive">*</span>
                </label>
                {field.type === "select" ? (
                  <select
                    value={getFieldValue(taskIdx, stepIdx, field.label)}
                    onChange={(e) => setFieldValue(taskIdx, stepIdx, field.label, e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100"
                  >
                    <option value="">— Select —</option>
                    {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <Input
                    type={field.type === "date" ? "date" : "text"}
                    value={getFieldValue(taskIdx, stepIdx, field.label)}
                    onChange={(e) => setFieldValue(taskIdx, stepIdx, field.label, e.target.value)}
                    placeholder={field.hint ?? `Enter ${field.label.toLowerCase()}`}
                    className="rounded-xl"
                  />
                )}
                {field.hint && (
                  <p className="mt-1 text-xs text-muted-foreground">{field.hint}</p>
                )}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => stepIdx > 0 ? setStepIdx(stepIdx - 1) : undefined}
              disabled={stepIdx === 0}
              className="rounded-xl"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button onClick={handleNextStep} className="rounded-xl bg-primary hover:bg-primary/90">
              {isLastStep ? "Complete Task" : "Next Step"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </Card>
      ) : (
        /* Task completion card */
        <Card className="p-8 border border-emerald-200 bg-emerald-50 text-center dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-foreground mb-1">Task {taskIdx + 1} Complete!</h3>
          <p className="text-muted-foreground text-sm mb-2">
            {currentTask.businessName} — {taskScores[taskIdx]?.correct ?? 0}/{taskScores[taskIdx]?.total ?? 0} fields correct
          </p>
          <div className="w-full bg-emerald-200 rounded-full h-2 mb-6 dark:bg-emerald-900/40">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${taskScores[taskIdx] ? (taskScores[taskIdx].correct / taskScores[taskIdx].total) * 100 : 0}%` }}
            />
          </div>
          <Button onClick={handleNextTask} className="rounded-xl bg-primary hover:bg-primary/90 px-8">
            {isLastTask ? "Submit All Tasks" : `Next Task: ${tasks[taskIdx + 1]?.businessName}`}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Card>
      )}
    </div>
  )
}
