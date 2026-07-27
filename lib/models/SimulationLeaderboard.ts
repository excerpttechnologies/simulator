import mongoose from "mongoose"

const SimulationLeaderboardSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toHexString(),
    },
    simulationId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    score: { type: Number, required: true, default: 0 },
    timeSpent: { type: Number, required: true, default: 0 },
    rank: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
)

const SimulationLeaderboard = mongoose.models.SimulationLeaderboard || mongoose.model("SimulationLeaderboard", SimulationLeaderboardSchema)

export default SimulationLeaderboard
