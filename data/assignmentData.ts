// Static assignment data derived from assignment.json + LEARNING CONTENT.pdf
// Each category Ã¢â€ â€™ courses Ã¢â€ â€™ tasks (with scenario from JSON, learning content from PDF)

export type AssignmentTask = {
  task_id: string
  seq_no: number
  course: string
  category: string
  duration_minutes: number
  scenario: string
  business_name?: string
  applicant_name?: string
  location?: string
  period?: string
  // Portal info from nergyvidya DB
  portal_name?: string
  portal_url?: string
  credentials?: Record<string, string>
  // extra fields vary by course type
  [key: string]: unknown
}

export type CourseEntry = {
  id: string
  title: string
  taskCount: number
  durationLabel: string // e.g. "1h 40m"
  /** learning objective from PDF */
  objective: string
  tasks: AssignmentTask[]
}

export type CategoryGroup = {
  id: string
  title: string
  totalDurationLabel: string
  courses: CourseEntry[]
}

// Helper: convert minutes to "Xh Ym" label
function fmtDur(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ GST COURSES (from assignment.json) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// Tasks are loaded lazily at runtime from /assignment.json
// Here we provide static metadata + objectives from the PDF

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: "gst",
    title: "Goods and Services Tax",
    totalDurationLabel: "19h 25m",
    courses: [
      {
        id: "trn-generation",
        title: "GST - TRN Generation",
        taskCount: 5,
        durationLabel: "1h 40m",
        objective:
          "Understand the process of generating a Temporary Reference Number (TRN) to begin GST registration.",
        tasks: [],
      },
      {
        id: "gst-registration-via-trn",
        title: "GST - Registration (via TRN)",
        taskCount: 5,
        durationLabel: "5h 30m",
        objective:
          "Understand the complete process of GST registration using TRN, including eligibility, documents required, and online application procedure.",
        tasks: [],
      },
      {
        id: "nil-return-filing",
        title: "GST - Nil Returns",
        taskCount: 5,
        durationLabel: "1h 15m",
        objective:
          "Learn to file a NIL GSTR-1 and GSTR-3B when there are no sales or purchases during the period.",
        tasks: [],
      },
      {
        id: "gstr-3b-filing",
        title: "GST - Returns (GSTR-1 & 3B)",
        taskCount: 5,
        durationLabel: "6h",
        objective:
          "Master the process of filing GSTR-1 and GSTR-3B summary returns, including liability computation, ITC claims, and payment of taxes.",
        tasks: [],
      },
      {
        id: "gst-composition-return-filing",
        title: "GST - CMP-08 Composition",
        taskCount: 5,
        durationLabel: "2h 30m",
        objective:
          "Understand the complete process of composition return (CMP-08) filing, including eligibility, forms, and compliance requirements.",
        tasks: [],
      },
      {
        id: "e-way-bill",
        title: "GST - E-Way Bill",
        taskCount: 5,
        durationLabel: "2h 30m",
        objective:
          "Understand the complete process of generating, updating, and canceling E-Way Bills for goods movement.",
        tasks: [],
      },
    ],
  },
  {
    id: "income-tax",
    title: "Income Tax",
    totalDurationLabel: "15h",
    courses: [
      {
        id: "epan-registration",
        title: "E-PAN Application",
        taskCount: 5,
        durationLabel: "2h 30m",
        objective:
          "Understand the complete process of obtaining a PAN card online, including eligibility and document requirements.",
        tasks: [],
      },
      {
        id: "itr-registration",
        title: "Income Tax - IT Portal Registration",
        taskCount: 5,
        durationLabel: "2h 30m",
        objective:
          "Learn the process of registering on the Income Tax e-filing portal and preparing for ITR filing.",
        tasks: [],
      },
      {
        id: "itr1-old-regime",
        title: "Income Tax - ITR-1 Filing (Salaried)",
        taskCount: 5,
        durationLabel: "3h",
        objective:
          "Master the process of filing ITR-1 under the old tax regime for salaried individuals, including income computation and deductions.",
        tasks: [],
      },
      {
        id: "itr1-new-regime",
        title: "Income Tax - ITR-1 (Complex/NR)",
        taskCount: 5,
        durationLabel: "3h",
        objective:
          "Understand ITR-1 filing under the new tax regime for complex scenarios and non-residents, including lower tax rates and limited deductions.",
        tasks: [],
      },
      {
        id: "tds",
        title: "Income Tax - TDS Compliance",
        taskCount: 5,
        durationLabel: "2h",
        objective:
          "Understand the complete TDS lifecycle, including deduction, deposit, and filing of TDS returns.",
        tasks: [],
      },
      {
        id: "tcs",
        title: "Income Tax - TCS Compliance",
        taskCount: 5,
        durationLabel: "2h",
        objective:
          "Learn the complete TCS process, including collection, deposit, and reporting requirements.",
        tasks: [],
      },
    ],
  },
  {
    id: "labour-laws",
    title: "Labour Laws",
    totalDurationLabel: "4h",
    courses: [
      {
        id: "epfo-registration",
        title: "Labour Laws - EPFO Registration",
        taskCount: 5,
        durationLabel: "2h",
        objective:
          "Understand the complete process of registering with EPFO for employees' provident fund and pension.",
        tasks: [],
      },
      {
        id: "esic-registration",
        title: "Labour Laws - ESIC Registration",
        taskCount: 5,
        durationLabel: "2h",
        objective:
          "Understand the complete process of ESIC registration for employees' state insurance benefits.",
        tasks: [],
      },
    ],
  },
  {
    id: "mca",
    title: "Ministry of Corporate Affairs",
    totalDurationLabel: "13h 5m",
    courses: [
      {
        id: "mca-signup",
        title: "MCA - User Signup",
        taskCount: 5,
        durationLabel: "1h 35m",
        objective:
          "Understand the complete process of registering on the MCA portal for corporate compliance.",
        tasks: [],
      },
      {
        id: "mca-din-allotment",
        title: "MCA - DIN Allotment",
        taskCount: 5,
        durationLabel: "2h",
        objective:
          "Understand the complete process of obtaining a Director Identification Number (DIN) through the MCA portal.",
        tasks: [],
      },
      {
        id: "dir3-kyc-web",
        title: "MCA - DIR-3 KYC (Web)",
        taskCount: 5,
        durationLabel: "2h",
        objective:
          "Understand the annual KYC compliance requirement for directors through DIR-3 KYC web form.",
        tasks: [],
      },
      {
        id: "dir3-kyc",
        title: "MCA - DIR-3 KYC",
        taskCount: 5,
        durationLabel: "2h",
        objective:
          "Understand the annual KYC compliance requirement for directors through DIR-3 KYC.",
        tasks: [],
      },
      {
        id: "name-reservation",
        title: "MCA - SPICe+ Name Reservation",
        taskCount: 5,
        durationLabel: "1h 30m",
        objective:
          "Learn the process of reserving a company name through SPICe+ (RUN - Reserve Unique Name) service.",
        tasks: [],
      },
      {
        id: "appointment-directors",
        title: "MCA - DIR-12 Appointment",
        taskCount: 5,
        durationLabel: "1h 30m",
        objective:
          "Learn the complete process of appointing directors in a company through Form DIR-12 on the MCA portal.",
        tasks: [],
      },
    ],
  },
  {
    id: "msme",
    title: "MSME",
    totalDurationLabel: "1h 40m",
    courses: [
      {
        id: "msme-registration",
        title: "MSME Registration (Udyam)",
        taskCount: 5,
        durationLabel: "1h 40m",
        objective:
          "Understand the complete process of Udyam registration for MSMEs and its benefits.",
        tasks: [],
      },
    ],
  },
  {
    id: "dsc",
    title: "Digital Signature Certificate",
    totalDurationLabel: "2h 30m",
    courses: [
      {
        id: "dsc-registration",
        title: "DSC Registration",
        taskCount: 5,
        durationLabel: "1h",
        objective:
          "Understand the complete process of obtaining a Digital Signature Certificate and its usage.",
        tasks: [],
      },
      {
        id: "dsc-renewal",
        title: "DSC Renewal",
        taskCount: 5,
        durationLabel: "45m",
        objective:
          "Understand the process of renewing a Digital Signature Certificate before expiry.",
        tasks: [],
      },
      {
        id: "dsc-revocation",
        title: "DSC Revocation",
        taskCount: 5,
        durationLabel: "45m",
        objective:
          "Understand the process of revoking a Digital Signature Certificate when compromised.",
        tasks: [],
      },
    ],
  },
]

// Map assignment.json / nergyvidya_tasks_db course names Ã¢â€ â€™ our course IDs
export const COURSE_NAME_TO_ID: Record<string, string> = {
  // Ã¢â€â‚¬Ã¢â€â‚¬ GST Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  // nergyvidya DB names
  "GST - TRN Generation": "trn-generation",
  "GST - Registration (via TRN)": "gst-registration-via-trn",
  "GST - Returns (GSTR-1 & 3B)": "gstr-3b-filing",
  "GST - Nil Returns": "nil-return-filing",
  "GST - CMP-08 Composition": "gst-composition-return-filing",
  "GST - E-Way Bill": "e-way-bill",
  // legacy/assignment.json names (keep for backward compat)
  "TRN Generation": "trn-generation",
  "GST Registration": "gst-registration-via-trn",
  "NIL Return Filing": "nil-return-filing",
  "GSTR 3B Filing": "gstr-3b-filing",
  "GST Composition Return Filing": "gst-composition-return-filing",
  "E-Way Bill": "e-way-bill",

  // Ã¢â€â‚¬Ã¢â€â‚¬ Income Tax Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  "E-PAN Application": "epan-registration",
  "Income Tax - IT Portal Registration": "itr-registration",
  "Income Tax - ITR-1 Filing (Salaried)": "itr1-old-regime",
  "Income Tax - ITR-1 (Complex/NR)": "itr1-new-regime",
  "Income Tax - TDS Compliance": "tds",
  "Income Tax - TCS Compliance": "tcs",

  // Ã¢â€â‚¬Ã¢â€â‚¬ Labour Laws Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  "Labour Laws - EPFO Registration": "epfo-registration",
  "Labour Laws - ESIC Registration": "esic-registration",
  // legacy names
  "EPFO Registration": "epfo-registration",
  "ESIC Registration": "esic-registration",

  // Ã¢â€â‚¬Ã¢â€â‚¬ MCA Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  "MCA - User Signup": "mca-signup",
  "MCA - DIN Allotment": "mca-din-allotment",
  "MCA - DIR-3 KYC (Web)": "dir3-kyc-web",
  "MCA - DIR-3 KYC": "dir3-kyc",
  "MCA - SPICe+ Name Reservation": "name-reservation",
  "MCA - DIR-12 Appointment": "appointment-directors",

  // Ã¢â€â‚¬Ã¢â€â‚¬ MSME Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  "MSME Registration (Udyam)": "msme-registration",

  // ── DSC ───────────────────────────────────────────────────────────────
  "DSC Registration": "dsc-registration",
  "DSC Renewal": "dsc-renewal",
  "DSC Revocation": "dsc-revocation",
}