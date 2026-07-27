import mongoose from "mongoose"

const TaxSimulationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toHexString(),
    },
    type: {
      type: String,
      required: true,
      enum: [
        "GST_REGISTRATION",
        "GST_INVOICE",
        "GST_RETURN",
        "GST_RECONCILIATION",
        "GST_AUDIT",
        "TDS_DEDUCTION",
        "TDS_CHALLAN",
        "TDS_RETURN",
        "TDS_FORM16"
      ],
    },
    userId: { type: String, required: true, index: true },
    simulationId: { type: String, required: true, index: true },
    scenario: { type: mongoose.Schema.Types.Mixed, required: true },
    responses: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["not-started", "in-progress", "completed", "failed"],
      default: "not-started",
    },
    score: { type: Number, default: 0 },
    maxScore: { type: Number, default: 100 },
    percentage: { type: Number, default: 0 },
    breakdown: { type: mongoose.Schema.Types.Mixed, default: [] },
    timeSpent: { type: Number, default: 0 },
    attemptNumber: { type: Number, default: 1 },
    completedAt: { type: Date },
    certificateIssued: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
)

TaxSimulationSchema.index({ userId: 1, type: 1 })
TaxSimulationSchema.index({ userId: 1, simulationId: 1 })

const TaxSimulation = mongoose.models.TaxSimulation || mongoose.model("TaxSimulation", TaxSimulationSchema)

export default TaxSimulation
