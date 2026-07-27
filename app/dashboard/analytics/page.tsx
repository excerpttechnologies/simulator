"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  Calendar,
  Download,
  BarChart3,
  Activity,
  Target,
  Clock,
  Award,
  CheckCircle2,
  FileText,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"

interface SimulationStats {
  total: number
  completed: number
  averageScore: number
  totalTime: number
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<SimulationStats | null>(null)
  const [coursesCount, setCoursesCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [simsRes, coursesRes] = await Promise.all([
          fetch("/api/user/simulations", { cache: "no-store" }),
          fetch("/api/courses", { cache: "no-store" }),
        ])

        const simsData = simsRes.ok ? await simsRes.json() : {}
        const coursesData = coursesRes.ok ? await coursesRes.json() : {}

        const simulations = simsData.simulations || []
        const completed = simulations.filter((s: any) => s.status === "completed")
        const avgScore = completed.length
          ? Math.round(completed.reduce((sum: number, s: any) => sum + (s.bestScore ?? s.score ?? 0), 0) / completed.length)
          : 0

        const courses = coursesData.courses || []
        const enrolledOrCompleted = courses.filter(
          (c: any) => c.status === "enrolled" || c.status === "completed"
        ).length

        setStats({
          total: simulations.length,
          completed: completed.length,
          averageScore: avgScore,
          totalTime: completed.length * 12, // ~12 min avg per simulation
        })
        setCoursesCount(enrolledOrCompleted)
      } catch {
        setStats({ total: 0, completed: 0, averageScore: 0, totalTime: 0 })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const overviewStats = stats
    ? [
        {
          label: "Total Time Spent",
          value: `${Math.floor((stats.totalTime) / 60)}h ${stats.totalTime % 60}m`,
          change: `${stats.completed} sessions`,
          trend: "up",
          icon: Clock,
        },
        {
          label: "Simulations Done",
          value: String(stats.completed),
          change: `${stats.total} total`,
          trend: "up",
          icon: FileText,
        },
        {
          label: "Average Score",
          value: stats.averageScore ? `${stats.averageScore}%` : "—",
          change: stats.completed ? "across simulations" : "No data yet",
          trend: "up",
          icon: Target,
        },
        {
          label: "Courses Enrolled",
          value: String(coursesCount),
          change: "active courses",
          trend: "up",
          icon: Award,
        },
      ]
    : []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Track your learning progress and performance
            {user ? ` — ${user.name}` : ""}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" /> Last 30 days
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse">
              <div className="h-4 w-24 bg-muted rounded mb-3" />
              <div className="h-8 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-accent" />
                <span className="text-xs text-muted-foreground">{stat.change}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty state for new users */}
      {!loading && stats && stats.total === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-dashed border-border bg-card p-12 text-center"
        >
          <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-medium text-foreground">No activity yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Complete simulations and enroll in courses to see your analytics here.
          </p>
        </motion.div>
      )}

      {/* Charts placeholder */}
      {!loading && stats && stats.completed > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">Simulation Progress</h2>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium text-foreground">{stats.completed} / {stats.total}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: stats.total > 0 ? `${(stats.completed / stats.total) * 100}%` : "0%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Average Score</span>
                  <span className="font-medium text-foreground">{stats.averageScore}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all"
                    style={{ width: `${stats.averageScore}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">Summary</h2>
              <CheckCircle2 className="h-5 w-5 text-accent" />
            </div>
            <div className="space-y-3">
              {[
                { label: "Simulations completed", value: stats.completed },
                { label: "Courses enrolled", value: coursesCount },
                { label: "Avg score", value: `${stats.averageScore}%` },
                { label: "Time invested", value: `${Math.floor(stats.totalTime / 60)}h ${stats.totalTime % 60}m` },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{row.label}</span>
                  <span className="text-sm font-semibold text-foreground">{row.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
