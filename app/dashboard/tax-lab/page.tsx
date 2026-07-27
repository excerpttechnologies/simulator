"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FileText, Calculator, Award, TrendingUp, CheckCircle2,
  Clock, Target, Zap, Star, Flame, BarChart2,
  ChevronRight, Lock, Play
} from "lucide-react"
import { Trophy } from "lucide-react"

const LEVEL_THRESHOLDS = [
  { min: 0, max: 99, name: "Beginner Accountant", icon: "📗", color: "from-slate-400 to-slate-500" },
  { min: 100, max: 299, name: "Junior Accountant", icon: "📘", color: "from-blue-400 to-blue-600" },
  { min: 300, max: 599, name: "GST Specialist", icon: "📙", color: "from-violet-400 to-violet-600" },
  { min: 600, max: 999, name: "Tax Expert", icon: "📕", color: "from-emerald-400 to-emerald-600" },
  { min: 1000, max: 1499, name: "ERP Professional", icon: "🏆", color: "from-orange-400 to-orange-600" },
  { min: 1500, max: 2499, name: "Audit Master", icon: "🎖️", color: "from-red-400 to-red-600" },
  { min: 2500, max: Infinity, name: "Finance Analyst", icon: "👑", color: "from-yellow-400 to-yellow-600" },
]

function getLevel(xp: number) {
  return LEVEL_THRESHOLDS.find((l) => xp >= l.min && xp <= l.max) || LEVEL_THRESHOLDS[0]
}

const GST_MODULES = [
  {
    id: "registration",
    title: "GST Registration",
    description: "File a new business GST registration with PAN, state selection, and GSTIN generation.",
    icon: "📋",
    xp: "+50 XP",
    difficulty: "Beginner",
    route: "/dashboard/tax-lab/gst/registration",
    progressKey: "registration",
  },
  {
    id: "invoicing",
    title: "Tax Invoice (GST)",
    description: "Create a GST-compliant tax invoice, compute CGST/SGST/IGST, and submit to ERP.",
    icon: "🧾",
    xp: "+75 XP",
    difficulty: "Intermediate",
    route: "/dashboard/tax-lab/gst/invoicing",
    progressKey: "invoicing",
  },
  {
    id: "returns",
    title: "GSTR-1 & GSTR-3B",
    description: "File monthly GST returns – declare outward supplies and offset liability with ITC.",
    icon: "📊",
    xp: "+100 XP",
    difficulty: "Intermediate",
    route: "/dashboard/tax-lab/gst/returns",
    progressKey: "returns",
  },
  {
    id: "reconciliation",
    title: "GST Reconciliation",
    description: "Identify mismatches between books of accounts and GSTR-1, provide action plan.",
    icon: "⚖️",
    xp: "+75 XP",
    difficulty: "Advanced",
    route: "/dashboard/tax-lab/gst/reconciliation",
    progressKey: "reconciliation",
  },
  {
    id: "audit",
    title: "GST ITC Audit",
    description: "Review transactions, flag ineligible ITC under Section 17(5), write audit remarks.",
    icon: "🔍",
    xp: "+100 XP",
    difficulty: "Advanced",
    route: "/dashboard/tax-lab/gst/audit",
    progressKey: "audit",
  },
]

const TDS_MODULES = [
  {
    id: "deduction",
    title: "TDS Deduction Entry",
    description: "Select TDS section, compute deduction, post vendor payment ledger entry.",
    icon: "✂️",
    xp: "+50 XP",
    difficulty: "Beginner",
    route: "/dashboard/tax-lab/tds/deduction",
    progressKey: "deduction",
  },
  {
    id: "challan",
    title: "Challan ITNS 281",
    description: "Deposit collected TDS via ITNS 281 challan – compute surcharge and cess.",
    icon: "🏦",
    xp: "+75 XP",
    difficulty: "Intermediate",
    route: "/dashboard/tax-lab/tds/challan",
    progressKey: "challan",
  },
  {
    id: "return",
    title: "TDS Return (24Q/26Q)",
    description: "File quarterly TDS returns with deductee details, TAN validation, and totals.",
    icon: "📁",
    xp: "+100 XP",
    difficulty: "Intermediate",
    route: "/dashboard/tax-lab/tds/return",
    progressKey: "returnFiling",
  },
  {
    id: "form16",
    title: "Form 16 Generation",
    description: "Prepare employee salary certificate – compute HRA, 80C, 80D, and tax payable.",
    icon: "📜",
    xp: "+75 XP",
    difficulty: "Advanced",
    route: "/dashboard/tax-lab/tds/form16",
    progressKey: "form16",
  },
]

const INCOME_TAX_MODULES = [
  {
    id: "income_tax",
    title: "Income Tax Computation",
    description: "Compute gross salary, HRA exemption, Chapter VI-A deductions, and total tax payable with cess.",
    icon: "🧾",
    xp: "+100 XP",
    difficulty: "Intermediate",
    route: "/dashboard/tax-lab/income-tax",
    progressKey: "incomeTax",
  },
]

const LABOUR_MODULES = [
  {
    id: "epfo",
    title: "EPFO Registration",
    description: "Register 5 different establishments under EPF & MP Act 1952 — complete portal walkthrough with real business data.",
    icon: "🏛️",
    xp: "+100 XP",
    difficulty: "Intermediate",
    route: "/dashboard/tax-lab/labour/epfo",
    progressKey: "epfo",
  },
  {
    id: "esic",
    title: "ESIC Registration",
    description: "Register establishments under the ESI Act — compute insurable wages, contributions, and challan due dates.",
    icon: "🏥",
    xp: "+100 XP",
    difficulty: "Intermediate",
    route: "/dashboard/tax-lab/labour/esic",
    progressKey: "esic",
  },
]

const MSME_MODULES = [
  {
    id: "msme_udyam",
    title: "MSME Registration (Udyam)",
    description: "Register 5 different businesses on the Udyam portal — classify as Micro, Small, or Medium enterprise based on investment and turnover thresholds.",
    icon: "🏭",
    xp: "+100 XP",
    difficulty: "Beginner",
    route: "/dashboard/tax-lab/msme",
    progressKey: "udyam",
  },
]

const DSC_MODULES = [
  {
    id: "dsc_registration",
    title: "DSC Registration",
    description: "Apply for a Class 3 DSC from a licensed Certifying Authority — prerequisite for signing MCA, GST, and IT e-filings.",
    icon: "🔐",
    xp: "+100 XP",
    difficulty: "Beginner",
    route: "/dashboard/tax-lab/dsc",
    progressKey: "registration",
  },
  {
    id: "dsc_renewal",
    title: "DSC Renewal",
    description: "Renew an expiring DSC through OTP-based verification — no full video KYC required.",
    icon: "🔄",
    xp: "+75 XP",
    difficulty: "Beginner",
    route: "/dashboard/tax-lab/dsc",
    progressKey: "renewal",
  },
  {
    id: "dsc_revocation",
    title: "DSC Revocation",
    description: "Revoke a compromised or unused DSC on resignation, key compromise, token loss, or change of details.",
    icon: "🚫",
    xp: "+75 XP",
    difficulty: "Beginner",
    route: "/dashboard/tax-lab/dsc",
    progressKey: "revocation",
  },
]

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  Intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  Advanced: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
}

export default function TaxSimulationLabPage() {
  const router = useRouter()
  const [progress, setProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"gst" | "tds" | "income_tax" | "labour" | "msme" | "dsc">("gst")

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const res = await fetch("/api/tax-simulations/progress")
      const data = await res.json()
      setProgress(data.progress)
    } catch (error) {
      console.error("Failed to fetch progress:", error)
    } finally {
      setLoading(false)
    }
  }

  const xp = progress?.xp || 0
  const level = getLevel(xp)
  const nextLevel = LEVEL_THRESHOLDS.find((l) => l.min > xp)
  const xpToNext = nextLevel ? nextLevel.min - xp : 0
  const xpProgress = nextLevel ? ((xp - level.min) / (nextLevel.min - level.min)) * 100 : 100

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="text-5xl animate-pulse">🧮</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading your Tax Practice Lab...</p>
        </div>
      </div>
    )
  }

  const stats = [
    { label: "GST Score", value: `${progress?.gstProgress?.overallScore || 0}%`, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "TDS Score", value: `${progress?.tdsProgress?.overallScore || 0}%`, icon: Calculator, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Certificates", value: progress?.certificatesEarned?.length || 0, icon: Award, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Streak", value: `${progress?.streak || 0} days`, icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
  ]

  const modules =
    activeTab === "gst" ? GST_MODULES :
    activeTab === "tds" ? TDS_MODULES :
    activeTab === "income_tax" ? INCOME_TAX_MODULES :
    activeTab === "msme" ? MSME_MODULES :
    activeTab === "dsc" ? DSC_MODULES :
    LABOUR_MODULES
  const progressCategory =
    activeTab === "gst" ? "gstProgress" :
    activeTab === "tds" ? "tdsProgress" :
    activeTab === "income_tax" ? "incomeTaxProgress" :
    activeTab === "msme" ? "msmeProgress" :
    activeTab === "dsc" ? "dscProgress" :
    "labourProgress"

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-8 text-primary-foreground shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white_0%,transparent_60%)]" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{level.icon}</span>
              <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">{level.name}</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Tax Practice Lab</h1>
            <p className="text-primary-foreground/80">Master GST & TDS compliance through hands-on practical simulations</p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Zap className="h-4 w-4 text-yellow-300" />
                <span className="font-bold text-lg">{xp} XP</span>
              </div>
              {(progress?.streak || 0) > 0 && (
                <div className="flex items-center gap-2 bg-orange-400/30 px-4 py-2 rounded-full">
                  <Flame className="h-4 w-4 text-orange-200" />
                  <span className="font-semibold">{progress.streak} day streak</span>
                </div>
              )}
            </div>
            {nextLevel && (
              <div className="w-48">
                <div className="flex justify-between text-xs mb-1 text-primary-foreground/70">
                  <span>{xp} XP</span>
                  <span>{nextLevel.min} XP — {nextLevel.name}</span>
                </div>
                <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-yellow-300 transition-all duration-700"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
                <p className="text-xs mt-1 text-primary-foreground/60">{xpToNext} XP to next level</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Badges */}
      {(progress?.badges || []).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {progress.badges.map((badge: string, i: number) => (
            <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
              <Star className="h-3 w-3" /> {badge}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className="p-4 border border-border bg-card">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted rounded-2xl p-1 w-fit flex-wrap">
        <button
          onClick={() => setActiveTab("gst")}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "gst" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          📋 GST Simulations
        </button>
        <button
          onClick={() => setActiveTab("tds")}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "tds" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          ✂️ TDS Simulations
        </button>
        <button
          onClick={() => setActiveTab("income_tax")}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "income_tax" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          🧾 Income Tax
        </button>
        <button
          onClick={() => setActiveTab("labour")}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "labour" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          🏛️ Labour Laws
        </button>
        <button
          onClick={() => setActiveTab("msme")}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "msme" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          🏭 MSME
        </button>
        <button
          onClick={() => setActiveTab("dsc")}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "dsc" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          🔐 DSC
        </button>
      </div>

      {/* Simulation Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module, idx) => {
          const mp = progress?.[progressCategory]?.[module.progressKey]
          const completed = mp?.completed || false
          const attempts = mp?.attempts || 0
          const score = mp?.score || 0

          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => router.push(module.route)}
            >
              {completed && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="flex items-center gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> Passed
                  </div>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                    {module.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground mb-1">{module.title}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[module.difficulty]}`}>
                      {module.difficulty}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{module.description}</p>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{attempts} attempt{attempts !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-semibold">
                    <Zap className="h-3.5 w-3.5" />
                    <span>{module.xp}</span>
                  </div>
                  {completed && (
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <Trophy className="h-3.5 w-3.5" />
                      <span>Best: {score}%</span>
                    </div>
                  )}
                </div>

                <Button
                  className={`w-full ${completed ? "bg-muted text-foreground hover:bg-muted/80 border border-border" : "bg-primary hover:bg-primary/90"}`}
                  size="sm"
                >
                  {completed ? (
                    <><RefreshCw className="h-3.5 w-3.5 mr-2" /> Practice Again</>
                  ) : (
                    <><Play className="h-3.5 w-3.5 mr-2" /> Start Simulation</>
                  )}
                </Button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card
          className="p-6 border border-border bg-gradient-to-r from-primary/10 to-primary/5 cursor-pointer hover:shadow-md transition-all"
          onClick={() => router.push("/dashboard/tax-lab/leaderboard")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Global Leaderboard</h3>
                <p className="text-sm text-muted-foreground">See how you rank against other students</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>

        {(progress?.certificatesEarned?.length || 0) > 0 && (
          <Card className="p-6 border border-emerald-200 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 dark:border-emerald-900">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Award className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Certificates Earned</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {progress.certificatesEarned.map((cert: string, i: number) => (
                    <span key={i} className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

// need import for RefreshCw
function RefreshCw({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
    </svg>
  )
}
