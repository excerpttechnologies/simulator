"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import SimulationPlayer from "@/components/simulations/SimulationPlayer"
import type { Simulation, SimulationAttempt } from "@/lib/types"

export default function SimulationDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [simulation, setSimulation] = useState<Simulation | null>(null)
  const [attempt, setAttempt] = useState<SimulationAttempt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadSimulationData() {
      setLoading(true)
      setError("")
      try {
        const [simRes, attemptRes] = await Promise.all([
          fetch(`/api/simulations/${slug}`, { cache: "no-store" }),
          fetch(`/api/user/simulations/${slug}/progress`, { cache: "no-store" }),
        ])

        const simData = await simRes.json()
        const attemptData = await attemptRes.json()

        if (!simRes.ok) {
          setError(simData.error || "Simulation not found.")
          return
        }

        setSimulation(simData.simulation)
        setAttempt(attemptData.attempt || null)
      } catch (err) {
        console.error("Failed to load simulation data:", err)
        setError("Unable to connect to the server. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      loadSimulationData()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading simulation workspace...</p>
      </div>
    )
  }

  if (error || !simulation) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 border border-border rounded-3xl bg-card space-y-6">
        <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Failed to load simulation</h2>
          <p className="text-sm text-muted-foreground mt-2">{error || "The simulation could not be loaded."}</p>
        </div>
        <Link href="/dashboard/simulations">
          <Button className="w-full gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Simulations
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/simulations">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <span className="text-sm text-muted-foreground">Back to Simulations</span>
      </div>

      <SimulationPlayer
        simulation={simulation}
        attempt={attempt}
        slug={slug}
      />
    </div>
  )
}
