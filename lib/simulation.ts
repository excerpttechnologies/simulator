import mongoose from "mongoose"
import type {
  Simulation,
  SimulationAttempt as SimulationAttemptType,
  SimulationLeaderboardEntry,
} from "./types"
import SimulationModel from "./models/Simulation"
import SimulationAttemptModel from "./models/SimulationAttempt"
import SimulationCertificateModel from "./models/SimulationCertificate"
import SimulationLeaderboardModel from "./models/SimulationLeaderboard"
import { connectMongoose } from "./mongoose"

export async function getAllSimulations() {
  await connectMongoose()
  return SimulationModel.find().sort({ sortOrder: 1, createdAt: -1 }).lean() as Promise<Simulation[]>
}

export async function getSimulationById(id: string) {
  await connectMongoose()
  return SimulationModel.findOne({ id }).lean() as Promise<Simulation | null>
}

export async function getSimulationBySlug(slug: string) {
  await connectMongoose()
  return SimulationModel.findOne({ slug }).lean() as Promise<Simulation | null>
}

export async function getPublishedSimulations() {
  await connectMongoose()
  const now = new Date()
  
  // Query simulations with status "published" (the published boolean field is auto-set)
  const simulations = await SimulationModel.find({
    status: "published",
    $and: [
      {
        $or: [
          { "schedule.startDate": { $exists: false } },
          { "schedule.startDate": null },
          { "schedule.startDate": { $lte: now } },
        ],
      },
      {
        $or: [
          { "schedule.endDate": { $exists: false } },
          { "schedule.endDate": null },
          { "schedule.endDate": { $gte: now } },
        ],
      },
    ],
  })
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean() as unknown as Simulation[]

  console.log(`Found ${simulations.length} published simulations for students`)
  return simulations
}

export async function createSimulation(
  input: Omit<Simulation, "id" | "createdAt" | "updatedAt" | "views" | "published" | "sortOrder">,
) {
  await connectMongoose()

  try {
    console.log("========== SIMULATION INPUT ==========")
    console.log(JSON.stringify(input, null, 2))

    const simulation = await SimulationModel.create({
      ...input,
      published: input.status === "published", // explicitly set so it's correct before the hook runs
      sortOrder: Date.now(),
    })

    return simulation.toObject() as Simulation

  } catch (error) {
    console.error("========== CREATE SIMULATION ERROR ==========")
    console.error(error)
    throw error
  }
}

export async function cloneSimulation(id: string, createdBy: string) {
  await connectMongoose()
  const existing = await SimulationModel.findOne({ id }).lean()
  if (!existing) return null

  const slug = `${existing.slug}-copy-${Date.now()}`.replace(/[^a-z0-9-]/gi, "").toLowerCase()
  const cloned = await SimulationModel.create({
    ...existing,
    id: new (await import("mongoose")).Types.ObjectId().toHexString(),
    title: `Copy of ${existing.title}`,
    slug,
    status: "draft",
    published: false,
    createdBy,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return cloned.toObject() as Simulation
}

export async function updateSimulation(
  id: string,
  updates: Partial<Omit<Simulation, "id" | "createdAt" | "updatedAt" | "views" | "published" | "sortOrder">>,
) {
  await connectMongoose()
  // Explicitly sync the published boolean whenever status changes
  const fullUpdates: any = { ...updates }
  if (updates.status !== undefined) {
    fullUpdates.published = updates.status === "published"
  }
  const simulation = await SimulationModel.findOneAndUpdate({ id }, fullUpdates, {
    new: true,
    runValidators: true,
  })
  return simulation?.toObject() as Simulation | null
}

export async function deleteSimulation(id: string) {
  await connectMongoose()
  return SimulationModel.deleteOne({ id })
}

export async function incrementSimulationViews(slug: string) {
  await connectMongoose()
  return SimulationModel.findOneAndUpdate({ slug }, { $inc: { views: 1 } }, { new: true }).lean() as Promise<Simulation | null>
}

export async function reorderSimulation(id: string, direction: "up" | "down") {
  await connectMongoose()
  const simulation = await SimulationModel.findOne({ id })
  if (!simulation) return null

  const neighbor = await SimulationModel.findOne(
    direction === "up"
      ? { sortOrder: { $lt: simulation.sortOrder } }
      : { sortOrder: { $gt: simulation.sortOrder } },
  ).sort({ sortOrder: direction === "up" ? -1 : 1 })

  if (!neighbor) {
    return simulation.toObject() as Simulation
  }

  const currentOrder = simulation.sortOrder
  simulation.sortOrder = neighbor.sortOrder
  neighbor.sortOrder = currentOrder

  await Promise.all([simulation.save(), neighbor.save()])
  return simulation.toObject() as Simulation
}

export async function getSimulationCounts() {
  await connectMongoose()
  const total = await SimulationModel.countDocuments()
  const published = await SimulationModel.countDocuments({ status: "published" })
  const drafts = await SimulationModel.countDocuments({ status: "draft" })
  const archived = await SimulationModel.countDocuments({ status: "archived" })
  const viewsResult = await SimulationModel.aggregate([{ $group: { _id: null, totalViews: { $sum: "$views" } } }])
  return {
    total,
    published,
    drafts,
    archived,
    totalViews: viewsResult[0]?.totalViews ?? 0,
  }
}

export async function getUserSimulationSummaries(userId: string) {
  await connectMongoose()
  const simulations = await getPublishedSimulations()
  const attempts = await SimulationAttemptModel.find({ userId }).lean()

  const summaries = simulations.map((simulation) => {
    const attempt = attempts
      .filter((item) => item.simulationId === simulation.id)
      .sort((a, b) => Number(new Date(b.updatedAt)) - Number(new Date(a.updatedAt)))[0]

    return {
      ...simulation,
      status: attempt?.status ?? "not-started",
      score: attempt?.score ?? null,
      completedAt: attempt?.completedAt?.toISOString() ?? null,
    }
  })

  const completedCount = summaries.filter((summary) => summary.status === "completed").length
  const attemptCount = attempts.length
  const averageScore = attemptCount > 0
    ? Math.round(attempts.reduce((sum: number, attempt: any) => sum + (Number(attempt.score) || 0), 0) / attemptCount)
    : 0

  return { summaries, stats: { completedCount, attemptCount, averageScore } }
}

export async function getLatestSimulationAttempt(userId: string, simulationId: string) {
  await connectMongoose()
  return SimulationAttemptModel.findOne({ userId, simulationId })
    .sort({ updatedAt: -1 })
    .lean() as Promise<SimulationAttemptType | null>
}

export async function saveSimulationProgress(options: {
  simulationId: string
  userId: string
  progress: Record<string, unknown>
  responses: Record<string, unknown>
  currentStep: string
  timeSpent: number
  status: SimulationAttemptType["status"]
  score: number
  completed: boolean
}) {
  await connectMongoose()
  const simulation = await SimulationModel.findOne({ id: options.simulationId }).lean()
  if (!simulation) return null

  const now = new Date()
  const activeAttempt = await SimulationAttemptModel.findOne({ simulationId: options.simulationId, userId: options.userId, status: { $ne: "completed" } }).sort({ updatedAt: -1 })

  const attemptDoc = activeAttempt
    ? activeAttempt
    : new SimulationAttemptModel({
        simulationId: options.simulationId,
        userId: options.userId,
      })

  attemptDoc.status = options.completed ? "completed" : options.status
  attemptDoc.progress = options.progress
  attemptDoc.responses = options.responses
  attemptDoc.currentStep = options.currentStep
  attemptDoc.timeSpent = options.timeSpent
  attemptDoc.score = options.score

  if (options.completed) {
    attemptDoc.completedAt = now
    if (simulation.certificateEligible && options.score >= simulation.passingScore) {
      const verificationCode = `CERT-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
      const certificate = await SimulationCertificateModel.create({
        simulationId: options.simulationId,
        attemptId: attemptDoc.id,
        userId: options.userId,
        score: options.score,
        qrCodeUrl: `https://accountin.com/verify/${verificationCode}`,
        verificationCode,
      })
      attemptDoc.certificateIssued = true
      await SimulationLeaderboardModel.updateOne(
        { simulationId: options.simulationId, userId: options.userId },
        {
          simulationId: options.simulationId,
          userId: options.userId,
          score: options.score,
          timeSpent: options.timeSpent,
        },
        { upsert: true },
      )
      await attemptDoc.save()
      return { attempt: attemptDoc.toObject(), certificate: certificate.toObject() }
    }
  }

  await attemptDoc.save()
  return { attempt: attemptDoc.toObject() }
}

export async function getSimulationLeaderboard(simulationId: string) {
  await connectMongoose()
  const entries = await SimulationLeaderboardModel.find({ simulationId })
    .sort({ score: -1, timeSpent: 1 })
    .limit(10)
     .lean() as unknown as SimulationLeaderboardEntry[]

  return entries as SimulationLeaderboardEntry[]
}

export async function getAdminSimulationAnalytics() {
  await connectMongoose()
  const totalSimulations = await SimulationModel.countDocuments()
  const completedAttempts = await SimulationAttemptModel.countDocuments({ status: "completed" })
  const attemptCount = await SimulationAttemptModel.countDocuments()
  const passResult = await SimulationAttemptModel.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: null, averageScore: { $avg: "$score" }, passed: { $sum: { $cond: [{ $gte: ["$score", 70] }, 1, 0] } } } },
  ])
  const topPerformers = await SimulationAttemptModel.find({ status: "completed" })
    .sort({ score: -1, timeSpent: 1 })
    .limit(5)
    .lean()

  const categories = await SimulationModel.aggregate([
    { $match: { status: "published" } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ])

  const averageScore = passResult[0]?.averageScore ? Math.round(passResult[0].averageScore) : 0
  const passRate = attemptCount > 0 ? Math.round((passResult[0]?.passed ?? 0) / attemptCount * 100) : 0

  return {
    assignedSimulations: totalSimulations,
    completedSimulations: completedAttempts,
    pendingSimulations: Math.max(0, totalSimulations - completedAttempts),
    passRate,
    averageScore,
    attemptCount,
    topPerformers,
    categoryPerformance: categories.map((item) => ({ category: item._id, count: item.count })),
  }
}

export { scoreSimulation, SCORING_FUNCTIONS } from "./simulationEngine"
