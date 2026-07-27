"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/admin/EmptyState"
import { toast } from "@/components/ui/use-toast"
import type { Simulation } from "@/lib/types"

const categories = ["All", "GST", "TDS", "Income Tax", "VAT", "EPFO"]
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"]

export default function SimulationsPage() {
  const [simulations, setSimulations] = useState<Simulation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [difficulty, setDifficulty] = useState("All")

  useEffect(() => {
    loadSimulations()
  }, [])

  async function loadSimulations() {
    setLoading(true)
    try {
      const response = await fetch("/api/simulations/public", { cache: "no-store" })
      const data = await response.json()
      if (!response.ok) {
        toast({ title: "Unable to load simulations", description: data.error || "Please try again." })
        setSimulations([])
      } else {
        setSimulations(data.simulations || [])
      }
    } catch (err) {
      toast({ title: "Network error", description: "Unable to load simulations." })
      setSimulations([])
    } finally {
      setLoading(false)
    }
  }

  const filteredSimulations = useMemo(() => {
    return simulations.filter((simulation) => {
      if (category !== "All" && simulation.category !== category) return false
      if (difficulty !== "All" && simulation.difficulty !== difficulty) return false
      if (!search) return true
      const query = search.toLowerCase()
      return simulation.title.toLowerCase().includes(query) || simulation.description.toLowerCase().includes(query) || simulation.tags.some((tag) => tag.toLowerCase().includes(query))
    })
  }, [simulations, search, category, difficulty])

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-primary">Simulations</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">Available training simulations</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Browse published video simulations crafted for tax and compliance training.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
            <Search className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <input
              type="search"
              placeholder="Search simulations..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-slate-100"
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100">
            {categories.map((value) => (<option key={value} value={value}>{value}</option>))}
          </select>
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100">
            {difficulties.map((value) => (<option key={value} value={value}>{value}</option>))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-neutral-200 bg-white p-10 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          Loading published simulations...
        </div>
      ) : filteredSimulations.length === 0 ? (
        <EmptyState onAction={loadSimulations} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {filteredSimulations.map((simulation) => (
            <Link key={simulation.id} href={`/simulations/${simulation.slug}`} className="group rounded-3xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-1 hover:border-primary/40 dark:border-neutral-800 dark:bg-neutral-950">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">{simulation.category}</p>
                  <h2 className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white">{simulation.title}</h2>
                </div>
                <div className="h-20 w-28 overflow-hidden rounded-3xl bg-slate-100 dark:bg-neutral-900">
                  <img src={simulation.thumbnailUrl} alt={simulation.title} className="h-full w-full object-cover" />
                </div>
              </div>
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{simulation.description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 dark:border-neutral-800 dark:bg-neutral-900">{simulation.difficulty}</span>
                <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 dark:border-neutral-800 dark:bg-neutral-900">{simulation.duration}</span>
                <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 dark:border-neutral-800 dark:bg-neutral-900">{simulation.views} views</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
