"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { SimulationForm } from "@/components/admin/SimulationForm"

export default function AdminCreateSimulationPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-primary">Create</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">New simulation</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Add a new training simulation, upload video content, and publish when it is ready.
            </p>
          </div>
          <Link href="/admin/simulations">
            <button className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-100">
              <ArrowLeft className="h-4 w-4" /> Back to dashboard
            </button>
          </Link>
        </div>
      </div>

      <SimulationForm />
    </div>
  )
}
