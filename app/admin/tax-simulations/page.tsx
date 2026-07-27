"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import {
  BarChart2, Users, CheckCircle2, Trophy, Zap, TrendingUp,
  RefreshCcw, FileText, Calculator, Target, BarChart, AlertTriangle,
  Clock
} from "lucide-react"
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts"

const SIM_TYPE_LABELS: Record<string, string> = {
  GST_REGISTRATION: "GST Registration",
  GST_REG_SANATH: "GST Registration — Sanath Sunder (SUDHARSHANA POWERS)",
  GST_INVOICE: "GST Invoice",
  GST_RETURN: "GST Returns",
  GST_RECONCILIATION: "GST Reconciliation",
  GST_AUDIT: "GST Audit",
  TDS_DEDUCTION: "TDS Deduction",
  TDS_CHALLAN: "TDS Challan",
  TDS_RETURN: "TDS Return",
  TDS_FORM16: "Form 16",
}

const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#f97316", "#ec4899", "#64748b"]

export default function AdminTaxSimulationsPage() {
  const [overview, setOverview] = useState<any>(null)
  const [typeBreakdown, setTypeBreakdown] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [attempts, setAttempts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "attempts" | "students">("overview")
  const [typeFilter, setTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    loadOverview()
  }, [])

  useEffect(() => {
    if (activeTab === "attempts") loadAttempts()
  }, [activeTab, typeFilter, statusFilter])

  async function loadOverview() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/tax-simulations?action=overview")
      const data = await res.json()
      if (res.ok) {
        setOverview(data.overview)
        setTypeBreakdown(data.typeBreakdown || [])
        setLeaderboard(data.leaderboard || [])
      }
    } catch {
      toast({ title: "Failed to load analytics", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function loadAttempts() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ action: "attempts" })
      if (typeFilter) params.set("type", typeFilter)
      if (statusFilter) params.set("status", statusFilter)
      const res = await fetch(`/api/admin/tax-simulations?${params}`)
      const data = await res.json()
      if (res.ok) setAttempts(data.attempts || [])
    } finally {
      setLoading(false)
    }
  }

  const chartData = typeBreakdown.map((d, i) => ({
    name: SIM_TYPE_LABELS[d._id] || d._id,
    count: d.count,
    avgScore: Math.round(d.avgScore || 0),
    color: CHART_COLORS[i % CHART_COLORS.length],
  }))

  const overviewStats = overview ? [
    { label: "Total Attempts", value: overview.totalAttempts, icon: Target, color: "text-primary", bg: "bg-primary/10" },
    { label: "Completed", value: overview.completedAttempts, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Completion Rate", value: `${overview.completionRate}%`, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Avg Score", value: `${overview.avgScore}%`, icon: BarChart2, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Active Students", value: overview.activeStudents, icon: Users, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Total XP Distributed", value: overview.totalXPDistributed?.toLocaleString(), icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "GST Completed", value: overview.gstCompleted, icon: FileText, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { label: "TDS Completed", value: overview.tdsCompleted, icon: Calculator, color: "text-pink-500", bg: "bg-pink-500/10" },
  ] : []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-xl border border-slate-700">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_20%_50%,violet_0%,transparent_60%)]" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BarChart className="h-5 w-5 text-violet-400" />
              <span className="text-sm font-semibold bg-white/10 px-3 py-1 rounded-full text-violet-300">Admin Panel</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Tax Simulation Control Center</h1>
            <p className="text-slate-400">Monitor student performance, GST & TDS simulation analytics, and leaderboard stats</p>
          </div>
          <Button
            onClick={loadOverview}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 self-start"
          >
            <RefreshCcw className="h-4 w-4 mr-2" /> Refresh Data
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted rounded-2xl p-1 w-fit">
        {(["overview", "attempts", "students"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${activeTab === tab ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          {/* Stats Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {overviewStats.map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <Card className="p-5 border border-border bg-card">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                          <stat.icon className={`h-4.5 w-4.5 ${stat.color}`} />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                      </div>
                      <div className="text-2xl font-bold text-foreground">{stat.value ?? "—"}</div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 border border-border bg-card">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-primary" /> Attempts by Simulation Type
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <ReBarChart data={chartData} margin={{ top: 0, right: 0, bottom: 40, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "currentColor" }} angle={-35} textAnchor="end" />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </ReBarChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6 border border-border bg-card">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" /> Average Scores by Type
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <ReBarChart data={chartData} margin={{ top: 0, right: 0, bottom: 40, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "currentColor" }} angle={-35} textAnchor="end" />
                      <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                        formatter={(v) => `${v}%`}
                      />
                      <Bar dataKey="avgScore" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </ReBarChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Leaderboard */}
              <Card className="p-6 border border-border bg-card">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" /> Top Students (Overall)
                </h3>
                {leaderboard.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4">No leaderboard data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((entry, i) => (
                      <div key={entry.id || i} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? "bg-yellow-400 text-white" : i === 1 ? "bg-slate-400 text-white" : i === 2 ? "bg-amber-600 text-white" : "bg-muted text-muted-foreground"}`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate text-sm">{entry.userName}</p>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground shrink-0">
                          <span>{entry.simulationsCompleted} sims</span>
                          <span className="font-bold text-primary">{entry.totalScore} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}
        </>
      )}

      {activeTab === "attempts" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none text-foreground"
            >
              <option value="">All Types</option>
              {Object.entries(SIM_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none text-foreground"
            >
              <option value="">All Statuses</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <Card className="border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Type</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Student ID</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Status</th>
                      <th className="text-right p-4 font-semibold text-muted-foreground">Score</th>
                      <th className="text-right p-4 font-semibold text-muted-foreground">Time Spent</th>
                      <th className="text-right p-4 font-semibold text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {attempts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-muted-foreground">No attempts found.</td>
                      </tr>
                    ) : attempts.map((attempt, i) => (
                      <tr key={attempt.id || i} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <span className="font-medium text-foreground">{SIM_TYPE_LABELS[attempt.type] || attempt.type}</span>
                        </td>
                        <td className="p-4 text-muted-foreground font-mono text-xs">{attempt.userId?.slice(0, 8)}...</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            attempt.status === "completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" :
                            attempt.status === "failed" ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" :
                            "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                          }`}>
                            {attempt.status}
                          </span>
                        </td>
                        <td className="p-4 text-right font-semibold text-foreground">{attempt.percentage || 0}%</td>
                        <td className="p-4 text-right text-muted-foreground flex items-center justify-end gap-1">
                          <Clock className="h-3 w-3" />
                          {Math.round((attempt.timeSpent || 0) / 60)}m
                        </td>
                        <td className="p-4 text-right text-muted-foreground text-xs">
                          {attempt.createdAt ? new Date(attempt.createdAt).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
