"use client"

import { use } from "react"
import SimulationRunner from "@/components/tax-simulations/SimulationRunner"

const GST_TYPE_MAP: Record<string, string> = {
  registration: "GST_REGISTRATION",
  invoicing: "GST_INVOICE",
  returns: "GST_RETURN",
  reconciliation: "GST_RECONCILIATION",
  audit: "GST_AUDIT",
}

const GST_SIM_IDS: Record<string, string> = {
  registration: "gst-reg-sim-001",
  invoicing: "gst-inv-sim-001",
  returns: "gst-ret-sim-001",
  reconciliation: "gst-rec-sim-001",
  audit: "gst-aud-sim-001",
}

export default function GSTSimulationPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params)
  const simulationType = GST_TYPE_MAP[type]
  const simulationId = GST_SIM_IDS[type]

  if (!simulationType) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-center">
        <div>
          <div className="text-5xl mb-4">❓</div>
          <h2 className="text-xl font-bold text-foreground mb-2">Unknown GST Simulation</h2>
          <p className="text-muted-foreground">Simulation type "{type}" not found.</p>
        </div>
      </div>
    )
  }

  return <SimulationRunner simulationType={simulationType} simulationId={simulationId} />
}
