/**
 * Seed script — Digital Signature Certificate simulations
 * Run: npm run seed:dsc
 */
import mongoose from "mongoose"
import * as dotenv from "dotenv"
import path from "path"
import { randomUUID } from "crypto"

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const uri = process.env.MONGODB_URI!
if (!uri) throw new Error("MONGODB_URI not set in .env.local")

const SimSchema = new mongoose.Schema({ id: { type: String, required: true, unique: true } }, { strict: false })
const Sim = mongoose.models?.["DscSeed"] || mongoose.model("DscSeed", SimSchema, "simulations")

function uid() { return randomUUID().replace(/-/g, "") }

// ── Shared applicant data across 3 simulations ──────────────────────────────
const APPLICANTS = [
  { name: "Ravi Chandran",     location: "Chennai, Tamil Nadu",       pan: "AAOPC1234K", aadhaar: "456789012345", email: "ravi.chandran@gmail.com",    phone: "9840112233", dob: "10/02/1985", dscSerial: "3082019A8B7C6D5E", newSerial: "3082019A8B7C6D5F" },
  { name: "Fatima Sheikh",     location: "Lucknow, Uttar Pradesh",    pan: "AAOPF2345L", aadhaar: "567890123456", email: "fatima.sheikh@gmail.com",    phone: "9935223344", dob: "05/09/1990", dscSerial: "3082029B9C8D7E6F", newSerial: "3082029B9C8D7E70" },
  { name: "Arvind Deshpande",  location: "Nagpur, Maharashtra",       pan: "AAOPA3456M", aadhaar: "678901234567", email: "arvind.d@rediffmail.com",    phone: "9822334455", dob: "22/11/1980", dscSerial: "3082039C0D1E2F3A", newSerial: "3082039C0D1E2F3B" },
  { name: "Neha Kulkarni",     location: "Indore, Madhya Pradesh",    pan: "AAOPN4567N", aadhaar: "789012345678", email: "neha.kulkarni@yahoo.com",    phone: "9893445566", dob: "14/03/1988", dscSerial: "3082049D1E2F3A4B", newSerial: "3082049D1E2F3A4C" },
  { name: "Joseph Mathew",     location: "Kochi, Kerala",             pan: "AAOPJ5678O", aadhaar: "890123456789", email: "joseph.mathew@gmail.com",    phone: "9847556677", dob: "30/07/1983", dscSerial: "3082059E2F3A4B5C", newSerial: "3082059E2F3A4B5D" },
]

const REG_SCENARIOS = [
  "Ravi Chandran is being appointed as a director of a new private limited company. Before he can be allotted a DIN or sign any e-form, he must first obtain a Class 3 Digital Signature Certificate from a licensed Certifying Authority.",
  "Fatima Sheikh is co-founding a private limited company and needs her own DSC before the SPICe+ incorporation form can be signed.",
  "Arvind Deshpande is the finance head of an LLP and needs a DSC to authenticate GST and ROC filings on behalf of the firm.",
  "Neha Kulkarni is being added as an additional director to an existing company and requires a fresh DSC since she has never held one before.",
  "Joseph Mathew is incorporating a one-person company (OPC) and must obtain his DSC as the sole director before filing SPICe+.",
]
const RENEW_SCENARIOS = [
  "Ravi Chandran's 2-year DSC is due to expire next month. He initiates a renewal with the same Certifying Authority to avoid any lapse in his ability to sign MCA and GST filings.",
  "Fatima Sheikh's DSC is expiring in 3 weeks and she needs to renew it to continue signing company filings.",
  "Arvind Deshpande's 3-year DSC has lapsed. He urgently initiates renewal to restore his ability to sign ROC and GST forms.",
  "Neha Kulkarni's DSC is near expiry and she initiates renewal before the deadline to avoid interruption in compliance filings.",
  "Joseph Mathew's DSC is expiring and he renews it before company closure formalities are completed.",
]
const REVOKE_SCENARIOS = [
  "Ravi Chandran has resigned as director and lost access to his company email linked to his DSC. To prevent misuse, he requests immediate revocation of his Digital Signature Certificate.",
  "Fatima Sheikh's USB token containing her DSC was stolen. She urgently requests revocation to prevent unauthorized use before applying for a fresh certificate.",
  "Arvind Deshpande suspects his DSC private key may have been compromised after a malware incident on his laptop. He requests revocation as a precaution.",
  "Neha Kulkarni changed her legal name after marriage, and her existing DSC no longer matches her updated PAN. She requests revocation before applying for a fresh certificate under her new name.",
  "Joseph Mathew is winding up his OPC and no longer needs his director DSC. As part of closure formalities, he requests formal revocation of his certificate.",
]

// ── Registration steps ───────────────────────────────────────────────────────
function regSteps(a: typeof APPLICANTS[0], idx: number) {
  const VALIDITY = ["2 Years", "2 Years", "3 Years", "2 Years", "2 Years"][idx]
  const FEE = idx === 2 ? "2200" : "1500"
  const PAYMENT = ["UPI", "Net Banking", "Card", "UPI", "Net Banking"][idx]
  return [
    { stepNumber: 1, name: "Select DSC class & usage", fields: [
      { label: "Certificate Class", type: "select", options: ["Class 3 Individual","Class 3 Organisation","DGFT"], correctAnswer: "Class 3 Individual" },
      { label: "Certificate Usage", type: "select", options: ["Signing","Encryption","Both"], correctAnswer: "Both", hint: "MCA/GST/IT filings require sign + encrypt DSC" },
      { label: "Validity Period", type: "select", options: ["1 Year","2 Years","3 Years"], correctAnswer: VALIDITY },
    ]},
    { stepNumber: 2, name: "Applicant identity details", fields: [
      { label: "Full Name", type: "text", correctAnswer: a.name },
      { label: "PAN", type: "text", correctAnswer: a.pan },
      { label: "Aadhaar Number", type: "text", correctAnswer: a.aadhaar },
      { label: "Date of Birth", type: "date", correctAnswer: a.dob },
    ]},
    { stepNumber: 3, name: "Contact & video verification", fields: [
      { label: "Email ID", type: "text", correctAnswer: a.email },
      { label: "Mobile Number", type: "text", correctAnswer: a.phone },
      { label: "Video Verification Completed", type: "select", options: ["Yes","No"], correctAnswer: "Yes", hint: "Mandatory live video KYC for DSC issuance" },
    ]},
    { stepNumber: 4, name: "Payment & token", fields: [
      { label: "USB Token Required", type: "select", options: ["Yes","No"], correctAnswer: "Yes" },
      { label: "Payment Mode", type: "select", options: ["Net Banking","Card","UPI"], correctAnswer: PAYMENT },
      { label: "Fee Paid", type: "text", correctAnswer: FEE, hint: "Typical DSC issuance fee incl. token" },
    ]},
    { stepNumber: 5, name: "Issuance", fields: [
      { label: "Declaration", type: "select", options: ["I agree","I do not agree"], correctAnswer: "I agree" },
      { label: "DSC Serial Number Generated", type: "text", correctAnswer: a.dscSerial, hint: "Simulated DSC serial number on successful issuance" },
    ]},
  ]
}

// ── Renewal steps ────────────────────────────────────────────────────────────
const RENEWAL_EXPIRY   = ["15/08/2026","22/09/2026","30/07/2026","12/09/2026","18/08/2026"]
const BEFORE_EXPIRY    = ["Yes","Yes","No","Yes","Yes"]
const EMAIL_OTP        = ["204817","317926","428037","539148","640259"]
const MOBILE_OTP_R     = ["395028","406839","517940","628051","739162"]
const RENEWAL_VALIDITY = ["2 Years","2 Years","3 Years","2 Years","2 Years"]
const RENEWAL_PAYMENT  = ["UPI","Net Banking","Card","UPI","Net Banking"]
const RENEWAL_FEE      = ["1200","1200","1800","1200","1200"]

function renewSteps(a: typeof APPLICANTS[0], idx: number) {
  return [
    { stepNumber: 1, name: "Existing certificate details", fields: [
      { label: "Existing DSC Serial Number", type: "text", correctAnswer: a.dscSerial },
      { label: "Expiry Date of Current DSC", type: "date", correctAnswer: RENEWAL_EXPIRY[idx] },
      { label: "Renewal Requested Before Expiry", type: "select", options: ["Yes","No"], correctAnswer: BEFORE_EXPIRY[idx] },
    ]},
    { stepNumber: 2, name: "Applicant confirmation", fields: [
      { label: "Full Name", type: "text", correctAnswer: a.name },
      { label: "PAN", type: "text", correctAnswer: a.pan },
      { label: "Confirm No Change in Details", type: "select", options: ["Yes","No"], correctAnswer: "Yes" },
    ]},
    { stepNumber: 3, name: "Contact & OTP verification", fields: [
      { label: "Email ID", type: "text", correctAnswer: a.email },
      { label: "Mobile Number", type: "text", correctAnswer: a.phone },
      { label: "Email OTP", type: "text", correctAnswer: EMAIL_OTP[idx], hint: "Simulated email OTP" },
      { label: "Mobile OTP", type: "text", correctAnswer: MOBILE_OTP_R[idx], hint: "Simulated mobile OTP" },
    ]},
    { stepNumber: 4, name: "Validity & payment", fields: [
      { label: "New Validity Period", type: "select", options: ["1 Year","2 Years","3 Years"], correctAnswer: RENEWAL_VALIDITY[idx] },
      { label: "Payment Mode", type: "select", options: ["Net Banking","Card","UPI"], correctAnswer: RENEWAL_PAYMENT[idx] },
      { label: "Renewal Fee Paid", type: "text", correctAnswer: RENEWAL_FEE[idx], hint: "Renewal fee is lower than fresh issuance" },
    ]},
    { stepNumber: 5, name: "Confirm & reissue", fields: [
      { label: "Declaration", type: "select", options: ["I agree","I do not agree"], correctAnswer: "I agree" },
      { label: "New DSC Serial Number Generated", type: "text", correctAnswer: a.newSerial, hint: "Simulated renewed DSC serial number" },
    ]},
  ]
}

// ── Revocation steps ─────────────────────────────────────────────────────────
const REVOKE_REASONS    = ["Resignation/Cessation","Loss of Token","Key Compromise","Change in Details","Other"]
const REVOKE_DATES      = ["20/07/2026","10/07/2026","05/07/2026","01/07/2026","15/07/2026"]
const MOBILE_OTP_V      = ["581274","692385","703496","814507","925618"]
const REVOKE_DOCS       = ["Resignation Letter","FIR/Police Complaint","Affidavit","Affidavit","Board Resolution"]
const REVOKE_CONF       = ["REV-2026-078451","REV-2026-078452","REV-2026-078453","REV-2026-078454","REV-2026-078455"]

function revokeSteps(a: typeof APPLICANTS[0], idx: number) {
  return [
    { stepNumber: 1, name: "Reason for revocation", fields: [
      { label: "Reason for Revocation", type: "select", options: ["Resignation/Cessation","Key Compromise","Loss of Token","Change in Details","Other"], correctAnswer: REVOKE_REASONS[idx] },
      { label: "DSC Serial Number", type: "text", correctAnswer: a.dscSerial },
    ]},
    { stepNumber: 2, name: "Applicant verification", fields: [
      { label: "Full Name", type: "text", correctAnswer: a.name },
      { label: "PAN", type: "text", correctAnswer: a.pan },
      { label: "Date of Cessation/Incident", type: "date", correctAnswer: REVOKE_DATES[idx] },
    ]},
    { stepNumber: 3, name: "Contact & OTP verification", fields: [
      { label: "Registered Mobile Number", type: "text", correctAnswer: a.phone },
      { label: "Mobile OTP", type: "text", correctAnswer: MOBILE_OTP_V[idx], hint: "Simulated mobile OTP" },
      { label: "Alternate Contact Email", type: "text", correctAnswer: a.email },
    ]},
    { stepNumber: 4, name: "Supporting documents", fields: [
      { label: "Supporting Document", type: "select", options: ["Resignation Letter","FIR/Police Complaint","Affidavit","Board Resolution"], correctAnswer: REVOKE_DOCS[idx] },
      { label: "Document Uploaded", type: "select", options: ["Yes","No"], correctAnswer: "Yes" },
    ]},
    { stepNumber: 5, name: "Confirm revocation", fields: [
      { label: "Declaration", type: "select", options: ["I agree","I do not agree"], correctAnswer: "I agree" },
      { label: "Revocation Confirmation Number", type: "text", correctAnswer: REVOKE_CONF[idx], hint: "Simulated revocation confirmation number" },
      { label: "Revocation Effective Date", type: "text", correctAnswer: REVOKE_DATES[idx] },
    ]},
  ]
}

// ── Build simulations ────────────────────────────────────────────────────────
const SIMS = [
  {
    id: "DSC_REG_001",
    title: "DSC Registration",
    slug: "dsc-registration",
    description: "Obtain a new Class 3 Digital Signature Certificate through a licensed Certifying Authority.",
    learningObjective: "Understand how to apply for and obtain a new Class 3 Digital Signature Certificate through a licensed Certifying Authority, a prerequisite for signing MCA, GST, and Income Tax e-filings.",
    duration: "60 mins",
    engineType: "DSC_REGISTRATION",
    scenarios: APPLICANTS.map((a, i) => ({
      taskId: uid(), taskNumber: i+1,
      businessName: a.name, location: a.location, bizType: "Individual — Proposed Director",
      scenario: REG_SCENARIOS[i],
      applicantDetails: { legalName: a.name, pan: a.pan, aadhaar: a.aadhaar, email: a.email, phone: a.phone, state: a.location.split(", ")[1], district: a.location.split(", ")[0] },
      steps: regSteps(a, i),
    })),
  },
  {
    id: "DSC_RENEW_001",
    title: "DSC Renewal",
    slug: "dsc-renewal",
    description: "Renew an existing Digital Signature Certificate before or shortly after expiry.",
    learningObjective: "Learn to renew an existing Digital Signature Certificate before or shortly after expiry, without going through full first-time video KYC verification.",
    duration: "45 mins",
    engineType: "DSC_RENEWAL",
    scenarios: APPLICANTS.map((a, i) => ({
      taskId: uid(), taskNumber: i+1,
      businessName: a.name, location: a.location, bizType: "Individual — Existing DSC Holder",
      scenario: RENEW_SCENARIOS[i],
      applicantDetails: { legalName: a.name, existingDscSerial: a.dscSerial, pan: a.pan, email: a.email, phone: a.phone },
      steps: renewSteps(a, i),
    })),
  },
  {
    id: "DSC_REVOKE_001",
    title: "DSC Revocation",
    slug: "dsc-revocation",
    description: "Revoke a Digital Signature Certificate on resignation, key compromise, or token loss.",
    learningObjective: "Understand when and how to revoke a Digital Signature Certificate and how to notify the Certifying Authority to prevent misuse.",
    duration: "45 mins",
    engineType: "DSC_REVOCATION",
    scenarios: APPLICANTS.map((a, i) => ({
      taskId: uid(), taskNumber: i+1,
      businessName: a.name, location: a.location, bizType: "Individual — Existing DSC Holder",
      scenario: REVOKE_SCENARIOS[i],
      applicantDetails: { legalName: a.name, existingDscSerial: a.dscSerial, pan: a.pan, email: a.email, phone: a.phone },
      steps: revokeSteps(a, i),
    })),
  },
]

async function main() {
  console.log("🔗 Connecting to MongoDB…")
  await mongoose.connect(uri, { dbName: "saa_accounting_platform" })
  console.log("✅ Connected")

  const deleted = await Sim.deleteMany({ category: "Digital Signature Certificate" })
  console.log(`🗑  Removed ${deleted.deletedCount} existing DSC simulations`)

  for (const sim of SIMS) {
    const { scenarios, ...meta } = sim
    await Sim.create({
      ...meta,
      category: "Digital Signature Certificate",
      difficulty: "Beginner",
      tags: ["DSC", "Digital Signature", "MCA", "Compliance"],
      thumbnailUrl: "/placeholder-thumbnail.jpg",
      videoUrl: "/placeholder-video.mp4",
      passingScore: 70,
      attemptsAllowed: 3,
      certificateEligible: true,
      questionSet: { tasks: scenarios },
      learningObjectives: [
        "Understand the DSC application/renewal/revocation workflow",
        "Complete multi-step portal forms correctly",
        "Identify the appropriate Certifying Authority procedures",
      ],
      status: "published",
      published: true,
      createdBy: "system",
      views: 0,
      sortOrder: Date.now(),
    })
    console.log(`✅ Seeded: ${meta.title} (5 tasks)`)
  }

  await mongoose.disconnect()
  console.log("🎉 DSC seed complete!")
}

main().catch((e) => { console.error("❌ Seed failed:", e.message); process.exit(1) })
