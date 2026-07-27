"use client"

import { use } from "react"
import SimulationRunner from "@/components/tax-simulations/SimulationRunner"

const TDS_TYPE_MAP: Record<string, string> = {
  deduction: "TDS_DEDUCTION",
  challan: "TDS_CHALLAN",
  return: "TDS_RETURN",
  form16: "TDS_FORM16",
}

const TDS_SIM_IDS: Record<string, string> = {
  deduction: "tds-ded-sim-001",
  challan: "tds-chl-sim-001",
  return: "tds-ret-sim-001",
  form16: "tds-f16-sim-001",
}

export default function TDSSimulationPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params)
  const simulationType = TDS_TYPE_MAP[type]
  const simulationId = TDS_SIM_IDS[type]

  if (!simulationType) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-center">
        <div>
          <div className="text-5xl mb-4">❓</div>
          <h2 className="text-xl font-bold text-foreground mb-2">Unknown TDS Simulation</h2>
          <p className="text-muted-foreground">Simulation type "{type}" not found.</p>
        </div>
      </div>
    )
  }

  return <SimulationRunner simulationType={simulationType} simulationId={simulationId} />
}
