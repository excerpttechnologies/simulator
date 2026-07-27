"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/AuthProvider"
import { Users } from "lucide-react"
import { Trophy } from "lucide-react"
import { Calendar } from "lucide-react"
import { Crown } from "lucide-react"
import { TrendingUp } from "lucide-react"
import { Clock } from "lucide-react"
import { Star } from "lucide-react"
import { Loader2 } from "lucide-react"
import { RefreshCw } from "lucide-react"

interface BatchMember {
  id: string
  name: string
  role: string
  simulationsCompleted: number
  avgScore: number
  rank: number
}

interface BatchStats {
  totalMembers: number
  avgScore: number
  totalSimulations: number
}

export default function BatchPage() {
  const { user } = useAuth()
  const [members, setMembers] = useState<BatchMember[]>([])
  const [stats, setStats] = useState<BatchStats>({ totalMembers: 0, avgScore: 0, totalSimulations: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) load()
  }, [user])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch("/api/batch/leaderboard", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setMembers(data.members || [])
        setStats(data.stats || { totalMembers: 0, avgScore: 0, totalSimulations: 0 })
      }
    } catch {
      // silently fail - show empty state
    } finally {
      setLoading(false)
    }
  }

  const myRank = members.find((m) => m.id === user?.id)?.rank ?? null

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Batch</h1>
          <p className="text-sm text-muted-foreground">Your cohort leaderboard and batch activity</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Batch Members",  value: stats.totalMembers,  icon: Users,      color: "text-primary",  bg: "bg-primary/10" },
          { label: "Avg Batch Score",value: stats.avgScore ? `${stats.avgScore}%` : "—", icon: TrendingUp, color: "text-accent",   bg: "bg-accent/10" },
          { label: "Your Rank",      value: myRank ? `#${myRank}` : "—",           icon: Trophy,     color: "text-chart-4", bg: "bg-chart-4/10" },
          { label: "Total Sims Done",value: stats.totalSimulations, icon: Clock,   color: "text-chart-5", bg: "bg-chart-5/10" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : s.value}
                </div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Leaderboard */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Crown className="h-5 w-5 text-chart-4" />
          <h2 className="text-lg font-semibold text-foreground">Leaderboard</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-medium text-foreground">No batch data yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete simulations to appear on the leaderboard.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((member) => {
              const isMe = member.id === user?.id
              const initials = member.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
              return (
                <div key={member.id}
                  className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                    isMe ? "bg-primary/5 border border-primary/20" : "hover:bg-muted"
                  }`}>
                  {/* Rank */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
                    member.rank === 1 ? "bg-chart-4 text-white" :
                    member.rank === 2 ? "bg-slate-400 text-white" :
                    member.rank === 3 ? "bg-amber-600 text-white" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {member.rank <= 3 ? <Trophy className="h-4 w-4" /> : member.rank}
                  </div>
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold ${
                    isMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}>
                    {initials}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground text-sm truncate">{member.name}</p>
                      {isMe && <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">You</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{member.simulationsCompleted} simulations completed</p>
                  </div>
                  {/* Score */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end">
                      <Star className="h-3.5 w-3.5 text-chart-4" />
                      <span className="font-semibold text-foreground text-sm">{member.avgScore}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">avg score</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Upcoming placeholder */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-xl border border-dashed border-border bg-card p-6 text-center">
        <Calendar className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
        <p className="font-medium text-foreground text-sm">Upcoming Events</p>
        <p className="text-xs text-muted-foreground mt-1">Events and live sessions will appear here when scheduled.</p>
      </motion.div>
    </div>
  )
}
