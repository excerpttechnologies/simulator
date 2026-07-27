/**
 * Seed script — MSME Udyam Registration simulation
 * Run: npm run seed:msme
 */
import mongoose from "mongoose"
import * as dotenv from "dotenv"
import path from "path"
import { randomUUID } from "crypto"

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const uri = process.env.MONGODB_URI!
if (!uri) throw new Error("MONGODB_URI not set in .env.local")

const SimSchema = new mongoose.Schema({ id: { type: String, required: true, unique: true } }, { strict: false })
const Sim = mongoose.models?.["MsmeSeed"] || mongoose.model("MsmeSeed", SimSchema, "simulations")

function uid() { return randomUUID().replace(/-/g, "") }

const TASKS = [
  {
    taskNumber: 1,
    businessName: "Anand Handicrafts",
    location: "Jaipur, Rajasthan",
    bizType: "Proprietorship – Micro Enterprise",
    scenario: "Anand Handicrafts is a small home-based handicraft manufacturing unit in Jaipur with an investment in plant & machinery of ₹18 lakhs and annual turnover of ₹35 lakhs. The proprietor wants to register on the Udyam portal to avail collateral-free loans and government tender benefits.",
    applicantDetails: { legalName: "Anand Kumar Sharma", aadhaar: "234567890123", pan: "AAOAK1234N", investment: 1800000, turnover: 3500000, state: "Rajasthan", district: "Jaipur" },
    steps: [
      { stepNumber: 1, name: "Aadhaar verification", fields: [{ label: "Aadhaar Number", type: "text", correctAnswer: "234567890123", hint: "Aadhaar of the proprietor/authorized signatory" }, { label: "Name as per Aadhaar", type: "text", correctAnswer: "Anand Kumar Sharma" }, { label: "Enter OTP", type: "text", correctAnswer: "573920", hint: "Simulated OTP: 573920" }] },
      { stepNumber: 2, name: "PAN & business details", fields: [{ label: "PAN", type: "text", correctAnswer: "AAOAK1234N" }, { label: "Type of Organisation", type: "select", options: ["Proprietorship", "Partnership", "Private Limited", "LLP", "Co-operative Society", "Trust"], correctAnswer: "Proprietorship" }, { label: "Name of Enterprise", type: "text", correctAnswer: "Anand Handicrafts" }, { label: "Location of Plant/Unit", type: "text", correctAnswer: "Jaipur, Rajasthan" }] },
      { stepNumber: 3, name: "Investment & turnover details", fields: [{ label: "Investment in Plant & Machinery", type: "text", correctAnswer: "1800000" }, { label: "Annual Turnover", type: "text", correctAnswer: "3500000" }, { label: "Classification", type: "select", options: ["Micro", "Small", "Medium"], correctAnswer: "Micro", hint: "Investment ≤₹1 crore and turnover ≤₹5 crore → Micro enterprise" }] },
      { stepNumber: 4, name: "Bank & activity details", fields: [{ label: "Bank Account Number", type: "text", correctAnswer: "20456789012345" }, { label: "IFSC Code", type: "text", correctAnswer: "SBIN0012345" }, { label: "Major Activity", type: "select", options: ["Manufacturing", "Service", "Trading"], correctAnswer: "Manufacturing" }, { label: "NIC Code", type: "text", correctAnswer: "1629", hint: "NIC code for manufacture of other wood/handicraft products" }] },
      { stepNumber: 5, name: "Submit & certificate", fields: [{ label: "Declaration", type: "select", options: ["I agree", "I do not agree"], correctAnswer: "I agree" }, { label: "Udyam Registration Number Generated", type: "text", correctAnswer: "UDYAM-RJ-01-0012345", hint: "Simulated Udyam number on successful submission" }] },
    ],
  },
  {
    taskNumber: 2,
    businessName: "Vinayak Auto Components",
    location: "Pune, Maharashtra",
    bizType: "Partnership – Small Enterprise",
    scenario: "Vinayak Auto Components is a two-partner firm supplying precision auto parts near Pune, with plant & machinery investment of ₹4.5 crore and turnover of ₹28 crore. The partners are registering under Udyam to qualify as a small enterprise for MSME procurement benefits.",
    applicantDetails: { legalName: "Vinayak Patil", pan: "AAFVA5678P", investment: 45000000, turnover: 280000000, state: "Maharashtra", district: "Pune" },
    steps: [
      { stepNumber: 1, name: "Aadhaar verification", fields: [{ label: "Aadhaar Number", type: "text", correctAnswer: "345678901234" }, { label: "Name as per Aadhaar", type: "text", correctAnswer: "Vinayak Patil" }, { label: "Enter OTP", type: "text", correctAnswer: "681204", hint: "Simulated OTP: 681204" }] },
      { stepNumber: 2, name: "PAN & business details", fields: [{ label: "PAN", type: "text", correctAnswer: "AAFVA5678P" }, { label: "Type of Organisation", type: "select", options: ["Proprietorship", "Partnership", "Private Limited", "LLP", "Co-operative Society", "Trust"], correctAnswer: "Partnership" }, { label: "Name of Enterprise", type: "text", correctAnswer: "Vinayak Auto Components" }, { label: "Location of Plant/Unit", type: "text", correctAnswer: "Pune, Maharashtra" }] },
      { stepNumber: 3, name: "Investment & turnover details", fields: [{ label: "Investment in Plant & Machinery", type: "text", correctAnswer: "45000000" }, { label: "Annual Turnover", type: "text", correctAnswer: "280000000" }, { label: "Classification", type: "select", options: ["Micro", "Small", "Medium"], correctAnswer: "Small", hint: "Investment ≤₹10 crore and turnover ≤₹50 crore → Small enterprise" }] },
      { stepNumber: 4, name: "Bank & activity details", fields: [{ label: "Bank Account Number", type: "text", correctAnswer: "30567890123456" }, { label: "IFSC Code", type: "text", correctAnswer: "HDFC0023456" }, { label: "Major Activity", type: "select", options: ["Manufacturing", "Service", "Trading"], correctAnswer: "Manufacturing" }, { label: "NIC Code", type: "text", correctAnswer: "2930" }] },
      { stepNumber: 5, name: "Submit & certificate", fields: [{ label: "Declaration", type: "select", options: ["I agree", "I do not agree"], correctAnswer: "I agree" }, { label: "Udyam Registration Number Generated", type: "text", correctAnswer: "UDYAM-MH-02-0023456" }] },
    ],
  },
  {
    taskNumber: 3,
    businessName: "Sree Lakshmi Textiles",
    location: "Coimbatore, Tamil Nadu",
    bizType: "Private Limited – Medium Enterprise",
    scenario: "Sree Lakshmi Textiles Pvt. Ltd. runs a mid-sized weaving and processing unit with investment of ₹42 crore and turnover of ₹210 crore. The company secretary is completing Udyam registration to reclassify from small to medium enterprise status.",
    applicantDetails: { legalName: "Meenakshi Sundaram", pan: "AABCS6789Q", investment: 420000000, turnover: 2100000000, state: "Tamil Nadu", district: "Coimbatore" },
    steps: [
      { stepNumber: 1, name: "Aadhaar verification", fields: [{ label: "Aadhaar Number", type: "text", correctAnswer: "456789012345" }, { label: "Name as per Aadhaar", type: "text", correctAnswer: "Meenakshi Sundaram" }, { label: "Enter OTP", type: "text", correctAnswer: "790215", hint: "Simulated OTP: 790215" }] },
      { stepNumber: 2, name: "PAN & business details", fields: [{ label: "PAN", type: "text", correctAnswer: "AABCS6789Q" }, { label: "Type of Organisation", type: "select", options: ["Proprietorship", "Partnership", "Private Limited", "LLP", "Co-operative Society", "Trust"], correctAnswer: "Private Limited" }, { label: "Name of Enterprise", type: "text", correctAnswer: "Sree Lakshmi Textiles Pvt. Ltd." }, { label: "Location of Plant/Unit", type: "text", correctAnswer: "Coimbatore, Tamil Nadu" }] },
      { stepNumber: 3, name: "Investment & turnover details", fields: [{ label: "Investment in Plant & Machinery", type: "text", correctAnswer: "420000000" }, { label: "Annual Turnover", type: "text", correctAnswer: "2100000000" }, { label: "Classification", type: "select", options: ["Micro", "Small", "Medium"], correctAnswer: "Medium", hint: "Investment ≤₹50 crore and turnover ≤₹250 crore → Medium enterprise" }] },
      { stepNumber: 4, name: "Bank & activity details", fields: [{ label: "Bank Account Number", type: "text", correctAnswer: "40678901234567" }, { label: "IFSC Code", type: "text", correctAnswer: "ICIC0034567" }, { label: "Major Activity", type: "select", options: ["Manufacturing", "Service", "Trading"], correctAnswer: "Manufacturing" }, { label: "NIC Code", type: "text", correctAnswer: "1311" }] },
      { stepNumber: 5, name: "Submit & certificate", fields: [{ label: "Declaration", type: "select", options: ["I agree", "I do not agree"], correctAnswer: "I agree" }, { label: "Udyam Registration Number Generated", type: "text", correctAnswer: "UDYAM-TN-03-0034567" }] },
    ],
  },
  {
    taskNumber: 4,
    businessName: "Rapid Logistics Services",
    location: "Ahmedabad, Gujarat",
    bizType: "LLP – Small Enterprise (Service)",
    scenario: "Rapid Logistics Services LLP provides last-mile delivery and warehousing services in Ahmedabad with investment in equipment of ₹2 crore and turnover of ₹15 crore. The designated partner is registering on Udyam to access priority-sector lending for services.",
    applicantDetails: { legalName: "Kiran Shah", pan: "AAFRL7890R", investment: 20000000, turnover: 150000000, state: "Gujarat", district: "Ahmedabad" },
    steps: [
      { stepNumber: 1, name: "Aadhaar verification", fields: [{ label: "Aadhaar Number", type: "text", correctAnswer: "567890123456" }, { label: "Name as per Aadhaar", type: "text", correctAnswer: "Kiran Shah" }, { label: "Enter OTP", type: "text", correctAnswer: "824613", hint: "Simulated OTP: 824613" }] },
      { stepNumber: 2, name: "PAN & business details", fields: [{ label: "PAN", type: "text", correctAnswer: "AAFRL7890R" }, { label: "Type of Organisation", type: "select", options: ["Proprietorship", "Partnership", "Private Limited", "LLP", "Co-operative Society", "Trust"], correctAnswer: "LLP" }, { label: "Name of Enterprise", type: "text", correctAnswer: "Rapid Logistics Services LLP" }, { label: "Location of Plant/Unit", type: "text", correctAnswer: "Ahmedabad, Gujarat" }] },
      { stepNumber: 3, name: "Investment & turnover details", fields: [{ label: "Investment in Plant & Machinery", type: "text", correctAnswer: "20000000" }, { label: "Annual Turnover", type: "text", correctAnswer: "150000000" }, { label: "Classification", type: "select", options: ["Micro", "Small", "Medium"], correctAnswer: "Small" }] },
      { stepNumber: 4, name: "Bank & activity details", fields: [{ label: "Bank Account Number", type: "text", correctAnswer: "50789012345678" }, { label: "IFSC Code", type: "text", correctAnswer: "AXIS0045678" }, { label: "Major Activity", type: "select", options: ["Manufacturing", "Service", "Trading"], correctAnswer: "Service" }, { label: "NIC Code", type: "text", correctAnswer: "5229" }] },
      { stepNumber: 5, name: "Submit & certificate", fields: [{ label: "Declaration", type: "select", options: ["I agree", "I do not agree"], correctAnswer: "I agree" }, { label: "Udyam Registration Number Generated", type: "text", correctAnswer: "UDYAM-GJ-04-0045678" }] },
    ],
  },
  {
    taskNumber: 5,
    businessName: "Himalayan Herbal Foods",
    location: "Dehradun, Uttarakhand",
    bizType: "Co-operative Society – Micro Enterprise",
    scenario: "Himalayan Herbal Foods is a farmer-run co-operative processing herbal teas and dried fruits in Dehradun, with investment of ₹9 lakhs and turnover of ₹22 lakhs. The society secretary is registering on Udyam to access subsidy schemes for micro food-processing units.",
    applicantDetails: { legalName: "Devendra Rawat", pan: "AAACH8901S", investment: 900000, turnover: 2200000, state: "Uttarakhand", district: "Dehradun" },
    steps: [
      { stepNumber: 1, name: "Aadhaar verification", fields: [{ label: "Aadhaar Number", type: "text", correctAnswer: "678901234567" }, { label: "Name as per Aadhaar", type: "text", correctAnswer: "Devendra Rawat" }, { label: "Enter OTP", type: "text", correctAnswer: "935724", hint: "Simulated OTP: 935724" }] },
      { stepNumber: 2, name: "PAN & business details", fields: [{ label: "PAN", type: "text", correctAnswer: "AAACH8901S" }, { label: "Type of Organisation", type: "select", options: ["Proprietorship", "Partnership", "Private Limited", "LLP", "Co-operative Society", "Trust"], correctAnswer: "Co-operative Society" }, { label: "Name of Enterprise", type: "text", correctAnswer: "Himalayan Herbal Foods" }, { label: "Location of Plant/Unit", type: "text", correctAnswer: "Dehradun, Uttarakhand" }] },
      { stepNumber: 3, name: "Investment & turnover details", fields: [{ label: "Investment in Plant & Machinery", type: "text", correctAnswer: "900000" }, { label: "Annual Turnover", type: "text", correctAnswer: "2200000" }, { label: "Classification", type: "select", options: ["Micro", "Small", "Medium"], correctAnswer: "Micro" }] },
      { stepNumber: 4, name: "Bank & activity details", fields: [{ label: "Bank Account Number", type: "text", correctAnswer: "60890123456789" }, { label: "IFSC Code", type: "text", correctAnswer: "PUNB0056789" }, { label: "Major Activity", type: "select", options: ["Manufacturing", "Service", "Trading"], correctAnswer: "Manufacturing" }, { label: "NIC Code", type: "text", correctAnswer: "1079" }] },
      { stepNumber: 5, name: "Submit & certificate", fields: [{ label: "Declaration", type: "select", options: ["I agree", "I do not agree"], correctAnswer: "I agree" }, { label: "Udyam Registration Number Generated", type: "text", correctAnswer: "UDYAM-UK-05-0056789" }] },
    ],
  },
]

async function main() {
  console.log("🔗 Connecting to MongoDB…")
  await mongoose.connect(uri, { dbName: "saa_accounting_platform" })
  console.log("✅ Connected")

  const deleted = await Sim.deleteMany({ category: "MSME" })
  console.log(`🗑  Removed ${deleted.deletedCount} existing MSME simulations`)

  const questionSet = {
    tasks: TASKS.map((t) => ({
      taskId: uid(),
      taskNumber: t.taskNumber,
      businessName: t.businessName,
      location: t.location,
      bizType: t.bizType,
      scenario: t.scenario,
      applicantDetails: t.applicantDetails,
      steps: t.steps.map((s) => ({
        stepNumber: s.stepNumber,
        name: s.name,
        fields: s.fields.map((f: any) => ({
          label: f.label,
          type: f.type,
          ...(f.options ? { options: f.options } : {}),
          correctAnswer: f.correctAnswer,
          ...(f.hint ? { hint: f.hint } : {}),
        })),
      })),
    })),
  }

  await Sim.create({
    id: "MSME_UDYAM_001",
    title: "MSME Registration (Udyam)",
    slug: "msme-registration-udyam",
    description: "Complete Udyam registration for micro, small, and medium enterprises across 5 business scenarios.",
    category: "MSME",
    difficulty: "Beginner",
    duration: "100 mins",
    tags: ["MSME", "Udyam", "Registration", "Compliance"],
    thumbnailUrl: "/placeholder-thumbnail.jpg",
    videoUrl: "/placeholder-video.mp4",
    scenario: "Understand the complete process of Udyam registration including investment/turnover classification and the benefits unlocked by registration.",
    instructions: "Complete all 5 tasks in sequence. Each task covers a different business registering on the Udyam portal. Follow the 5-step process: Aadhaar verification → PAN & business details → Investment & turnover → Bank details → Submit.",
    assessmentRules: "Each field is graded. Investment/turnover amounts accept ±1000 tolerance. OTP fields use simulated values provided in hints.",
    passingScore: 70,
    attemptsAllowed: 3,
    certificateEligible: true,
    engineType: "MSME_UDYAM",
    questionSet,
    learningObjectives: ["Understand Udyam registration portal workflow", "Correctly classify MSME category (Micro/Small/Medium)", "Apply investment and turnover thresholds"],
    status: "published",
    published: true,
    createdBy: "system",
    views: 0,
    sortOrder: Date.now(),
  })

  console.log("✅ Seeded: MSME Registration (Udyam) — 5 tasks")
  await mongoose.disconnect()
  console.log("🎉 MSME seed complete!")
}

main().catch((e) => { console.error("❌ Seed failed:", e.message); process.exit(1) })
