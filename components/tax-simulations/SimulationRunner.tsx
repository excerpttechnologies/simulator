"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import {
  Trophy, Clock, Star, Zap, ChevronLeft, CheckCircle2,
  XCircle, BarChart2, RefreshCw, Award
} from "lucide-react"

import GSTRegistration from "@/components/tax-simulations/GSTRegistration"
import GSTRegistrationSanath from "@/components/tax-simulations/GSTRegistrationSanath"
import GSTInvoicing from "@/components/tax-simulations/GSTInvoicing"
import GSTReturns from "@/components/tax-simulations/GSTReturns"
import GSTReconciliation from "@/components/tax-simulations/GSTReconciliation"
import GSTAudit from "@/components/tax-simulations/GSTAudit"
import TDSDeduction from "@/components/tax-simulations/TDSDeduction"
import TDSChallan from "@/components/tax-simulations/TDSChallan"
import TDSReturn from "@/components/tax-simulations/TDSReturn"
import TDSForm16 from "@/components/tax-simulations/TDSForm16"

interface SimulationRunnerProps {
  simulationType: string
  simulationId: string
}

const SIM_META: Record<string, { title: string; icon: string; color: string }> = {
  GST_REGISTRATION: { title: "GST Registration", icon: "📋", color: "from-blue-500 to-cyan-500" },
  GST_REG_SANATH: { title: "GST Registration — Sanath Sunder (SUDHARSHANA POWERS)", icon: "🏭", color: "from-blue-600 to-indigo-500" },
  GST_INVOICE: { title: "GST Tax Invoice", icon: "🧾", color: "from-violet-500 to-purple-500" },
  GST_RETURN: { title: "GSTR-1 & GSTR-3B Filing", icon: "📊", color: "from-green-500 to-emerald-500" },
  GST_RECONCILIATION: { title: "GST Reconciliation", icon: "⚖️", color: "from-orange-500 to-amber-500" },
  GST_AUDIT: { title: "GST Audit & ITC Review", icon: "🔍", color: "from-red-500 to-rose-500" },
  TDS_DEDUCTION: { title: "TDS Deduction Entry", icon: "✂️", color: "from-indigo-500 to-blue-500" },
  TDS_CHALLAN: { title: "TDS Challan (ITNS 281)", icon: "🏦", color: "from-teal-500 to-green-500" },
  TDS_RETURN: { title: "TDS Return Filing", icon: "📁", color: "from-pink-500 to-rose-500" },
  TDS_FORM16: { title: "Form 16 Generation", icon: "📜", color: "from-yellow-500 to-orange-500" },
}

const LEVEL_NAMES = [
  { min: 0, name: "Beginner Accountant", color: "text-slate-500" },
  { min: 100, name: "Junior Accountant", color: "text-blue-500" },
  { min: 300, name: "GST Specialist", color: "text-violet-500" },
  { min: 600, name: "Tax Expert", color: "text-emerald-500" },
  { min: 1000, name: "ERP Professional", color: "text-orange-500" },
  { min: 1500, name: "Audit Master", color: "text-red-500" },
  { min: 2500, name: "Finance Analyst", color: "text-yellow-500" },
]

function getLevelName(xp: number) {
  return [...LEVEL_NAMES].reverse().find((l) => xp >= l.min) || LEVEL_NAMES[0]
}

export default function SimulationRunner({ simulationType, simulationId }: SimulationRunnerProps) {
  const router = useRouter()
  const [phase, setPhase] = useState<"loading" | "running" | "result">("loading")
  const [attempt, setAttempt] = useState<any>(null)
  const [result, setResult] = useState<any>(null)
  const [elapsed, setElapsed] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)

  const meta = SIM_META[simulationType] || { title: simulationType, icon: "📝", color: "from-primary to-primary/70" }

  useEffect(() => {
    startSimulation()
  }, [])

  useEffect(() => {
    if (phase !== "running") return
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [phase])

  async function startSimulation() {
    try {
      const res = await fetch("/api/tax-simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: simulationType, simulationId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAttempt(data.simulation)
      setPhase("running")
    } catch (err: any) {
      toast({ title: "Failed to start simulation", description: err.message, variant: "destructive" })
      router.back()
    }
  }

  async function handleSubmit(responses: any, timeSpent: number) {
    try {
      const res = await fetch(`/api/tax-simulations/${attempt.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses, timeSpent }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.result)

      // Award XP based on score
      const baseXP = 50
      const bonusXP = data.result.percentage >= 90 ? 50 : data.result.percentage >= 70 ? 25 : 0
      const speedBonus = timeSpent < 120 ? 30 : 0
      const totalXP = baseXP + bonusXP + speedBonus
      setXpEarned(totalXP)

      // Update leaderboard
      const simType = simulationType.startsWith("GST") ? "GST" : "TDS"
      await fetch("/api/tax-simulations/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: simType, score: data.result.percentage, simulationId }),
      })

      setPhase("result")
    } catch (err: any) {
      toast({ title: "Failed to submit", description: err.message, variant: "destructive" })
    }
  }

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`

  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-bounce">{meta.icon}</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Generating your unique scenario...</p>
        </div>
      </div>
    )
  }

  if (phase === "result" && result) {
    const passed = result.percentage >= 70
    const level = getLevelName(xpEarned * 5)
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          <div className={`rounded-3xl bg-gradient-to-br ${meta.color} p-8 text-white text-center shadow-2xl`}>
            <div className="text-5xl mb-4">{passed ? "🎉" : "📚"}</div>
            <h2 className="text-3xl font-bold mb-2">{passed ? "Simulation Passed!" : "Keep Practicing!"}</h2>
            <p className="text-white/80 mb-6">{meta.title}</p>
            <div className="text-7xl font-black mb-2">{result.percentage}%</div>
            <p className="text-white/70 text-sm">{result.score} / {result.maxScore} points</p>

            {xpEarned > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full"
              >
                <Zap className="h-4 w-4 text-yellow-300" />
                <span className="font-bold">+{xpEarned} XP Earned!</span>
              </motion.div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" /> Score Breakdown
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {(result.breakdown || []).map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {item.correct || item.marks > 0
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      : <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                    <span className="truncate text-foreground">{item.label || item.point || item.step || `Item ${i + 1}`}</span>
                  </div>
                  <span className={`shrink-0 font-semibold ${(item.marks || 0) > 0 ? "text-emerald-500" : "text-muted-foreground"}`}>
                    {item.marks || 0}/{item.maxMarks || item.marks || 10}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => router.push("/dashboard/tax-lab")}>
              <ChevronLeft className="h-4 w-4 mr-2" /> Back to Lab
            </Button>
            <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={() => { setPhase("loading"); setResult(null); setElapsed(0); startSimulation() }}>
              <RefreshCw className="h-4 w-4 mr-2" /> Try Again
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  const SimComponent = {
    GST_REGISTRATION: GSTRegistration,
    GST_REG_SANATH: GSTRegistrationSanath,
    GST_INVOICE: GSTInvoicing,
    GST_RETURN: GSTReturns,
    GST_RECONCILIATION: GSTReconciliation,
    GST_AUDIT: GSTAudit,
    TDS_DEDUCTION: TDSDeduction,
    TDS_CHALLAN: TDSChallan,
    TDS_RETURN: TDSReturn,
    TDS_FORM16: TDSForm16,
  }[simulationType]

  return (
    <div className="space-y-6">
      <div className={`rounded-3xl bg-gradient-to-r ${meta.color} p-4 text-white`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-2xl">{meta.icon}</span>
            <div>
              <h1 className="font-bold text-lg">{meta.title}</h1>
              <p className="text-white/70 text-xs">Practical Simulation</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-mono font-semibold">{formatTime(elapsed)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
              <Star className="h-3.5 w-3.5 text-yellow-300" />
              <span className="font-semibold">+50 XP available</span>
            </div>
          </div>
        </div>
      </div>

      {SimComponent && attempt ? (
        <SimComponent
          scenario={attempt.scenario}
          onSubmit={handleSubmit}
          initialResponses={attempt.responses}
        />
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <p>Simulation type not found: {simulationType}</p>
        </div>
      )}
    </div>
  )
}
