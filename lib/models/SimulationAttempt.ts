import mongoose from "mongoose"

const SimulationAttemptSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toHexString(),
    },
    simulationId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["not-started", "in-progress", "completed", "failed", "abandoned"],
      default: "not-started",
    },
    score: { type: Number, default: 0 },
    startedAt: { type: Date, default: () => new Date() },
    completedAt: { type: Date },
    timeSpent: { type: Number, default: 0 },
    currentStep: { type: String, default: "intro" },
    progress: { type: mongoose.Schema.Types.Mixed, default: {} },
    responses: { type: mongoose.Schema.Types.Mixed, default: {} },
    certificateIssued: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
)

const SimulationAttempt = mongoose.models.SimulationAttempt || mongoose.model("SimulationAttempt", SimulationAttemptSchema)

export default SimulationAttempt
