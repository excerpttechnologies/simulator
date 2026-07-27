"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Pencil } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SimulationForm } from "@/components/admin/SimulationForm"
import { toast } from "@/components/ui/use-toast"
import type { Simulation } from "@/lib/types"

export default function AdminEditSimulationPage() {
  const params = useParams()
  const router = useRouter()
  const [simulation, setSimulation] = useState<Simulation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSimulation() {
      if (!params?.id) return
      setLoading(true)
      const response = await fetch(`/api/admin/simulations/${params.id}`)
      const data = await response.json()
      if (!response.ok) {
        toast({ title: "Unable to load simulation", description: data.error || "Please try again." })
        setLoading(false)
        return
      }
      setSimulation(data.simulation)
      setLoading(false)
    }

    loadSimulation()
  }, [params?.id])

  async function handleDelete() {
    if (!simulation) return
    if (!confirm("Delete this simulation permanently?")) return
    const response = await fetch(`/api/admin/simulations/${simulation.id}`, { method: "DELETE" })
    if (!response.ok) {
      const data = await response.json()
      toast({ title: "Unable to delete", description: data.error || "Please try again." })
      return
    }
    router.push("/admin/simulations")
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-primary">Edit Simulation</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{simulation?.title ?? "Loading..."}</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/simulations">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </Link>
            <Button variant="destructive" size="sm" className="gap-2" onClick={handleDelete}>
              <Pencil className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-neutral-200 bg-white p-10 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : simulation ? (
        <SimulationForm initialData={simulation} onSaved={() => router.push("/admin/simulations")} />
      ) : (
        <div className="rounded-3xl border border-neutral-200 bg-white p-10 text-center text-slate-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-slate-300">
          Unable to load the simulation.
        </div>
      )}
    </div>
  )
}
