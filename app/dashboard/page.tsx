"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2, TrendingUp, Clock, BookOpen,
  Play, BarChart3, FileText, Loader2, ShieldCheck,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

interface DashboardStats {
  simulationsCompleted: number
  coursesEnrolled: number
  coursesCompleted: number
  totalCourses: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentCourses, setRecentCourses] = useState<any[]>([])
  const [recentSims, setRecentSims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const isAdmin = user?.role === "Admin"
  const isFaculty = user?.role === "Faculty"

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const [coursesRes, simsRes] = await Promise.all([
        fetch("/api/courses", { cache: "no-store" }),
        fetch("/api/user/simulations", { cache: "no-store" }),
      ])
      const coursesData = coursesRes.ok ? await coursesRes.json() : { courses: [] }
      const simsData = simsRes.ok ? await simsRes.json() : { simulations: [] }

      const allCourses: any[] = coursesData.courses || []
      const allSims: any[] = simsData.simulations || []

      // For Admin/Faculty — all courses are "available" to them, show total count
      const enrolled = isAdmin || isFaculty
        ? allCourses.length
        : allCourses.filter((c) => c.status === "enrolled" || c.status === "completed").length
      const completed = isAdmin || isFaculty
        ? 0
        : allCourses.filter((c) => c.status === "completed").length
      const simsCompleted = allSims.filter((s: any) => s.status === "completed").length

      setStats({
        simulationsCompleted: simsCompleted,
        coursesEnrolled: enrolled,
        coursesCompleted: completed,
        totalCourses: allCourses.length,
      })

      setRecentCourses(allCourses.slice(0, 4))
      setRecentSims(allSims.filter((s: any) => s.status === "completed").slice(0, 3))
    } catch {
      setStats({ simulationsCompleted: 0, coursesEnrolled: 0, coursesCompleted: 0, totalCourses: 0 })
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      label: "Simulations Completed",
      value: stats?.simulationsCompleted ?? 0,
      sub: "Total completed",
      icon: CheckCircle2,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: isAdmin ? "Total Courses" : isFaculty ? "Total Courses" : "Courses Enrolled",
      value: stats?.coursesEnrolled ?? 0,
      sub: isAdmin || isFaculty ? "All published courses" : `${stats?.coursesCompleted ?? 0} completed`,
      icon: BookOpen,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: isAdmin || isFaculty ? "In Progress Sims" : "Courses Completed",
      value: isAdmin || isFaculty
        ? (stats ? stats.simulationsCompleted : 0)
        : (stats?.coursesCompleted ?? 0),
      sub: isAdmin || isFaculty ? "Simulations done" : "Certificates earned",
      icon: TrendingUp,
      color: "text-chart-4",
      bg: "bg-chart-4/10",
    },
    {
      label: isAdmin || isFaculty ? "Total Simulations" : "Active Courses",
      value: isAdmin || isFaculty
        ? 0
        : Math.max(0, (stats?.coursesEnrolled ?? 0) - (stats?.coursesCompleted ?? 0)),
      sub: isAdmin || isFaculty ? "Published" : "In progress",
      icon: Clock,
      color: "text-chart-5",
      bg: "bg-chart-5/10",
    },
  ]

  function courseStatusLabel(status: string) {
    if (status === "completed") return { text: "Completed", cls: "bg-accent/10 text-accent" }
    if (status === "enrolled") return { text: "Enrolled", cls: "bg-primary/10 text-primary" }
    if (status === "admin" || status === "faculty") return { text: "Available", cls: "bg-muted text-muted-foreground" }
    return { text: "Available", cls: "bg-muted text-muted-foreground" }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back{user ? `, ${user.name}` : ""}!{" "}
          {isAdmin ? "Manage your platform." : isFaculty ? "Track your students." : "Continue your learning journey."}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {loading
                ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                : stat.value}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
        className="rounded-xl border border-border bg-card p-6"
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: "/dashboard/simulations", icon: Play,     bg: "bg-primary/10",  color: "text-primary",  label: "Start Simulation" },
            { href: "/dashboard/courses",     icon: BookOpen, bg: "bg-accent/10",   color: "text-accent",   label: "My Courses" },
            { href: "/dashboard/analytics",   icon: BarChart3,bg: "bg-chart-4/10",  color: "text-chart-4",  label: "View Analytics" },
            { href: "/dashboard/tds",         icon: FileText, bg: "bg-chart-5/10",  color: "text-chart-5",  label: "TDS Module" },
          ].map((action) => (
            <Link key={action.href} href={action.href}>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 w-full">
                <div className={`w-10 h-10 rounded-lg ${action.bg} flex items-center justify-center`}>
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <span className="text-sm">{action.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.45 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {isAdmin || isFaculty ? "All Courses" : "Your Courses"}
            </h2>
            <Link href="/dashboard/courses">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentCourses.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No courses yet.{" "}
              <Link href="/dashboard/courses" className="text-primary hover:underline">Browse courses</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentCourses.map((course) => {
                const badge = courseStatusLabel(course.status)
                return (
                  <Link
                    key={course.id}
                    href={`/dashboard/courses/${course.slug}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{course.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{course.category} · {course.instructor}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${badge.cls}`}>
                      {badge.text}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Recent Simulations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Simulations</h2>
            <Link href="/dashboard/simulations">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentSims.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No completed simulations yet.{" "}
              <Link href="/dashboard/simulations" className="text-primary hover:underline">Start one</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentSims.map((sim) => (
                <Link
                  key={sim.id}
                  href={`/simulations/${sim.slug}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{sim.title}</p>
                    <p className="text-xs text-muted-foreground">{sim.category}</p>
                  </div>
                  {sim.score != null && (
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold shrink-0 ${
                      sim.score >= (sim.passingScore ?? 70) ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
                    }`}>
                      {sim.score}%
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Admin Tools */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.55 }}
          className="rounded-xl border border-primary/20 bg-primary/5 p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Admin Tools</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/courses">
              <Button size="sm" variant="outline">Manage Courses</Button>
            </Link>
            <Link href="/admin/simulations">
              <Button size="sm" variant="outline">Manage Simulations</Button>
            </Link>
            <Link href="/dashboard/courses">
              <Button size="sm" variant="outline">Upload Videos</Button>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  )
}
