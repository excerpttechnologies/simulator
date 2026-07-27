import mongoose from "mongoose"

const StudentTaxProgressSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toHexString(),
    },
    userId: { type: String, required: true, unique: true, index: true },
    gstProgress: {
      registration: { completed: { type: Boolean, default: false }, score: { type: Number, default: 0 }, attempts: { type: Number, default: 0 } },
      invoicing: { completed: { type: Boolean, default: false }, score: { type: Number, default: 0 }, attempts: { type: Number, default: 0 } },
      returns: { completed: { type: Boolean, default: false }, score: { type: Number, default: 0 }, attempts: { type: Number, default: 0 } },
      reconciliation: { completed: { type: Boolean, default: false }, score: { type: Number, default: 0 }, attempts: { type: Number, default: 0 } },
      audit: { completed: { type: Boolean, default: false }, score: { type: Number, default: 0 }, attempts: { type: Number, default: 0 } },
      overallScore: { type: Number, default: 0 },
      certificateEarned: { type: Boolean, default: false },
    },
    tdsProgress: {
      deduction: { completed: { type: Boolean, default: false }, score: { type: Number, default: 0 }, attempts: { type: Number, default: 0 } },
      challan: { completed: { type: Boolean, default: false }, score: { type: Number, default: 0 }, attempts: { type: Number, default: 0 } },
      returnFiling: { completed: { type: Boolean, default: false }, score: { type: Number, default: 0 }, attempts: { type: Number, default: 0 } },
      form16: { completed: { type: Boolean, default: false }, score: { type: Number, default: 0 }, attempts: { type: Number, default: 0 } },
      overallScore: { type: Number, default: 0 },
      certificateEarned: { type: Boolean, default: false },
    },
    incomeTaxProgress: {
      incomeTax: { completed: { type: Boolean, default: false }, score: { type: Number, default: 0 }, attempts: { type: Number, default: 0 } },
      overallScore: { type: Number, default: 0 },
      certificateEarned: { type: Boolean, default: false },
    },
    labourProgress: {
      epfo: { completed: { type: Boolean, default: false }, score: { type: Number, default: 0 }, attempts: { type: Number, default: 0 } },
      esic: { completed: { type: Boolean, default: false }, score: { type: Number, default: 0 }, attempts: { type: Number, default: 0 } },
      overallScore: { type: Number, default: 0 },
      certificateEarned: { type: Boolean, default: false },
    },
    msmeProgress: {
      udyam: { completed: { type: Boolean, default: false }, score: { type: Number, default: 0 }, attempts: { type: Number, default: 0 } },
      overallScore: { type: Number, default: 0 },
      certificateEarned: { type: Boolean, default: false },
    },
    dscProgress: {
      registration: { completed: { type: Boolean, default: false }, score: { type: Number, default: 0 }, attempts: { type: Number, default: 0 } },
      renewal: { completed: { type: Boolean, default: false }, score: { type: Number, default: 0 }, attempts: { type: Number, default: 0 } },
      revocation: { completed: { type: Boolean, default: false }, score: { type: Number, default: 0 }, attempts: { type: Number, default: 0 } },
      overallScore: { type: Number, default: 0 },
      certificateEarned: { type: Boolean, default: false },
    },
    completedSimulations: { type: [String], default: [] },
    totalScore: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    level: { type: String, default: "Beginner Accountant" },
    badges: { type: [String], default: [] },
    streak: { type: Number, default: 0 },
    dailyChallengeCompleted: { type: Boolean, default: false },
    certificatesEarned: { type: [String], default: [] },
    leaderboardRank: { type: Number, default: 0 },
    lastActivityAt: { type: Date, default: () => new Date() },
  },
  {
    timestamps: true,
  },
)

const StudentTaxProgress = mongoose.models.StudentTaxProgress || mongoose.model("StudentTaxProgress", StudentTaxProgressSchema)

export default StudentTaxProgress
