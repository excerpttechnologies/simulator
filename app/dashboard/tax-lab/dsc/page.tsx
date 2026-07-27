"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Lock, RefreshCw, ShieldCheck, ShieldOff } from "lucide-react"
import Link from "next/link"

interface DscModule {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  difficulty: string
  duration: string
  xp: number
  simulationId: string
  engineType: string
  color: string
  progressKey: "registration" | "renewal" | "revocation"
}

const DSC_MODULES: DscModule[] = [
  {
    id: "dsc-registration",
    title: "DSC Registration",
    description: "Apply for a new Class 3 Digital Signature Certificate from a licensed Certifying Authority for signing MCA, GST, and IT e-filings.",
    icon: <Lock className="h-6 w-6" />,
    difficulty: "Beginner",
    duration: "60 mins",
    xp: 100,
    simulationId: "DSC_REG_001",
    engineType: "DSC_REGISTRATION",
    color: "from-cyan-500 to-blue-600",
    progressKey: "registration",
  },
  {
    id: "dsc-renewal",
    title: "DSC Renewal",
    description: "Renew an expiring Digital Signature Certificate through OTP-based verification — no full video KYC required.",
    icon: <RefreshCw className="h-6 w-6" />,
    difficulty: "Beginner",
    duration: "45 mins",
    xp: 75,
    simulationId: "DSC_RENEW_001",
    engineType: "DSC_RENEWAL",
    color: "from-teal-500 to-cyan-600",
    progressKey: "renewal",
  },
  {
    id: "dsc-revocation",
    title: "DSC Revocation",
    description: "Revoke a compromised or unused DSC on resignation, key compromise, token loss, or change of details.",
    icon: <ShieldOff className="h-6 w-6" />,
    difficulty: "Beginner",
    duration: "45 mins",
    xp: 75,
    simulationId: "DSC_REVOKE_001",
    engineType: "DSC_REVOCATION",
    color: "from-rose-500 to-red-600",
    progressKey: "revocation",
  },
]

export default function DscLabPage() {
  const router = useRouter()
  const [progress, setProgress] = useState<Record<string, { completed: boolean; score: number; attempts: number }>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/tax-simulations/progress")
      .then(r => r.json())
      .then(d => {
        const dsc = d?.progress?.dscProgress ?? {}
        setProgress(dsc)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tax-lab" className="rounded-full p-2 hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-cyan-500" />
            Digital Signature Certificate
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Practice DSC Registration, Renewal, and Revocation workflows
          </p>
        </div>
      </div>

      {/* Module cards */}
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
        {DSC_MODULES.map((mod) => {
          const prog = progress[mod.progressKey]
          const isCompleted = prog?.completed ?? false
          const attempts = prog?.attempts ?? 0
          const score = prog?.score ?? 0

          return (
            <div
              key={mod.id}
              className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Color header */}
              <div className={`bg-gradient-to-r ${mod.color} p-5 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                    {mod.icon}
                  </div>
                  {isCompleted && (
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                      ✓ Completed
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-lg font-bold">{mod.title}</h3>
                <p className="text-xs text-white/70 mt-1">{mod.difficulty} • {mod.duration} • +{mod.xp} XP</p>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{mod.description}</p>

                {attempts > 0 && (
                  <div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground flex items-center justify-between">
                    <span>Best Score: <span className="font-semibold text-foreground">{score}%</span></span>
                    <span>Attempts: {attempts}</span>
                  </div>
                )}

                <button
                  onClick={() => router.push(`/dashboard/simulations/${mod.simulationId}?type=${mod.engineType}`)}
                  className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-colors text-white bg-gradient-to-r ${mod.color} hover:opacity-90`}
                >
                  {isCompleted ? "Practice Again" : attempts > 0 ? "Continue" : "Start Simulation"}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info panel */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-cyan-500" /> About Digital Signature Certificates
        </h3>
        <div className="grid gap-4 sm:grid-cols-3 text-sm text-muted-foreground">
          <div className="space-y-1">
            <p className="font-medium text-foreground">Class 3 DSC</p>
            <p>Required for signing MCA e-forms, GST filings, Income Tax returns, and tender submissions.</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">Validity</p>
            <p>DSCs are valid for 1, 2, or 3 years. Renewal must be done before expiry to avoid signing lapses.</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">Revocation</p>
            <p>A DSC must be revoked immediately on resignation, token loss, key compromise, or name change.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
