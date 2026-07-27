import mongoose from "mongoose"

const TaxLeaderboardSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toHexString(),
    },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["GST", "TDS", "OVERALL"],
      index: true,
    },
    totalScore: { type: Number, required: true, default: 0 },
    simulationsCompleted: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    badges: { type: [String], default: [] },
    lastUpdated: { type: Date, default: () => new Date() },
  },
  {
    timestamps: true,
  },
)

TaxLeaderboardSchema.index({ type: 1, totalScore: -1 })
TaxLeaderboardSchema.index({ userId: 1, type: 1 }, { unique: true })

const TaxLeaderboard = mongoose.models.TaxLeaderboard || mongoose.model("TaxLeaderboard", TaxLeaderboardSchema)

export default TaxLeaderboard
