import mongoose from "mongoose"

const SimulationAssignmentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toHexString(),
    },
    simulationId: { type: String, required: true, index: true },
    assignedBy: { type: String, required: true },
    targetType: {
      type: String,
      enum: ["student", "batch", "department", "institution", "course"],
      default: "course",
    },
    targetIds: { type: [String], default: [] },
    startDate: { type: Date },
    endDate: { type: Date },
    mandatory: { type: Boolean, default: true },
    attemptLimit: { type: Number, default: 3 },
    completionRequirement: { type: String, default: "completion" },
    status: {
      type: String,
      enum: ["active", "pending", "completed", "archived"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
)

const SimulationAssignment = mongoose.models.SimulationAssignment || mongoose.model("SimulationAssignment", SimulationAssignmentSchema)

export default SimulationAssignment
