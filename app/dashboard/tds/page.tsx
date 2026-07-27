"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/AuthProvider"
import {
  Play,
  Clock,
  CheckCircle2,
  Star,
  Filter,
  Search,
  FileText,
  ArrowRight,
  Lock,
  TrendingUp,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { Trophy } from "lucide-react"

interface TDSSimulation {
  id: string
  slug: string
  title: string
  description: string
  duration: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  rating: number
  completions: number
  tags: string[]
  passingScore: number
  // from user attempt
  status: "not-started" | "in-progress" | "completed" | "locked"
  score: number | null
  progress?: number
}

interface Stats {
  total: number
  completed: number
  inProgress: number
  avgScore: number
}

export default function TDSSimulationsPage() {
  const [simulations, setSimulations] = useState<TDSSimulation[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, completed: 0, inProgress: 0, avgScore: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  async function loadData() {
    setLoading(true)
    try {
      // Fetch TDS simulations (published, filtered by category)
      const [pubRes, userRes] = await Promise.all([
        fetch("/api/simulations/public?category=TDS", { cache: "no-store" }),
        fetch("/api/user/simulations", { cache: "no-store" }),
      ])

      const pubData = pubRes.ok ? await pubRes.json() : { simulations: [] }
      const userData = userRes.ok ? await userRes.json() : { simulations: [], stats: {} }

      const published: any[] = pubData.simulations || []
      const userSims: any[] = userData.simulations || []

      // Merge published list with user progress
      const merged: TDSSimulation[] = published.map((sim: any) => {
        const userSim = userSims.find((u: any) => u.id === sim.id || u.slug === sim.slug)
        return {
          id: sim.id,
          slug: sim.slug,
          title: sim.title,
          description: sim.description,
          duration: sim.duration || "45 mins",
          difficulty: sim.difficulty || "Intermediate",
          rating: sim.rating ?? 4.5,
          completions: sim.views ?? 0,
          tags: sim.tags || [],
          passingScore: sim.passingScore ?? 70,
          status: (userSim?.status === "completed"
            ? "completed"
            : userSim?.status === "in-progress"
            ? "in-progress"
            : "not-started") as TDSSimulation["status"],
          score: userSim?.score ?? null,
          progress: userSim?.status === "in-progress" ? 45 : undefined,
        }
      })

      setSimulations(merged)

      // Calculate stats from merged data
      const completed = merged.filter((s) => s.status === "completed")
      const inProgress = merged.filter((s) => s.status === "in-progress")
      const scores = completed.map((s) => s.score ?? 0).filter((s) => s > 0)
      const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

      setStats({
        total: merged.length,
        completed: completed.length,
        inProgress: inProgress.length,
        avgScore,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleStart(sim: TDSSimulation) {
    if (sim.status === "locked") return
    router.push(`/simulations/${sim.slug}`)
  }

  async function handleStartRandom() {
    const available = simulations.filter((s) => s.status !== "locked" && s.status !== "completed")
    if (available.length === 0) return
    const random = available[Math.floor(Math.random() * available.length)]
    router.push(`/simulations/${random.slug}`)
  }

  const filtered = simulations.filter((sim) => {
    if (filter === "not-started" && sim.status !== "not-started") return false
    if (filter === "in-progress" && sim.status !== "in-progress") return false
    if (filter === "completed" && sim.status !== "completed") return false
    if (filter === "locked" && sim.status !== "locked") return false
    if (searchQuery && !sim.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const statCards = [
    { label: "Total Simulations", value: stats.total, icon: FileText, color: "text-primary", bg: "bg-primary/10" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-accent", bg: "bg-accent/10" },
    { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-chart-4", bg: "bg-chart-4/10" },
    { label: "Avg Score", value: stats.avgScore ? `${stats.avgScore}%` : "—", icon: TrendingUp, color: "text-chart-5", bg: "bg-chart-5/10" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-2">
            <FileText className="h-3 w-3" /> TDS Module
          </div>
          <h1 className="text-2xl font-bold text-foreground">TDS Simulations</h1>
          <p className="text-sm text-muted-foreground">Master TDS deduction, filing and certificate procedures</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={handleStartRandom}
            disabled={loading || simulations.filter((s) => s.status !== "locked").length === 0}
          >
            <Play className="mr-2 h-4 w-4" />
            Start Random
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : stat.value}
                </div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border flex-1">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search TDS simulations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm outline-none placeholder:text-muted-foreground flex-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none text-foreground"
          >
            <option value="all">All Status</option>
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="locked">Locked</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Loading TDS simulations...</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card p-14 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-medium text-foreground">
            {simulations.length === 0
              ? "No TDS simulations available yet"
              : "No simulations match your filter"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {simulations.length === 0
              ? "Ask your admin to publish TDS simulations."
              : "Try a different search or status filter."}
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((sim, index) => (
            <motion.div
              key={sim.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.06 }}
              className={`rounded-xl border bg-card overflow-hidden transition-colors ${
                sim.status === "locked"
                  ? "border-border opacity-70"
                  : "border-border hover:border-accent/50 cursor-pointer"
              }`}
            >
              {/* Card header */}
              <div className="h-32 bg-gradient-to-br from-accent/20 via-accent/10 to-primary/10 relative flex items-center justify-center">
                <FileText className="h-14 w-14 text-accent/25" />

                {sim.status === "completed" && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold">
                    <Trophy className="h-3 w-3" /> {sim.score}%
                  </div>
                )}
                {sim.status === "in-progress" && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-chart-4/20 text-chart-4 text-xs font-semibold">
                    <Clock className="h-3 w-3" /> In Progress
                  </div>
                )}
                {sim.status === "locked" && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                    <Lock className="h-3 w-3" /> Locked
                  </div>
                )}
                {sim.status === "not-started" && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold">
                    TDS
                  </div>
                )}

                {/* Passing score badge */}
                <div className="absolute bottom-3 left-3 text-xs text-muted-foreground bg-background/70 px-2 py-0.5 rounded-full">
                  Pass: {sim.passingScore}%
                </div>
              </div>

              {/* Card body */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground leading-snug">{sim.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{sim.description}</p>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {sim.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-chart-4" /> {sim.rating}
                  </span>
                  <span>{sim.completions.toLocaleString()} views</span>
                </div>

                {/* Progress bar for in-progress */}
                {sim.status === "in-progress" && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">{sim.progress ?? 0}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-chart-4 rounded-full"
                        style={{ width: `${sim.progress ?? 0}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Score bar for completed */}
                {sim.status === "completed" && sim.score !== null && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Your Score</span>
                      <span className={`font-semibold ${sim.score >= sim.passingScore ? "text-accent" : "text-destructive"}`}>
                        {sim.score}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${sim.score >= sim.passingScore ? "bg-accent" : "bg-destructive"}`}
                        style={{ width: `${sim.score}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    sim.difficulty === "Beginner"
                      ? "bg-accent/10 text-accent"
                      : sim.difficulty === "Intermediate"
                      ? "bg-chart-4/10 text-chart-4"
                      : "bg-destructive/10 text-destructive"
                  }`}>
                    {sim.difficulty}
                  </span>

                  <Button
                    size="sm"
                    variant={sim.status === "locked" ? "outline" : "default"}
                    disabled={sim.status === "locked"}
                    onClick={() => handleStart(sim)}
                    className={`${sim.status !== "locked" ? "bg-accent hover:bg-accent/90 text-accent-foreground" : ""}`}
                  >
                    {sim.status === "completed"
                      ? <><RefreshCw className="mr-1 h-3.5 w-3.5" /> Retry</>
                      : sim.status === "in-progress"
                      ? <><Play className="mr-1 h-3.5 w-3.5" /> Continue</>
                      : sim.status === "locked"
                      ? <><Lock className="mr-1 h-3.5 w-3.5" /> Locked</>
                      : <><Play className="mr-1 h-3.5 w-3.5" /> Start</>}
                    {sim.status !== "locked" && <ArrowRight className="ml-1 h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
