import mongoose from "mongoose"

const SimulationCertificateSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toHexString(),
    },
    simulationId: { type: String, required: true, index: true },
    attemptId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    score: { type: Number, required: true },
    issuedAt: { type: Date, default: () => new Date() },
    qrCodeUrl: { type: String, required: true },
    verificationCode: { type: String, required: true },
  },
  {
    timestamps: true,
  },
)

const SimulationCertificate = mongoose.models.SimulationCertificate || mongoose.model("SimulationCertificate", SimulationCertificateSchema)

export default SimulationCertificate
