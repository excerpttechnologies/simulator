import { NextResponse } from "next/server"
import { connectMongoose } from "@/lib/mongoose"
import Simulation from "@/lib/models/Simulation"

// Development-only seeder. Run via POST to /api/admin/seed-simulations
// Protect with DEV_SEED_TOKEN env var or only allow in development.

const simulations: any[] = [
  {
    slug: "journal-entry-basics",
    title: "Journal Entry Simulator",
    description:
      "Apply the Golden Rules of Accounting to pass correct journal entries for real-world Indian business transactions.",
    category: "Accounting",
    difficulty: "Beginner",
    estimatedTime: "30 mins",
    tags: ["Golden Rules", "Debit & Credit", "Double Entry"],
    passingScore: 60,
    attemptLimit: 3,
    instructions:
      "Read each transaction. Select the correct Debit account and Credit account from the dropdown. Enter the exact amount. Each correct entry = 10 marks.",
  },
  {
    slug: "trial-balance-preparation",
    title: "Trial Balance Simulator",
    description:
      "Place ledger account balances on the correct Debit or Credit side and verify that the trial balance totals match.",
    category: "Accounting",
    difficulty: "Intermediate",
    estimatedTime: "25 mins",
    tags: ["Trial Balance", "Debit", "Credit", "Ledger"],
    passingScore: 60,
    attemptLimit: 3,
    instructions: "For each account, select whether the balance should appear on the Dr or Cr side.",
  },
  {
    slug: "depreciation-slm-wdv",
    title: "Depreciation Calculator",
    description:
      "Calculate yearly depreciation and book value using Straight Line Method (SLM) and Written Down Value (WDV) method.",
    category: "Accounting",
    difficulty: "Intermediate",
    estimatedTime: "30 mins",
    tags: ["SLM", "WDV", "Fixed Assets", "Depreciation"],
    passingScore: 60,
    attemptLimit: 3,
    instructions: "Calculate depreciation using SLM and WDV.",
  },
  {
    slug: "final-accounts-preparation",
    title: "Final Accounts Simulator",
    description:
      "Prepare Trading Account, Profit & Loss Account and Balance Sheet from a given Trial Balance with adjustments.",
    category: "Accounting",
    difficulty: "Advanced",
    estimatedTime: "60 mins",
    tags: ["Trading A/c", "P&L", "Balance Sheet", "Adjustments"],
    passingScore: 55,
    attemptLimit: 3,
    instructions: "Prepare final accounts from trial balance and adjustments.",
  },
  {
    slug: "gst-invoice-generator",
    title: "GST Invoice Generator",
    description:
      "Create a legally valid GST Tax Invoice. Validate GSTIN format, HSN codes, and compute CGST/SGST/IGST accurately.",
    category: "GST",
    difficulty: "Intermediate",
    estimatedTime: "25 mins",
    tags: ["GST", "GSTIN", "HSN", "Tax Invoice"],
    passingScore: 60,
    attemptLimit: 3,
    instructions: "Fill in all fields of the GST Tax Invoice and validate calculations.",
  },
  {
    slug: "gst-return-filing",
    title: "GST Return Filing",
    description: "Simulate filing GSTR-1 and GSTR-3B.",
    category: "GST",
    difficulty: "Advanced",
    estimatedTime: "45 mins",
    tags: ["GSTR-1", "GSTR-3B", "Output Tax"],
    passingScore: 55,
    attemptLimit: 3,
    instructions: "Compute output tax, ITC and net tax payable.",
  },
  {
    slug: "eway-bill-generation",
    title: "E-Way Bill Simulator",
    description: "Generate a valid E-Way Bill for goods movement.",
    category: "GST",
    difficulty: "Beginner",
    estimatedTime: "20 mins",
    tags: ["E-Way Bill", "Transport"],
    passingScore: 60,
    attemptLimit: 3,
    instructions: "Generate E-Way Bill and validate required fields.",
  },
  {
    slug: "income-tax-computation",
    title: "Income Tax Computation",
    description: "Compute income tax liability under the New Tax Regime.",
    category: "Taxation",
    difficulty: "Advanced",
    estimatedTime: "45 mins",
    tags: ["Income Tax", "New Regime"],
    passingScore: 55,
    attemptLimit: 3,
    instructions: "Compute tax steps and final liability.",
  },
  {
    slug: "tds-calculation",
    title: "TDS Calculator",
    description: "Calculate TDS under sections 194J, 194C and 194I.",
    category: "Taxation",
    difficulty: "Intermediate",
    estimatedTime: "30 mins",
    tags: ["TDS", "Income Tax"],
    passingScore: 60,
    attemptLimit: 3,
    instructions: "Calculate TDS for sample payments.",
  },
  {
    slug: "erp-purchase-cycle",
    title: "ERP Purchase Cycle",
    description: "Complete procurement workflow: PR → PO → GRN → Invoice → Payment.",
    category: "ERP",
    difficulty: "Advanced",
    estimatedTime: "50 mins",
    tags: ["ERP", "Procurement"],
    passingScore: 60,
    attemptLimit: 3,
    instructions: "Complete procurement steps in order.",
  },
  {
    slug: "erp-sales-cycle",
    title: "ERP Sales Cycle",
    description: "Complete the Sales workflow: Customer → SO → Delivery → Invoice → Receipt.",
    category: "ERP",
    difficulty: "Advanced",
    estimatedTime: "45 mins",
    tags: ["ERP", "Sales"],
    passingScore: 60,
    attemptLimit: 3,
    instructions: "Process the sales workflow steps.",
  },
  {
    slug: "inventory-fifo-valuation",
    title: "Inventory Valuation — FIFO",
    description: "Compute running stock valuation using FIFO.",
    category: "ERP",
    difficulty: "Intermediate",
    estimatedTime: "35 mins",
    tags: ["FIFO", "Inventory"],
    passingScore: 60,
    attemptLimit: 3,
    instructions: "Apply FIFO to compute closing balances.",
  },
  {
    slug: "payroll-pf-esi",
    title: "Payroll Processing",
    description: "Process monthly payroll with PF and ESI deductions.",
    category: "Payroll",
    difficulty: "Intermediate",
    estimatedTime: "35 mins",
    tags: ["Payroll", "PF", "ESI"],
    passingScore: 60,
    attemptLimit: 3,
    instructions: "Calculate payroll components and deductions.",
  },
  {
    slug: "banking-emi-reconciliation",
    title: "Banking Operations",
    description: "EMI calculations and bank reconciliation practice.",
    category: "Banking",
    difficulty: "Intermediate",
    estimatedTime: "40 mins",
    tags: ["EMI", "Bank Reconciliation"],
    passingScore: 60,
    attemptLimit: 3,
    instructions: "Calculate EMI and prepare BRS.",
  },
  {
    slug: "audit-procedure",
    title: "Audit Procedure Simulator",
    description: "Plan and perform statutory audit steps.",
    category: "Auditing",
    difficulty: "Advanced",
    estimatedTime: "60 mins",
    tags: ["Audit", "Vouching"],
    passingScore: 55,
    attemptLimit: 3,
    instructions: "Follow audit phases and answer checks.",
  },
  {
    slug: "excel-finance-functions",
    title: "Excel Formula Mastery",
    description: "Practice essential Excel functions used in finance.",
    category: "Excel",
    difficulty: "Intermediate",
    estimatedTime: "40 mins",
    tags: ["VLOOKUP", "PMT", "SUMIF"],
    passingScore: 60,
    attemptLimit: 3,
    instructions: "Write formulas to solve the exercises.",
  },
  {
    slug: "ledger-posting",
    title: "Ledger Posting Simulator",
    description: "Post journal entries into ledger accounts and find closing balances.",
    category: "Accounting",
    difficulty: "Intermediate",
    estimatedTime: "35 mins",
    tags: ["Ledger", "T-Account"],
    passingScore: 60,
    attemptLimit: 3,
    instructions: "Post entries and compute totals.",
  },
]

function mapCategory(cat: string) {
  if (!cat) return "Accounting"
  const c = cat.toLowerCase()
  if (c.includes("gst")) return "GST"
  if (c.includes("excel")) return "Excel"
  if (c.includes("audit")) return "Auditing"
  if (c.includes("erp")) return "ERP"
  if (c.includes("payroll")) return "Payroll"
  if (c.includes("bank")) return "Banking"
  if (c.includes("tax")) return "Taxation"
  return "Accounting"
}

export async function POST(req: Request) {
  const envToken = process.env.DEV_SEED_TOKEN
  const url = new URL(req.url)
  const token = url.searchParams.get("token")

  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed in production." }, { status: 403 })
  }

  if (envToken && envToken !== token) {
    return NextResponse.json({ error: "Missing or invalid token." }, { status: 401 })
  }

  await connectMongoose()

  let created = 0
  for (const s of simulations) {
    const slug = s.slug
    const exists = await Simulation.findOne({ slug }).lean()
    if (exists) continue

    const doc = new Simulation({
      title: s.title,
      slug: s.slug,
      description: s.description,
      category: mapCategory(s.category),
      difficulty: s.difficulty || "Beginner",
      duration: s.estimatedTime || "30 mins",
      tags: s.tags || [],
      thumbnailUrl: s.thumbnailUrl || "",
      videoUrl: s.videoUrl || "",
      instructions: s.instructions || "",
      passingScore: s.passingScore || 60,
      attemptsAllowed: s.attemptLimit || 3,
      certificateEligible: false,
      status: "published",
      published: true,
      createdBy: "dev",
      views: 0,
    })

    await doc.save()
    created++
  }

  return NextResponse.json({ created })
}
