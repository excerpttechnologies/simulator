"use client"

import Link from "next/link"
import { ArrowDown, ArrowUp, Copy, Edit3, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PublishToggle } from "./PublishToggle"
import type { Simulation } from "@/lib/types"

interface SimulationTableProps {
  simulations: Simulation[]
  loading?: boolean
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onClone: (id: string) => void
  onTogglePublish: (id: string, currentStatus: string) => void
  onReorder: (id: string, direction: "up" | "down") => void
  search: string
  setSearch: (value: string) => void
  filterStatus: string
  setFilterStatus: (value: string) => void
}

const statusOptions = ["all", "published", "draft", "archived"]

export function SimulationTable({
  simulations,
  loading,
  onEdit,
  onDelete,
  onClone,
  onTogglePublish,
  onReorder,
  search,
  setSearch,
  filterStatus,
  setFilterStatus,
}: SimulationTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm shadow-slate-200/40 dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-black/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <label className="sr-only" htmlFor="simulation-search">
            Search simulations
          </label>
          <input
            id="simulation-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search simulations..."
            className="w-full rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition duration-150 focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All statuses" : option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
          <Link href="/admin/simulations/create">
            <Button size="sm">Create simulation</Button>
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm shadow-slate-200/40 dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-black/10">
        <div className="hidden grid-cols-12 gap-4 border-b border-neutral-200 px-6 py-4 text-xs uppercase tracking-[0.16em] text-slate-500 dark:border-neutral-800 dark:text-slate-400 sm:grid">
          <span className="col-span-3">Title</span>
          <span className="col-span-2">Category</span>
          <span className="col-span-2">Difficulty</span>
          <span className="col-span-2">Views</span>
          <span className="col-span-1">Status</span>
          <span className="col-span-2 text-right">Actions</span>
        </div>

        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">Loading simulations...</div>
          ) : simulations.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">No simulations match the current filter.</div>
          ) : (
            simulations.map((simulation, index) => (
              <div key={simulation.id} className="grid gap-4 px-6 py-5 text-sm sm:grid-cols-12 sm:items-center">
                <div className="sm:col-span-3">
                  <p className="font-semibold text-slate-900 dark:text-white">{simulation.title}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{simulation.description}</p>
                </div>
                <div className="sm:col-span-2 text-slate-600 dark:text-slate-300">{simulation.category}</div>
                <div className="sm:col-span-2 text-slate-600 dark:text-slate-300">{simulation.difficulty}</div>
                <div className="sm:col-span-2 text-slate-600 dark:text-slate-300">{simulation.views}</div>
                <div className="sm:col-span-1">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${simulation.status === "published" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200" : simulation.status === "draft" ? "bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-200" : "bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-200"}`}>
                    {simulation.status}
                  </span>
                </div>
                <div className="sm:col-span-2 flex flex-wrap items-center justify-end gap-2">
                  <PublishToggle
                    status={simulation.status}
                    onToggle={() => onTogglePublish(simulation.id, simulation.status)}
                  />
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => onClone(simulation.id)}>
                    <Copy className="h-4 w-4" /> Clone
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => onEdit(simulation.id)}>
                    <Edit3 className="h-4 w-4" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" className="gap-2" onClick={() => onDelete(simulation.id)}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-2" onClick={() => onReorder(simulation.id, "up") }>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-2" onClick={() => onReorder(simulation.id, "down") }>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
