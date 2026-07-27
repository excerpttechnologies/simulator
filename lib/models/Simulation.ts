import mongoose, { type InferSchemaType } from "mongoose"

const SimulationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toHexString(),
    },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "Accounting",
        "Tally Prime",
        "GST",
        "Banking",
        "Payroll",
        "Taxation",
        "Auditing",
        "ERP",
        "Finance",
        "Stock Market",
        "Entrepreneurship",
        "HR",
        "Marketing",
        "Sales",
        "Excel",
        "Business Analytics",
        "Mock Interview",
        "Communication Skills",
        "AI Tutor",
        "Labour Laws",
        "MSME",
      ],
    },
    difficulty: { type: String, required: true, trim: true, enum: ["Beginner", "Intermediate", "Advanced"] },
    duration: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    thumbnailUrl: { type: String, required: true, trim: true },
    videoUrl: { type: String, required: true, trim: true },
    scenario: { type: String, trim: true, default: "" },
    instructions: { type: String, required: true, trim: true },
    assessmentRules: { type: String, trim: true, default: "" },
    attachments: {
      type: [
        {
          title: { type: String, trim: true },
          url: { type: String, trim: true },
          type: { type: String, trim: true, default: "attachment" },
        },
      ],
      default: [],
    },
    passingScore: { type: Number, default: 70 },
    attemptsAllowed: { type: Number, default: 3 },
    certificateEligible: { type: Boolean, default: true },
    assignmentRules: {
      type: {
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
      },
      default: {},
    },
    schedule: {
      type: {
        startDate: { type: Date },
        endDate: { type: Date },
      },
      default: {},
    },
    engineType: { type: String, trim: true, default: "JOURNAL" },
    questionSet: { type: mongoose.Schema.Types.Mixed, default: {} },
    learningObjectives: { type: [String], default: [] },
    courseId: { type: String, trim: true },
    trainingType: { type: String, trim: true, default: "simulation" },
    status: {
      type: String,
      required: true,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    published: { type: Boolean, default: false },
    createdBy: { type: String, required: true },
    views: { type: Number, default: 0 },
    sortOrder: { type: Number, default: () => Date.now() },
  },
  {
    timestamps: true,
  },
)
SimulationSchema.pre("save", function () {
  (this as any).published = (this as any).status === "published"
})

const Simulation = mongoose.models.Simulation || mongoose.model("Simulation", SimulationSchema)

export type SimulationDocument = InferSchemaType<typeof SimulationSchema>
export default Simulation
