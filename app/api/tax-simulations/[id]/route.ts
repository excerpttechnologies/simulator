import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-server"
import { connectMongoose } from "@/lib/mongoose"
import TaxSimulation from "@/lib/models/TaxSimulation"
import StudentTaxProgress from "@/lib/models/StudentTaxProgress"
import SimulationCertificate from "@/lib/models/SimulationCertificate"
import { scoreSimulation } from "@/lib/simulationEngine"

// GET /api/tax-simulations/[id] - Get specific tax simulation
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectMongoose()

    const simulation = await TaxSimulation.findOne({ id, userId: user.sub ?? user.id }).lean()
    if (!simulation) {
      return NextResponse.json({ error: "Simulation not found" }, { status: 404 })
    }

    return NextResponse.json({ simulation }, { status: 200 })
  } catch (error) {
    console.error("Error fetching tax simulation:", error)
    return NextResponse.json({ error: "Failed to fetch simulation" }, { status: 500 })
  }
}

// PUT /api/tax-simulations/[id] - Update simulation responses
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { responses, timeSpent } = body

    await connectMongoose()

    const simulation = await TaxSimulation.findOne({ id, userId: user.sub ?? user.id })
    if (!simulation) {
      return NextResponse.json({ error: "Simulation not found" }, { status: 404 })
    }

    simulation.responses = responses
    simulation.timeSpent = timeSpent || simulation.timeSpent
    await simulation.save()

    return NextResponse.json({ simulation: simulation.toObject() }, { status: 200 })
  } catch (error) {
    console.error("Error updating tax simulation:", error)
    return NextResponse.json({ error: "Failed to update simulation" }, { status: 500 })
  }
}

// POST /api/tax-simulations/[id]/submit - Submit and score simulation
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { responses, timeSpent } = body

    const userId = user.sub ?? user.id
    await connectMongoose()

    const simulation = await TaxSimulation.findOne({ id, userId })
    if (!simulation) {
      return NextResponse.json({ error: "Simulation not found" }, { status: 404 })
    }

    // Score the simulation
    const result = scoreSimulation(
      simulation.type,
      simulation.scenario,
      responses,
      simulation.scenario
    )

    // Update simulation
    simulation.responses = responses
    simulation.status = result.percentage >= 70 ? "completed" : "failed"
    simulation.score = result.score
    simulation.maxScore = result.maxScore
    simulation.percentage = result.percentage
    simulation.breakdown = result.breakdown
    simulation.timeSpent = timeSpent || simulation.timeSpent
    simulation.completedAt = new Date()
    await simulation.save()

    // Update student progress
    await updateStudentProgress(userId, simulation.type, result.percentage)

    // Issue certificate if eligible
    if (result.percentage >= 70) {
      await issueCertificateIfEligible(userId, simulation)
    }

    return NextResponse.json({
      simulation: simulation.toObject(),
      result,
    }, { status: 200 })
  } catch (error) {
    console.error("Error submitting tax simulation:", error)
    return NextResponse.json({ error: "Failed to submit simulation" }, { status: 500 })
  }
}

// Helper function to update student progress
async function updateStudentProgress(userId: string, type: string, percentage: number) {
  let progress = await StudentTaxProgress.findOne({ userId })
  
  if (!progress) {
    progress = await StudentTaxProgress.create({ userId })
  }

  const moduleMap: Record<string, { category: "gstProgress" | "tdsProgress" | "incomeTaxProgress" | "labourProgress" | "msmeProgress", module: string }> = {
    "GST_REGISTRATION": { category: "gstProgress", module: "registration" },
    "GST_REG_SANATH":   { category: "gstProgress", module: "registration" },
    "GST_INVOICE":      { category: "gstProgress", module: "invoicing" },
    "GST_RETURN":       { category: "gstProgress", module: "returns" },
    "GST_RECONCILIATION": { category: "gstProgress", module: "reconciliation" },
    "GST_AUDIT":        { category: "gstProgress", module: "audit" },
    "TDS_DEDUCTION":    { category: "tdsProgress", module: "deduction" },
    "TDS_CHALLAN":      { category: "tdsProgress", module: "challan" },
    "TDS_RETURN":       { category: "tdsProgress", module: "returnFiling" },
    "TDS_FORM16":       { category: "tdsProgress", module: "form16" },
    "INCOME_TAX":       { category: "incomeTaxProgress", module: "incomeTax" },
    "LABOUR_EPFO":      { category: "labourProgress", module: "epfo" },
    "LABOUR_ESIC":      { category: "labourProgress", module: "esic" },
    "MSME_UDYAM":       { category: "msmeProgress", module: "udyam" },
  }

  const mapping = moduleMap[type]
  if (mapping) {
    const category = progress[mapping.category] as any
    const module = category[mapping.module]
    
    module.attempts = (module.attempts || 0) + 1
    if (percentage >= 70) {
      module.completed = true
      module.score = Math.max(module.score || 0, percentage)
    }

    // Calculate overall score for category
    const modules = Object.keys(category).filter(k => k !== "overallScore" && k !== "certificateEarned")
    const totalScore = modules.reduce((sum, key) => sum + (category[key].score || 0), 0)
    category.overallScore = Math.round(totalScore / modules.length)

    // Check if eligible for certificate
    const allCompleted = modules.every(key => category[key].completed)
    if (allCompleted && category.overallScore >= 70) {
      category.certificateEarned = true
    }
  }

  progress.lastActivityAt = new Date()
  await progress.save()
}

// Helper function to issue certificate
async function issueCertificateIfEligible(userId: string, simulation: any) {
  const progress = await StudentTaxProgress.findOne({ userId })
  if (!progress) return

  const isGST = simulation.type.startsWith("GST")
  const category = isGST ? progress.gstProgress : progress.tdsProgress
  
  if (category.certificateEarned && !simulation.certificateIssued) {
    const verificationCode = `TAX-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    
    await SimulationCertificate.create({
      simulationId: simulation.simulationId,
      attemptId: simulation.id,
      userId,
      score: category.overallScore,
      qrCodeUrl: `https://accountin.com/verify/${verificationCode}`,
      verificationCode,
    })

    simulation.certificateIssued = true
    await simulation.save()

    // Add to student's certificates list
    const certType = isGST ? "GST Practitioner Certificate" : "TDS Practitioner Certificate"
    if (!progress.certificatesEarned.includes(certType)) {
      progress.certificatesEarned.push(certType)
      await progress.save()
    }
  }
}
