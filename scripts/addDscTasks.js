/**
 * Adds 15 DSC tasks (5 per simulation) to public/assignment.json
 * Run: node scripts/addDscTasks.js
 */
const fs = require('fs')
const path = require('path')

const jsonPath = path.join(process.cwd(), 'public', 'assignment.json')
const existing = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

// Idempotent — skip if already seeded
if (existing.some(t => t.category === 'Digital Signature Certificate')) {
  console.log('✅ DSC tasks already present:', existing.filter(t => t.category === 'Digital Signature Certificate').length)
  process.exit(0)
}

let seq = Math.max(...existing.map(t => t.seq_no))

const APPLICANTS = [
  { name: "Ravi Chandran",    location: "Chennai, Tamil Nadu",      pan: "AAOPC1234K", aadhaar: "456789012345", dscSerial: "3082019A8B7C6D5E" },
  { name: "Fatima Sheikh",    location: "Lucknow, Uttar Pradesh",   pan: "AAOPF2345L", aadhaar: "567890123456", dscSerial: "3082029B9C8D7E6F" },
  { name: "Arvind Deshpande", location: "Nagpur, Maharashtra",      pan: "AAOPA3456M", aadhaar: "678901234567", dscSerial: "3082039C0D1E2F3A" },
  { name: "Neha Kulkarni",    location: "Indore, Madhya Pradesh",   pan: "AAOPN4567N", aadhaar: "789012345678", dscSerial: "3082049D1E2F3A4B" },
  { name: "Joseph Mathew",    location: "Kochi, Kerala",            pan: "AAOPJ5678O", aadhaar: "890123456789", dscSerial: "3082059E2F3A4B5C" },
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
  "Fatima Sheikh's DSC is expiring in 3 weeks. She needs to renew it to continue signing company filings.",
  "Arvind Deshpande's 3-year DSC has lapsed. He urgently initiates renewal to restore his ability to sign ROC and GST forms.",
  "Neha Kulkarni's DSC is near expiry. She initiates renewal before the deadline to avoid interruption in compliance filings.",
  "Joseph Mathew's DSC is expiring and he renews it before company closure formalities are completed.",
]
const REVOKE_SCENARIOS = [
  "Ravi Chandran has resigned as director and lost access to his company email linked to his DSC. To prevent misuse, he requests immediate revocation of his Digital Signature Certificate.",
  "Fatima Sheikh's USB token containing her DSC was stolen. She urgently requests revocation to prevent unauthorized use.",
  "Arvind Deshpande suspects his DSC private key was compromised after a malware incident on his laptop. He requests revocation as a precaution.",
  "Neha Kulkarni changed her legal name after marriage. Her existing DSC no longer matches her updated PAN. She requests revocation before applying for a fresh certificate.",
  "Joseph Mathew is winding up his OPC. As part of closure formalities, he requests formal revocation of his certificate.",
]

const REVOKE_REASONS = ["Resignation/Cessation","Loss of Token","Key Compromise","Change in Details","Other"]

const tasks = []

// ── DSC Registration (5 tasks) ───────────────────────────────────────────────
APPLICANTS.forEach((a, i) => {
  tasks.push({
    task_id: `DSC_REG_00${i+1}`,
    category: "Digital Signature Certificate",
    course: "DSC Registration",
    duration_minutes: 20,
    seq_no: ++seq,
    portal_name: "Certifying Authority Portal",
    portal_url: "https://www.mca.gov.in",
    credentials: { pan: a.pan, aadhaar: a.aadhaar },
    business_name: a.name,
    applicant_name: a.name,
    location: a.location,
    scenario: REG_SCENARIOS[i],
  })
})

// ── DSC Renewal (5 tasks) ────────────────────────────────────────────────────
APPLICANTS.forEach((a, i) => {
  tasks.push({
    task_id: `DSC_RENEW_00${i+1}`,
    category: "Digital Signature Certificate",
    course: "DSC Renewal",
    duration_minutes: 15,
    seq_no: ++seq,
    portal_name: "Certifying Authority Portal",
    portal_url: "https://www.mca.gov.in",
    credentials: { pan: a.pan, existingDscSerial: a.dscSerial },
    business_name: a.name,
    applicant_name: a.name,
    location: a.location,
    scenario: RENEW_SCENARIOS[i],
  })
})

// ── DSC Revocation (5 tasks) ─────────────────────────────────────────────────
APPLICANTS.forEach((a, i) => {
  tasks.push({
    task_id: `DSC_REVOKE_00${i+1}`,
    category: "Digital Signature Certificate",
    course: "DSC Revocation",
    duration_minutes: 15,
    seq_no: ++seq,
    portal_name: "Certifying Authority Portal",
    portal_url: "https://www.mca.gov.in",
    credentials: { pan: a.pan, existingDscSerial: a.dscSerial },
    business_name: a.name,
    applicant_name: a.name,
    location: a.location,
    scenario: REVOKE_SCENARIOS[i],
    revocation_reason: REVOKE_REASONS[i],
  })
})

const updated = [...existing, ...tasks]
fs.writeFileSync(jsonPath, JSON.stringify(updated, null, 1))
console.log(`✅ Added ${tasks.length} DSC tasks. Total: ${updated.length}`)
console.log('   DSC Registration:', tasks.filter(t => t.course === 'DSC Registration').length)
console.log('   DSC Renewal:', tasks.filter(t => t.course === 'DSC Renewal').length)
console.log('   DSC Revocation:', tasks.filter(t => t.course === 'DSC Revocation').length)
