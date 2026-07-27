"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Trophy, Clock, CheckCircle2, XCircle, Circle,
  ArrowRight, RotateCcw, BarChart2, Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type Attempt = {
  id: string
  slug: string
  title: string
  description: string
  category: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  duration: string
  status: "completed" | "not-started" | "in-progress" | "failed" | "abandoned"
  score: number | null
  completedAt: string | null
  tags: string[]
}

type Stats = {
  completedCount: number
  attemptCount: number
  averageScore: number
}

const DIFFICULTY_COLORS = {
  Beginner: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  Intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  Advanced: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
}

const STATUS_MAP = {
  completed: { label: "Completed", icon: CheckCircle2, color: "text-emerald-500" },
  "in-progress": { label: "In Progress", icon: Clock, color: "text-amber-500" },
  failed: { label: "Failed", icon: XCircle, color: "text-red-500" },
  abandoned: { label: "Abandoned", icon: XCircle, color: "text-slate-400" },
  "not-started": { label: "Not Started", icon: Circle, color: "text-slate-400" },
}

export default function MyAttemptsPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [stats, setStats] = useState<Stats>({ completedCount: 0, attemptCount: 0, averageScore: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "completed" | "in-progress" | "failed">("all")

  useEffect(() => {
    fetch("/api/user/simulations", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        // Only show simulations the user has actually interacted with
        const attempted = (data.simulations ?? []).filter(
          (s: Attempt) => s.status !== "not-started"
        )
        setAttempts(data.simulations ?? [])
        setStats(data.stats ?? { completedCount: 0, attemptCount: 0, averageScore: 0 })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = attempts.filter((a) => {
    if (filter === "all") return a.status !== "not-started"
    return a.status === filter
  })

  const allAttempted = attempts.filter((a) => a.status !== "not-started")

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">History</p>
            <h1 className="mt-1 text-2xl font-bold text-foreground">My Attempts</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track your simulation history, scores, and progress.
            </p>
          </div>
          <Link href="/dashboard/simulations">
            <Button variant="outline" className="rounded-2xl">
              Browse All Simulations <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Attempted", value: stats.attemptCount, icon: BarChart2, color: "text-primary bg-primary/10" },
          { label: "Completed", value: stats.completedCount, icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10" },
          { label: "Avg. Score", value: stats.averageScore ? `${stats.averageScore}%` : "—", icon: Trophy, color: "text-amber-500 bg-amber-500/10" },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 border border-border bg-card">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-2 ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-xl bg-muted p-1 w-fit">
        {(["all", "completed", "in-progress", "failed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === f
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? `All (${allAttempted.length})` : f.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* Attempts list */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-200 bg-slate-50 py-20 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-4xl mb-3">📋</div>
          <p className="font-semibold text-foreground">No attempts yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            {filter === "all"
              ? "Start a simulation to track your progress here."
              : `No ${filter.replace("-", " ")} simulations.`}
          </p>
          <Link href="/dashboard/simulations" className="mt-4 inline-block">
            <Button className="mt-4 rounded-2xl">Browse Simulations</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((attempt) => {
            const statusInfo = STATUS_MAP[attempt.status] ?? STATUS_MAP["not-started"]
            const StatusIcon = statusInfo.icon
            const passed = attempt.status === "completed" && (attempt.score ?? 0) >= 70

            return (
              <Card
                key={attempt.id}
                className="flex flex-col gap-4 p-5 border border-border bg-card sm:flex-row sm:items-center"
              >
                {/* Score circle */}
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${
                    passed
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : attempt.status === "failed"
                      ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                      : "bg-slate-100 text-slate-500 dark:bg-neutral-800 dark:text-slate-400"
                  }`}
                >
                  {attempt.score !== null ? `${attempt.score}%` : "—"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground text-sm truncate">
                      {attempt.title}
                    </span>
                    {attempt.difficulty && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_COLORS[attempt.difficulty] ?? ""}`}>
                        {attempt.difficulty}
                      </span>
                    )}
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-muted-foreground dark:bg-neutral-800">
                      {attempt.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{attempt.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className={`flex items-center gap-1 font-medium ${statusInfo.color}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {statusInfo.label}
                    </span>
                    {attempt.completedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(attempt.completedAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 gap-2">
                  {attempt.status === "completed" ? (
                    <Link href={`/simulations/${attempt.slug}`}>
                      <Button size="sm" variant="outline" className="rounded-xl gap-1">
                        <RotateCcw className="h-3.5 w-3.5" /> Retry
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/simulations/${attempt.slug}`}>
                      <Button size="sm" className="rounded-xl gap-1 bg-primary hover:bg-primary/90">
                        <ArrowRight className="h-3.5 w-3.5" /> Continue
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
