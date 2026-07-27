import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-server"
import { connectMongoose } from "@/lib/mongoose"
import TaxSimulation from "@/lib/models/TaxSimulation"
import StudentTaxProgress from "@/lib/models/StudentTaxProgress"
import { generateTaxScenario } from "@/lib/taxScenarioGenerator"
import { scoreSimulation } from "@/lib/simulationEngine"
import SimulationModel from "@/lib/models/Simulation"

// GET /api/tax-simulations - List all tax simulations for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectMongoose()

    const simulations = await TaxSimulation.find({ userId: user.sub })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    return NextResponse.json({ simulations }, { status: 200 })
  } catch (error) {
    console.error("Error fetching tax simulations:", error)
    return NextResponse.json({ error: "Failed to fetch simulations" }, { status: 500 })
  }
}

// POST /api/tax-simulations - Create a new tax simulation attempt
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { type, simulationId } = body

    if (!type || !simulationId) {
      return NextResponse.json({ error: "Missing type or simulationId" }, { status: 400 })
    }

    await connectMongoose()

    // Generate unique scenario for this user
    const userId = user.sub ?? user.id
    let scenario = generateTaxScenario(type, userId)

    // For Labour Law and MSME types, attach the questionSet tasks from the Simulation document
    if (type === "LABOUR_EPFO" || type === "LABOUR_ESIC" || type === "MSME_UDYAM") {
      const simDoc = await SimulationModel.findOne({ id: simulationId }).lean() as any
      if (simDoc?.questionSet?.tasks) {
        scenario = { ...(scenario as any), tasks: simDoc.questionSet.tasks }
      }
    }

    // Create new simulation attempt
    const simulation = await TaxSimulation.create({
      type,
      userId,
      simulationId,
      scenario,
      status: "in-progress",
    })

    return NextResponse.json({ simulation: simulation.toObject() }, { status: 201 })
  } catch (error) {
    console.error("Error creating tax simulation:", error)
    return NextResponse.json({ error: "Failed to create simulation" }, { status: 500 })
  }
}
