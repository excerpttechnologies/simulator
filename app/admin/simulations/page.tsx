"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Plus, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/admin/EmptyState"
import { StatsCards } from "@/components/admin/StatsCards"
import { SimulationTable } from "@/components/admin/SimulationTable"
import { toast } from "@/components/ui/use-toast"
import type { Simulation } from "@/lib/types"

const initialCounts = { total: 0, published: 0, drafts: 0, archived: 0, totalViews: 0 }

export default function AdminSimulationsPage() {
  const [simulations, setSimulations] = useState<Simulation[]>([])
  const [counts, setCounts] = useState(initialCounts)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    refreshSimulations()
  }, [])

  async function refreshSimulations() {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/simulations", { cache: "no-store" })
      const data = await response.json()
      if (!response.ok) {
        toast({ title: "Unable to load simulations", description: data.error || "Please try again." })
        setSimulations([])
        setCounts(initialCounts)
        return
      }
      setSimulations(data.simulations || [])
      setCounts(data.counts || initialCounts)
    } catch (error) {
      toast({ title: "Network error", description: "Unable to load simulations." })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this simulation permanently?")) return
    const response = await fetch(`/api/admin/simulations/${id}`, { method: "DELETE" })
    if (!response.ok) {
      const error = await response.json()
      toast({ title: "Unable to delete", description: error.error || "Please try again." })
      return
    }
    toast({ title: "Deleted", description: "Simulation removed successfully." })
    refreshSimulations()
  }

  async function handleTogglePublish(id: string, currentStatus: string) {
    const response = await fetch(`/api/admin/simulations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle-publish", currentStatus }),
    })
    const result = await response.json()
    if (!response.ok) {
      toast({ title: "Unable to update publish state", description: result.error || "Please try again." })
      return
    }
    toast({ title: "Status updated", description: "Simulation publish status was updated." })
    refreshSimulations()
  }

  async function handleClone(id: string) {
    const response = await fetch(`/api/admin/simulations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clone" }),
    })
    const result = await response.json()
    if (!response.ok) {
      toast({ title: "Unable to clone", description: result.error || "Please try again." })
      return
    }
    toast({ title: "Cloned", description: "Simulation duplicated successfully." })
    refreshSimulations()
  }

  async function handleReorder(id: string, direction: "up" | "down") {
    const response = await fetch(`/api/admin/simulations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reorder", direction }),
    })
    const result = await response.json()
    if (!response.ok) {
      toast({ title: "Unable to reorder", description: result.error || "Please try again." })
      return
    }
    refreshSimulations()
  }

  const filteredSimulations = useMemo(() => {
    return simulations.filter((simulation) => {
      if (filterStatus !== "all" && simulation.status !== filterStatus) return false
      if (!search) return true
      const needle = search.toLowerCase()
      return simulation.title.toLowerCase().includes(needle) || simulation.description.toLowerCase().includes(needle) || simulation.tags.some((tag) => tag.toLowerCase().includes(needle))
    })
  }, [simulations, search, filterStatus])

  const stats = [
    { label: "Total simulations", value: counts.total, hint: "Everything in the library.", accent: "primary" as const },
    { label: "Published", value: counts.published, hint: "Live and visible to users.", accent: "success" as const },
    { label: "Drafts", value: counts.drafts, hint: "Work in progress items.", accent: "muted" as const },
    { label: "Total views", value: counts.totalViews, hint: "Learner plays across simulations.", accent: "accent" as const },
  ]

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-primary">Admin</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">Simulation Management</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Manage video simulations, publish status, drafts, and analytics for your training platform.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2" onClick={refreshSimulations}>
              <RefreshCcw className="h-4 w-4" /> Refresh
            </Button>
            <Link href="/admin/simulations/create">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Create simulation
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <StatsCards stats={stats} />

      {simulations.length === 0 && !loading ? (
        <EmptyState onAction={refreshSimulations} />
      ) : (
        <SimulationTable
          simulations={filteredSimulations}
          loading={loading}
          onEdit={(id) => window.location.assign(`/admin/simulations/edit/${id}`)}
          onDelete={handleDelete}
          onClone={handleClone}
          onTogglePublish={handleTogglePublish}
          onReorder={handleReorder}
          search={search}
          setSearch={setSearch}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />
      )}
    </div>
  )
}
