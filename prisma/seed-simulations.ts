// @ts-nocheck
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

const simulations = [
  // ─── 1. JOURNAL ENTRY ────────────────────────────────────────────────────
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
      "Read each transaction. Select the correct Debit account and Credit account from the dropdown. Enter the exact amount.\n\nGolden Rules:\n• Real A/c — Debit what comes in, Credit what goes out\n• Personal A/c — Debit the receiver, Credit the giver\n• Nominal A/c — Debit all expenses/losses, Credit all incomes/gains\n\nEach correct entry = 10 marks.",
    questionsJson: JSON.stringify([
      { id: 1, transaction: "Started business with cash ₹1,00,000", correctDebit: "Cash A/c", correctCredit: "Capital A/c", amount: 100000, rule: "Real A/c: Dr what comes in | Personal A/c: Cr the giver" },
      { id: 2, transaction: "Purchased goods worth ₹25,000 for cash", correctDebit: "Purchases A/c", correctCredit: "Cash A/c", amount: 25000, rule: "Nominal A/c: Dr all expenses | Real A/c: Cr what goes out" },
      { id: 3, transaction: "Sold goods worth ₹35,000 on credit to Ramesh", correctDebit: "Debtors A/c", correctCredit: "Sales A/c", amount: 35000, rule: "Personal A/c: Dr the receiver | Nominal A/c: Cr all incomes" },
      { id: 4, transaction: "Paid rent ₹8,000 by cheque", correctDebit: "Rent A/c", correctCredit: "Bank A/c", amount: 8000, rule: "Nominal A/c: Dr all expenses | Real A/c: Cr what goes out" },
      { id: 5, transaction: "Received commission ₹5,000 in cash", correctDebit: "Cash A/c", correctCredit: "Commission A/c", amount: 5000, rule: "Real A/c: Dr what comes in | Nominal A/c: Cr all incomes" },
      { id: 6, transaction: "Purchased machinery for ₹50,000 by cheque", correctDebit: "Machinery A/c", correctCredit: "Bank A/c", amount: 50000, rule: "Real A/c: Dr what comes in | Real A/c: Cr what goes out" },
      { id: 7, transaction: "Paid salary to staff ₹15,000 in cash", correctDebit: "Salary A/c", correctCredit: "Cash A/c", amount: 15000, rule: "Nominal A/c: Dr all expenses | Real A/c: Cr what goes out" },
      { id: 8, transaction: "Withdrew ₹10,000 from business for personal use", correctDebit: "Drawings A/c", correctCredit: "Cash A/c", amount: 10000, rule: "Personal A/c: Dr the receiver | Real A/c: Cr what goes out" },
    ]),
  },

  // ─── 2. TRIAL BALANCE ────────────────────────────────────────────────────
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
    instructions:
      "For each account, select whether the balance should appear on the Dr or Cr side.\n\nRules:\n• Assets & Expenses → Debit (Dr)\n• Liabilities, Capital & Income → Credit (Cr)\n\nThe Dr column total must equal the Cr column total.",
    questionsJson: JSON.stringify([
      { account: "Cash A/c", balance: 45000, correctSide: "Dr", hint: "Asset" },
      { account: "Bank A/c", balance: 80000, correctSide: "Dr", hint: "Asset" },
      { account: "Capital A/c", balance: 200000, correctSide: "Cr", hint: "Owner's equity" },
      { account: "Bank Loan", balance: 100000, correctSide: "Cr", hint: "Liability" },
      { account: "Purchases A/c", balance: 120000, correctSide: "Dr", hint: "Expense" },
      { account: "Sales A/c", balance: 180000, correctSide: "Cr", hint: "Income" },
      { account: "Machinery A/c", balance: 150000, correctSide: "Dr", hint: "Fixed Asset" },
      { account: "Depreciation A/c", balance: 15000, correctSide: "Dr", hint: "Expense" },
      { account: "Rent A/c", balance: 24000, correctSide: "Dr", hint: "Expense" },
      { account: "Creditors A/c", balance: 40000, correctSide: "Cr", hint: "Liability" },
      { account: "Debtors A/c", balance: 60000, correctSide: "Dr", hint: "Asset" },
      { account: "Salary A/c", balance: 36000, correctSide: "Dr", hint: "Expense" },
      { account: "Commission Received", balance: 10000, correctSide: "Cr", hint: "Income" },
    ]),
  },

  // ─── 3. DEPRECIATION ─────────────────────────────────────────────────────
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
    instructions:
      "SLM Formula: Annual Depreciation = (Cost − Salvage Value) ÷ Useful Life\nWDV Formula: Depreciation = Opening Book Value × Rate%\n\nFill in the Depreciation and Closing Book Value for each year.\nAnswers within ±₹50 tolerance are accepted.",
    questionsJson: JSON.stringify({
      assetName: "Manufacturing Plant",
      cost: 500000,
      salvageValue: 50000,
      usefulLife: 5,
      method: "SLM",
      wdvRate: 20,
    }),
  },

  // ─── 4. FINAL ACCOUNTS ───────────────────────────────────────────────────
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
    instructions:
      "Step 1 — Trading Account: Gross Profit = Sales + Closing Stock − Opening Stock − Purchases − Direct Expenses\nStep 2 — P&L Account: Net Profit = Gross Profit + Other Income − Indirect Expenses\nStep 3 — Balance Sheet: Assets side must equal Liabilities side\n\nApply all adjustments listed below the trial balance.",
    questionsJson: JSON.stringify({
      trialBalance: [
        { account: "Opening Stock", dr: 40000, cr: 0 },
        { account: "Purchases", dr: 200000, cr: 0 },
        { account: "Sales", dr: 0, cr: 320000 },
        { account: "Wages", dr: 18000, cr: 0 },
        { account: "Carriage Inward", dr: 5000, cr: 0 },
        { account: "Salaries", dr: 36000, cr: 0 },
        { account: "Rent", dr: 24000, cr: 0 },
        { account: "Advertisement", dr: 12000, cr: 0 },
        { account: "Discount Allowed", dr: 4000, cr: 0 },
        { account: "Commission Received", dr: 0, cr: 8000 },
        { account: "Machinery", dr: 150000, cr: 0 },
        { account: "Furniture", dr: 30000, cr: 0 },
        { account: "Debtors", dr: 60000, cr: 0 },
        { account: "Cash", dr: 25000, cr: 0 },
        { account: "Bank", dr: 45000, cr: 0 },
        { account: "Capital", dr: 0, cr: 300000 },
        { account: "Loan", dr: 0, cr: 80000 },
        { account: "Creditors", dr: 0, cr: 52000 },
      ],
      adjustments: [
        "Closing Stock: ₹55,000",
        "Depreciation on Machinery @ 10% p.a.",
        "Outstanding Salaries: ₹4,000",
        "Prepaid Rent: ₹2,000",
      ],
      answers: { grossProfit: 112000, netProfit: 38000, totalAssets: 380000 },
    }),
  },

  // ─── 5. GST INVOICE ──────────────────────────────────────────────────────
  {
    slug: "gst-invoice-generator",
    title: "GST Invoice Generator",
    description:
      "Create a legally valid GST Tax Invoice. Validate GSTIN format, HSN codes, and compute CGST/SGST/IGST accurately.",
    category: "GST & Tax",
    difficulty: "Intermediate",
    estimatedTime: "25 mins",
    tags: ["GST", "GSTIN", "HSN", "Tax Invoice", "CGST", "SGST"],
    passingScore: 60,
    attemptLimit: 3,
    instructions:
      "Fill in all fields of the GST Tax Invoice.\n\nValidation Rules:\n• GSTIN: 15-char — 2-digit state code + 5 letters + 4 digits + 1 letter + 1 alphanumeric + Z + 1 char\n• Intra-state: CGST = SGST = (GST Rate / 2) × Taxable Value\n• Inter-state: IGST = GST Rate × Taxable Value\n• Total = Taxable Value + CGST + SGST (or + IGST)",
    questionsJson: JSON.stringify({
      scenario:
        "Sunrise Electronics Pvt Ltd (Maharashtra, GSTIN: 27AABCS1234A1Z5) sells 10 Laptops to Techzone Pvt Ltd (Maharashtra, GSTIN: 27AABCT5678B1Z3) at ₹45,000 each. GST Rate: 18%. Intra-state supply.",
      sellerGSTIN: "27AABCS1234A1Z5",
      buyerGSTIN: "27AABCT5678B1Z3",
      itemName: "Laptop",
      hsnCode: "847130",
      quantity: 10,
      unitPrice: 45000,
      taxableValue: 450000,
      gstRate: 18,
      supplyType: "Intrastate",
      cgst: 40500,
      sgst: 40500,
      igst: 0,
      totalAmount: 531000,
    }),
  },

  // ─── 6. GST RETURN ───────────────────────────────────────────────────────
  {
    slug: "gst-return-filing",
    title: "GST Return Filing",
    description:
      "Simulate filing GSTR-1 and GSTR-3B. Compute output tax liability, ITC available, and net tax payable.",
    category: "GST & Tax",
    difficulty: "Advanced",
    estimatedTime: "45 mins",
    tags: ["GSTR-1", "GSTR-3B", "Output Tax", "ITC", "GST Filing"],
    passingScore: 55,
    attemptLimit: 3,
    instructions:
      "GSTR-1: Report all outward supplies — B2B (with GSTIN) and B2C separately.\nGSTR-3B: Summary return — Output Tax, ITC Claimed, Net Tax Payable.\n\nFormulas:\n• Output Tax = Sum of GST on all sales\n• Net Tax = Output Tax − ITC Available\n• Late fee: ₹50/day (₹20/day for Nil returns)",
    questionsJson: JSON.stringify({
      month: "March 2024",
      b2bSales: 800000,
      b2cSales: 200000,
      b2bGSTRate: 18,
      b2cGSTRate: 12,
      purchasesEligible: 600000,
      purchasesGSTRate: 18,
      correctOutputTax: 168000,
      correctITC: 108000,
      correctNetTax: 60000,
    }),
  },

  // ─── 7. E-WAY BILL ───────────────────────────────────────────────────────
  {
    slug: "eway-bill-generation",
    title: "E-Way Bill Simulator",
    description:
      "Generate a valid E-Way Bill for goods movement. Validate GSTIN, vehicle number format, and mandatory fields.",
    category: "GST & Tax",
    difficulty: "Beginner",
    estimatedTime: "20 mins",
    tags: ["E-Way Bill", "Transport", "GSTIN", "GST Compliance"],
    passingScore: 60,
    attemptLimit: 3,
    instructions:
      "E-Way Bill is mandatory when value of goods > ₹50,000.\n\nValidation:\n• Vehicle number format: AA00BB0000 (e.g. MH12AB1234)\n• GSTIN: 15-character alphanumeric\n• Distance must be in km\n• Supply type: Outward / Inward",
    questionsJson: JSON.stringify({
      scenario:
        "Zara Textiles (Mumbai, GSTIN: 27AABCZ1234A1Z5) is dispatching 500 kg Cotton Fabric (HSN: 5208) worth ₹1,50,000 to Fashion Hub (Delhi, GSTIN: 07AABCF5678B1Z3). Transporter: Fast Logistics, Vehicle: MH12AB1234, Distance: 1,400 km.",
      fromGSTIN: "27AABCZ1234A1Z5",
      toGSTIN: "07AABCF5678B1Z3",
      hsnCode: "5208",
      value: 150000,
      gstRate: 5,
      vehicleNumber: "MH12AB1234",
      distance: 1400,
    }),
  },

  // ─── 8. INCOME TAX ───────────────────────────────────────────────────────
  {
    slug: "income-tax-computation",
    title: "Income Tax Computation",
    description:
      "Compute income tax liability under the New Tax Regime for FY 2024-25 step by step.",
    category: "GST & Tax",
    difficulty: "Advanced",
    estimatedTime: "45 mins",
    tags: ["Income Tax", "New Regime", "Tax Slabs", "FY 2024-25", "Cess"],
    passingScore: 55,
    attemptLimit: 3,
    instructions:
      "New Tax Regime Slabs (FY 2024-25):\n₹0–3L → Nil | ₹3–6L → 5% | ₹6–9L → 10% | ₹9–12L → 15% | ₹12–15L → 20% | >₹15L → 30%\n\nAdd 4% Health & Education Cess on tax.\nStandard Deduction (salaried): ₹50,000\n\nCompute each step in the accordion and enter the values.",
    questionsJson: JSON.stringify({
      employeeName: "Rahul Sharma",
      basicSalary: 720000,
      hra: 144000,
      da: 72000,
      otherAllowances: 60000,
      rentPaid: 180000,
      cityType: "Metro",
      section80C: 150000,
      section80D: 25000,
      otherIncome: 40000,
      financialYear: "2024-25",
      regime: "New",
    }),
  },

  // ─── 9. TDS ──────────────────────────────────────────────────────────────
  {
    slug: "tds-calculation",
    title: "TDS Calculator",
    description:
      "Calculate TDS under sections 194J, 194C and 194I for professional fees, contractor payments and rent.",
    category: "GST & Tax",
    difficulty: "Intermediate",
    estimatedTime: "30 mins",
    tags: ["TDS", "Section 194J", "194C", "194I", "Income Tax"],
    passingScore: 60,
    attemptLimit: 3,
    instructions:
      "TDS Rates:\n• 194J — Professional/Technical Fees: 10% (threshold ₹30,000 p.a.)\n• 194C — Contractor: 1% Individual / 2% Company (threshold ₹30,000 per txn)\n• 194I — Rent: 10% Land/Building, 2% Plant (threshold ₹2,40,000 p.a.)\n\nDue Date: 7th of the following month.",
    questionsJson: JSON.stringify([
      { id: 1, type: "Professional Fees", payee: "CA Mehta & Associates", amount: 80000, section: "194J", rate: 10, threshold: 30000, correctTDS: 8000, dueDate: "7th of next month" },
      { id: 2, type: "Contractor Payment", payee: "BuildWell Pvt Ltd (Company)", amount: 250000, section: "194C", rate: 2, threshold: 30000, correctTDS: 5000, dueDate: "7th of next month" },
      { id: 3, type: "Rent — Building", payee: "Shyam Properties", amount: 300000, section: "194I", rate: 10, threshold: 240000, correctTDS: 30000, dueDate: "7th of next month" },
      { id: 4, type: "Technical Fees", payee: "IT Solutions Ltd", amount: 45000, section: "194J", rate: 2, threshold: 30000, correctTDS: 900, dueDate: "7th of next month" },
    ]),
  },

  // ─── 10. ERP PURCHASE CYCLE ──────────────────────────────────────────────
  {
    slug: "erp-purchase-cycle",
    title: "ERP Purchase Cycle",
    description:
      "Complete the full SAP/ERPNext-style procurement workflow: Vendor Creation → PR → PO → GRN → Invoice → Payment.",
    category: "ERP",
    difficulty: "Advanced",
    estimatedTime: "50 mins",
    tags: ["SAP", "ERPNext", "Purchase Order", "GRN", "Procurement"],
    passingScore: 60,
    attemptLimit: 3,
    instructions:
      "Complete all 6 steps in sequence. Each step unlocks only after the previous is saved.\n\n1. Vendor Master Creation\n2. Purchase Requisition (PR)\n3. Purchase Order (PO)\n4. Goods Receipt Note (GRN)\n5. Vendor Invoice Entry\n6. Payment Processing\n\nAll amounts in INR. GSTIN format must be valid.",
    questionsJson: JSON.stringify({
      scenario: "Your company Sunrise Manufacturing needs to purchase 100 units of Raw Material A from Bharat Supplies Pvt Ltd at ₹2,500/unit. GST: 18%. Delivery in 15 days.",
      steps: [
        { name: "Vendor Master Creation", requiredFields: ["vendorName", "gstin", "address", "bankAccount", "ifscCode", "paymentTerms"] },
        { name: "Purchase Requisition", requiredFields: ["itemName", "quantity", "requiredDate", "department", "reason"] },
        { name: "Purchase Order", requiredFields: ["vendorId", "itemName", "quantity", "unitPrice", "deliveryDate", "poNumber"] },
        { name: "Goods Receipt Note", requiredFields: ["poReference", "receivedQty", "receiptDate", "storeLocation", "qualityCheck"] },
        { name: "Vendor Invoice Entry", requiredFields: ["invoiceNo", "invoiceDate", "taxableAmount", "cgst", "sgst", "totalAmount"] },
        { name: "Payment Processing", requiredFields: ["paymentMode", "paymentDate", "amount", "referenceNo", "bankAccount"] },
      ],
    }),
  },

  // ─── 11. ERP SALES CYCLE ─────────────────────────────────────────────────
  {
    slug: "erp-sales-cycle",
    title: "ERP Sales Cycle",
    description:
      "Complete the full Sales workflow: Customer Master → Sales Order → Delivery Note → Tax Invoice → Payment Receipt.",
    category: "ERP",
    difficulty: "Advanced",
    estimatedTime: "45 mins",
    tags: ["SAP", "Sales Order", "Delivery", "Invoice", "Receipt"],
    passingScore: 60,
    attemptLimit: 3,
    instructions:
      "Complete all 5 steps in sequence.\n\n1. Customer Master Creation\n2. Sales Order\n3. Delivery Note\n4. Sales Invoice (GST)\n5. Payment Receipt",
    questionsJson: JSON.stringify({
      scenario: "Process a sale of 50 units of Finished Goods to TechMart Pvt Ltd at ₹5,000/unit. GST 18% — intra-state supply.",
      steps: [
        { name: "Customer Master", requiredFields: ["customerName", "gstin", "address", "creditLimit", "paymentTerms"] },
        { name: "Sales Order", requiredFields: ["customerId", "itemName", "quantity", "unitPrice", "deliveryDate", "soNumber"] },
        { name: "Delivery Note", requiredFields: ["soReference", "dispatchQty", "vehicleNo", "driverName", "dispatchDate"] },
        { name: "Sales Invoice", requiredFields: ["invoiceNo", "invoiceDate", "taxableAmount", "cgst", "sgst", "totalAmount"] },
        { name: "Payment Receipt", requiredFields: ["invoiceRef", "amountReceived", "paymentMode", "paymentDate", "referenceNo"] },
      ],
    }),
  },

  // ─── 12. INVENTORY ───────────────────────────────────────────────────────
  {
    slug: "inventory-fifo-valuation",
    title: "Inventory Valuation — FIFO",
    description:
      "Maintain a stock ledger for Steel Rods and compute running balance and valuation using FIFO method.",
    category: "ERP",
    difficulty: "Intermediate",
    estimatedTime: "35 mins",
    tags: ["FIFO", "Stock Ledger", "Inventory", "Valuation"],
    passingScore: 60,
    attemptLimit: 3,
    instructions:
      "FIFO Rule: First batch purchased = first batch issued.\n\nFor each transaction:\n• IN: Record qty, rate, and total value\n• OUT: Issue from oldest batch first\n• Calculate closing balance (qty & value) after every transaction\n\nTolerance: ±₹50 accepted.",
    questionsJson: JSON.stringify({
      item: "Steel Rods",
      method: "FIFO",
      transactions: [
        { id: 1, date: "01/04/2024", type: "IN", qty: 200, rate: 150, narration: "Opening Stock" },
        { id: 2, date: "05/04/2024", type: "IN", qty: 100, rate: 160, narration: "Purchase — Tata Steel" },
        { id: 3, date: "10/04/2024", type: "OUT", qty: 150, narration: "Issued to Production" },
        { id: 4, date: "15/04/2024", type: "IN", qty: 80, rate: 165, narration: "Purchase — JSW Steel" },
        { id: 5, date: "20/04/2024", type: "OUT", qty: 120, narration: "Issued to Production" },
        { id: 6, date: "28/04/2024", type: "OUT", qty: 60, narration: "Issued to Maintenance" },
      ],
    }),
  },

  // ─── 13. PAYROLL ─────────────────────────────────────────────────────────
  {
    slug: "payroll-pf-esi",
    title: "Payroll Processing",
    description:
      "Process monthly payroll with PF, ESI deductions, LOP adjustments and generate a payslip.",
    category: "ERP",
    difficulty: "Intermediate",
    estimatedTime: "35 mins",
    tags: ["Payroll", "PF", "ESI", "Payslip", "LOP"],
    passingScore: 60,
    attemptLimit: 3,
    instructions:
      "PF: Employee 12% + Employer 12% of Basic\nESI: Employee 0.75% + Employer 3.25% of Gross (only if Gross ≤ ₹21,000)\nLOP Deduction = (Gross ÷ Working Days) × LOP Days\nNet Pay = Gross − PF (employee) − ESI (employee) − LOP",
    questionsJson: JSON.stringify({
      employeeName: "Priya Nair",
      employeeId: "EMP-1042",
      designation: "Accounts Executive",
      month: "April 2024",
      basic: 18000,
      hra: 7200,
      da: 1800,
      conveyance: 1600,
      medicalAllowance: 1250,
      totalDays: 30,
      presentDays: 26,
      lopDays: 4,
    }),
  },

  // ─── 14. BANKING ─────────────────────────────────────────────────────────
  {
    slug: "banking-emi-reconciliation",
    title: "Banking Operations",
    description:
      "Calculate home loan EMI, FD maturity amount, and prepare a Bank Reconciliation Statement.",
    category: "Banking",
    difficulty: "Intermediate",
    estimatedTime: "40 mins",
    tags: ["EMI", "FD", "BRS", "Bank Reconciliation", "Loan"],
    passingScore: 60,
    attemptLimit: 3,
    instructions:
      "EMI Formula: EMI = P × r × (1+r)^n ÷ [(1+r)^n − 1]\nFD Maturity: A = P × (1 + r/n)^(n×t)\n\nBank Reconciliation: Identify timing differences and classify each item correctly.",
    questionsJson: JSON.stringify({
      emiScenario: { type: "EMI", principal: 3000000, annualRate: 8.5, tenureMonths: 240, description: "Home loan ₹30L at 8.5% p.a. for 20 years" },
      fdScenario: { type: "FD", principal: 200000, annualRate: 7.5, tenureYears: 3, compoundFreq: 4, description: "FD ₹2L at 7.5% p.a. compounded quarterly for 3 years" },
      reconScenario: {
        type: "RECONCILIATION",
        cashBookBalance: 85000,
        bankStatementBalance: 72000,
        items: [
          { id: 1, description: "Cheque issued to Sharma ₹8,000 — not yet presented to bank", correctClassification: "Unpresented Cheque" },
          { id: 2, description: "Interest ₹1,500 credited by bank — not recorded in cash book", correctClassification: "Bank Credit not in Cash Book" },
          { id: 3, description: "Direct deposit by customer ₹5,500 — not in cash book", correctClassification: "Direct Deposit" },
          { id: 4, description: "Bank charges ₹200 debited by bank — not in cash book", correctClassification: "Bank Charges" },
          { id: 5, description: "Cheque deposited ₹12,000 — not yet credited by bank", correctClassification: "Uncredited Cheque" },
        ],
      },
    }),
  },

  // ─── 15. AUDIT ───────────────────────────────────────────────────────────
  {
    slug: "audit-procedure",
    title: "Audit Procedure Simulator",
    description:
      "Conduct a complete statutory audit: Planning → Internal Control Review → Vouching → Verification → Risk Assessment → Audit Report.",
    category: "Audit",
    difficulty: "Advanced",
    estimatedTime: "60 mins",
    tags: ["Audit", "Vouching", "Internal Control", "Audit Opinion", "Risk"],
    passingScore: 55,
    attemptLimit: 3,
    instructions:
      "Complete all 6 audit phases in order.\n\nAudit Opinions:\n• Unmodified — No material misstatements\n• Qualified — Material but not pervasive misstatement\n• Adverse — Material and pervasive misstatements\n• Disclaimer — Unable to obtain sufficient evidence",
    questionsJson: JSON.stringify({
      company: "Sunrise Manufacturing Ltd",
      financialYear: "2023-24",
      turnover: 85000000,
      materiality: 850000,
      steps: [
        { name: "Audit Planning", questions: [{ id: 1, question: "Materiality threshold (1% of turnover)?", answer: "850000" }, { id: 2, question: "Overall business risk level?", answer: "Medium" }] },
        { name: "Internal Control Review", checklist: [{ id: 1, control: "Segregation of duties — cash handling vs recording", risk: "Low", correctResponse: "Yes" }, { id: 2, control: "Monthly bank reconciliation performed", risk: "Low", correctResponse: "Yes" }, { id: 3, control: "PO approved by authorised person", risk: "High", correctResponse: "No" }, { id: 4, control: "Annual physical verification of fixed assets", risk: "Low", correctResponse: "Yes" }] },
        { name: "Vouching", vouchers: [{ id: 1, transaction: "Cash payment ₹45,000 to ABC Suppliers on 15-Mar-24", document: "Invoice #INV-2024-089 for ₹45,000 dated 14-Mar-24", discrepancy: false }, { id: 2, transaction: "Cash payment ₹12,000 for petty expenses on 20-Mar-24", document: "No supporting voucher found", discrepancy: true }, { id: 3, transaction: "Sales ₹2,00,000 to TechMart on 25-Mar-24", document: "Invoice #S-2024-156 for ₹2,00,000 + GST", discrepancy: false }] },
        { name: "Verification", assets: ["Land & Building", "Machinery", "Closing Stock", "Debtors", "Cash & Bank"] },
        { name: "Risk Assessment", risks: ["Revenue Recognition", "Inventory Valuation", "Related Party Transactions", "Going Concern"] },
        { name: "Audit Report", situation: "All material items are supported by evidence. Controls are adequate except PO authorisation. No material misstatements found.", correctOpinion: "Unmodified", options: ["Unmodified", "Qualified", "Adverse", "Disclaimer of Opinion"] },
      ],
    }),
  },

  // ─── 16. EXCEL ───────────────────────────────────────────────────────────
  {
    slug: "excel-finance-functions",
    title: "Excel Formula Mastery",
    description:
      "Practice essential Excel functions used in Finance & Accounting: VLOOKUP, IF, SUMIF, PMT, COUNTIF.",
    category: "Excel Skills",
    difficulty: "Intermediate",
    estimatedTime: "40 mins",
    tags: ["VLOOKUP", "IF", "SUMIF", "PMT", "Excel", "Finance"],
    passingScore: 60,
    attemptLimit: 3,
    instructions:
      "For each question:\n1. Study the data grid\n2. Type your Excel formula in the input box\n3. Enter the expected result value\n\nYour result must match exactly. The formula must contain the specified function name.",
    questionsJson: JSON.stringify([
      { id: 1, exercise: "VLOOKUP", functionName: "VLOOKUP", instruction: "Find the salary of Employee EMP003 from the table.", data: [["EmpID","Name","Dept","Salary"],["EMP001","Ravi Kumar","Accounts","45000"],["EMP002","Priya Sharma","Finance","52000"],["EMP003","Amit Patel","Audit","61000"],["EMP004","Sunita Rao","Tax","48000"]], expectedFormula: '=VLOOKUP("EMP003",A:D,4,0)', expectedResult: "61000", hint: "VLOOKUP(lookup_value, table_array, col_index, [0])" },
      { id: 2, exercise: "IF Formula", functionName: "IF", instruction: "B2 contains score 72. Return 'Pass' if ≥60, else 'Fail'.", data: [["Student","Score","Result"],["Rahul","72","?"],["Meena","45","?"]], expectedFormula: '=IF(B2>=60,"Pass","Fail")', expectedResult: "Pass", hint: "IF(logical_test, value_if_true, value_if_false)" },
      { id: 3, exercise: "SUMIF", functionName: "SUMIF", instruction: "Calculate total sales for the North region.", data: [["Region","Sales"],["North","150000"],["South","120000"],["North","80000"],["East","90000"],["North","60000"]], expectedFormula: '=SUMIF(A:A,"North",B:B)', expectedResult: "290000", hint: "SUMIF(range, criteria, sum_range)" },
      { id: 4, exercise: "PMT Function", functionName: "PMT", instruction: "Calculate monthly EMI: loan ₹5,00,000 at 12% p.a. for 3 years.", data: [["Parameter","Value"],["Principal","500000"],["Annual Rate","12%"],["Tenure (Years)","3"]], expectedFormula: "=PMT(12%/12,36,-500000)", expectedResult: "16607", hint: "PMT(rate_per_period, total_periods, present_value)" },
      { id: 5, exercise: "COUNTIF", functionName: "COUNTIF", instruction: "Count transactions with category 'GST'.", data: [["TxnID","Category","Amount"],["T001","GST","5000"],["T002","TDS","3000"],["T003","GST","8000"],["T004","GST","2000"],["T005","TDS","4000"]], expectedFormula: '=COUNTIF(B:B,"GST")', expectedResult: "3", hint: "COUNTIF(range, criteria)" },
    ]),
  },

  // ─── 17. LEDGER POSTING ──────────────────────────────────────────────────
  {
    slug: "ledger-posting",
    title: "Ledger Posting Simulator",
    description:
      "Post journal entries into T-format ledger accounts, calculate totals and find the closing balance.",
    category: "Accounting",
    difficulty: "Intermediate",
    estimatedTime: "35 mins",
    tags: ["Ledger", "T-Account", "Balancing", "Double Entry"],
    passingScore: 60,
    attemptLimit: 3,
    instructions:
      "Journal entries are already passed. Post each entry to the correct side of the ledger (Dr or Cr).\n\nFor each ledger account:\n• Enter total on the Dr side\n• Enter total on the Cr side\n• Calculate the closing balance and its side (Dr/Cr)",
    questionsJson: JSON.stringify({
      journalEntries: [
        { id: 1, date: "01/04/2024", debitAccount: "Cash A/c", creditAccount: "Capital A/c", amount: 100000, narration: "Started business" },
        { id: 2, date: "03/04/2024", debitAccount: "Purchases A/c", creditAccount: "Cash A/c", amount: 30000, narration: "Bought goods for cash" },
        { id: 3, date: "07/04/2024", debitAccount: "Cash A/c", creditAccount: "Sales A/c", amount: 45000, narration: "Sold goods for cash" },
        { id: 4, date: "10/04/2024", debitAccount: "Rent A/c", creditAccount: "Cash A/c", amount: 8000, narration: "Paid rent" },
        { id: 5, date: "15/04/2024", debitAccount: "Salary A/c", creditAccount: "Cash A/c", amount: 12000, narration: "Paid salary" },
      ],
      expectedLedgers: [
        { account: "Cash A/c", drTotal: 145000, crTotal: 50000, closingBalance: 95000, closingSide: "Dr" },
        { account: "Capital A/c", drTotal: 0, crTotal: 100000, closingBalance: 100000, closingSide: "Cr" },
        { account: "Purchases A/c", drTotal: 30000, crTotal: 0, closingBalance: 30000, closingSide: "Dr" },
        { account: "Sales A/c", drTotal: 0, crTotal: 45000, closingBalance: 45000, closingSide: "Cr" },
        { account: "Rent A/c", drTotal: 8000, crTotal: 0, closingBalance: 8000, closingSide: "Dr" },
        { account: "Salary A/c", drTotal: 12000, crTotal: 0, closingBalance: 12000, closingSide: "Dr" },
      ],
    }),
  },
]

async function main() {
  console.log("🌱 Seeding 17 Study Accounts simulations...\n")
  let created = 0, skipped = 0

  for (const sim of simulations) {
    const exists = await prisma.simulation.findUnique({ where: { slug: sim.slug } })
    if (exists) { console.log(`⏭  Skipped: ${sim.title}`); skipped++; continue }
    await prisma.simulation.create({ data: sim })
    console.log(`✅ Created [${sim.category}]: ${sim.title}`)
    created++
  }

  console.log(`\n📊 Done — ${created} created, ${skipped} skipped.`)
  console.log("🚀 Next: Admin → Assign simulations to students!")
}

main()
  .catch((e) => { console.error("❌", e); process.exit(1) })
  .finally(() => prisma.$disconnect())
