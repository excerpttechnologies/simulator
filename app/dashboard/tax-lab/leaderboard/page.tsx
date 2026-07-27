"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/components/auth/AuthProvider"
import { Card } from "@/components/ui/card"
import { Medal, Zap, Star, ChevronLeft } from "lucide-react"
import { Trophy } from "lucide-react"
import Link from "next/link"

const TABS = [
  { key: "OVERALL", label: "Overall" },
  { key: "GST", label: "GST" },
  { key: "TDS", label: "TDS" },
]

const RANK_STYLES: Record<number, string> = {
  1: "bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-500/30",
  2: "bg-gradient-to-r from-slate-300 to-slate-400 text-white shadow-lg shadow-slate-500/20",
  3: "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-orange-500/20",
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("OVERALL")
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [userEntry, setUserEntry] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard(activeTab)
  }, [activeTab])

  async function fetchLeaderboard(type: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/tax-simulations/leaderboard?type=${type}&limit=50`)
      const data = await res.json()
      setLeaderboard(data.leaderboard || [])
      setUserEntry(data.userEntry || null)
    } catch {
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_50%,white_0%,transparent_60%)]" />
        <div className="relative flex items-center gap-4">
          <Link href="/dashboard/tax-lab" className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-6 w-6 text-yellow-300" />
              <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">Tax Practice Lab</span>
            </div>
            <h1 className="text-3xl font-bold">Global Leaderboard</h1>
            <p className="text-white/80 mt-1">See how you rank against all students worldwide</p>
          </div>
        </div>
      </div>

      {/* Current User Rank Card */}
      {userEntry && (
        <Card className="p-4 border-2 border-primary/30 bg-primary/5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                {userEntry.userName?.charAt(0) || "?"}
              </div>
              <div>
                <p className="font-semibold text-foreground">Your Position</p>
                <p className="text-sm text-muted-foreground">{userEntry.userName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-xl text-primary">#{userEntry.rank || "—"}</div>
                <div className="text-muted-foreground text-xs">Rank</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl text-foreground">{userEntry.totalScore || 0}</div>
                <div className="text-muted-foreground text-xs">Total Score</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl text-foreground">{userEntry.averageScore || 0}%</div>
                <div className="text-muted-foreground text-xs">Avg Score</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl text-foreground">{userEntry.simulationsCompleted || 0}</div>
                <div className="text-muted-foreground text-xs">Completed</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted rounded-2xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.key ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      {!loading && leaderboard.length >= 3 && (
        <div className="flex items-end justify-center gap-4 py-6">
          {/* 2nd */}
          <div className="flex flex-col items-center gap-2 w-28">
            <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xl font-bold text-slate-700 dark:text-slate-200">
              {leaderboard[1]?.userName?.charAt(0) || "2"}
            </div>
            <p className="text-xs font-semibold text-center text-foreground truncate w-full text-center">{leaderboard[1]?.userName}</p>
            <div className="w-full h-20 rounded-t-2xl bg-gradient-to-b from-slate-300 to-slate-400 flex items-center justify-center">
              <Medal className="h-8 w-8 text-white" />
            </div>
            <span className="text-sm font-bold text-muted-foreground">{leaderboard[1]?.totalScore} pts</span>
          </div>

          {/* 1st */}
          <div className="flex flex-col items-center gap-2 w-32">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-yellow-400/40">
              {leaderboard[0]?.userName?.charAt(0) || "1"}
            </div>
            <p className="text-xs font-bold text-center text-foreground truncate w-full text-center">{leaderboard[0]?.userName}</p>
            <div className="w-full h-28 rounded-t-2xl bg-gradient-to-b from-yellow-400 to-amber-500 flex items-center justify-center">
              <Star className="h-10 w-10 text-white" />
            </div>
            <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{leaderboard[0]?.totalScore} pts</span>
          </div>

          {/* 3rd */}
          <div className="flex flex-col items-center gap-2 w-28">
            <div className="w-14 h-14 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center text-xl font-bold text-amber-800 dark:text-amber-200">
              {leaderboard[2]?.userName?.charAt(0) || "3"}
            </div>
            <p className="text-xs font-semibold text-center text-foreground truncate w-full text-center">{leaderboard[2]?.userName}</p>
            <div className="w-full h-14 rounded-t-2xl bg-gradient-to-b from-amber-500 to-orange-600 flex items-center justify-center">
              <Medal className="h-7 w-7 text-white" />
            </div>
            <span className="text-sm font-bold text-muted-foreground">{leaderboard[2]?.totalScore} pts</span>
          </div>
        </div>
      )}

      {/* Full Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No rankings yet. Be the first to complete a simulation!</p>
        </div>
      ) : (
        <Card className="border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {leaderboard.slice(3).map((entry, idx) => {
              const isCurrentUser = entry.userId === user?.id
              return (
                <motion.div
                  key={entry.id || entry.userId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`flex items-center gap-4 px-6 py-4 transition-colors ${isCurrentUser ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-muted/50"}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${RANK_STYLES[idx + 4] || "bg-muted text-muted-foreground"}`}>
                    {idx + 4}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{entry.userName?.charAt(0) || "?"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
                      {entry.userName} {isCurrentUser && <span className="text-xs font-normal text-primary/70">(You)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{entry.simulationsCompleted} simulations</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm shrink-0">
                    <div className="text-center hidden md:block">
                      <div className="font-bold text-foreground">{entry.averageScore}%</div>
                      <div className="text-xs text-muted-foreground">Avg</div>
                    </div>
                    <div className="flex items-center gap-1 text-primary font-bold">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      {entry.totalScore}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
