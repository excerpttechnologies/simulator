/**
 * Adds missing MCA - DIN Allotment and MCA - DIR-3 KYC (Web) tasks
 * to public/assignment.json
 * Run: node scripts/addMissingMcaTasks.js
 */
const fs = require('fs')
const path = require('path')

const jsonPath = path.join(process.cwd(), 'public', 'assignment.json')
const existing = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

// Check if we already have DIN/DIR3KYCWEB tasks
const hasDIN = existing.some(t => t.task_id && t.task_id.startsWith('DIN_'))
const hasDIR3WEB = existing.some(t => t.task_id && t.task_id.startsWith('DIR3KYCWEB_'))
const hasMSME = existing.some(t => t.course === 'MSME Registration (Udyam)')

if (hasDIN && hasDIR3WEB && hasMSME) {
  console.log('✅ All tasks already present')
  console.log(`   Total: ${existing.length} tasks`)
  process.exit(0)
}

const maxSeq = Math.max(...existing.map(t => t.seq_no))

const newTasks = []

// ── MSME Registration (Udyam) - 5 tasks ────────────────────────────────────
if (!hasMSME) {
  newTasks.push(
    {
      task_id: "MSME_UDYAM_001",
      category: "MSME",
      course: "MSME Registration (Udyam)",
      duration_minutes: 20,
      seq_no: maxSeq + newTasks.length + 1,
      portal_name: "Udyam Registration Portal",
      portal_url: "https://udyamregistration.gov.in",
      credentials: { aadhaar: "234567890123", pan: "AAOAK1234N", otp: "573920" },
      business_name: "Anand Handicrafts",
      applicant_name: "Anand Kumar Sharma",
      location: "Jaipur, Rajasthan",
      scenario: "Anand Handicrafts is a small home-based handicraft manufacturing unit in Jaipur with an investment in plant & machinery of ₹18 lakhs and annual turnover of ₹35 lakhs. The proprietor wants to register on the Udyam portal to avail collateral-free loans and government tender benefits.\n\nAadhaar: 234567890123\nPAN: AAOAK1234N\nOTP: 573920 (simulated)",
    },
    {
      task_id: "MSME_UDYAM_002",
      category: "MSME",
      course: "MSME Registration (Udyam)",
      duration_minutes: 20,
      seq_no: maxSeq + newTasks.length + 1,
      portal_name: "Udyam Registration Portal",
      portal_url: "https://udyamregistration.gov.in",
      credentials: { aadhaar: "345678901234", pan: "AAFVA5678P", otp: "681204" },
      business_name: "Vinayak Auto Components",
      applicant_name: "Vinayak Patil",
      location: "Pune, Maharashtra",
      scenario: "Vinayak Auto Components is a two-partner firm supplying precision auto parts near Pune, with plant & machinery investment of ₹4.5 crore and turnover of ₹28 crore. The partners are registering under Udyam to qualify as a small enterprise for MSME procurement benefits.\n\nAadhaar: 345678901234\nPAN: AAFVA5678P\nOTP: 681204 (simulated)",
    },
    {
      task_id: "MSME_UDYAM_003",
      category: "MSME",
      course: "MSME Registration (Udyam)",
      duration_minutes: 20,
      seq_no: maxSeq + newTasks.length + 1,
      portal_name: "Udyam Registration Portal",
      portal_url: "https://udyamregistration.gov.in",
      credentials: { aadhaar: "456789012345", pan: "AABCS6789Q", otp: "790215" },
      business_name: "Sree Lakshmi Textiles Pvt. Ltd.",
      applicant_name: "Meenakshi Sundaram",
      location: "Coimbatore, Tamil Nadu",
      scenario: "Sree Lakshmi Textiles Pvt. Ltd. runs a mid-sized weaving and processing unit with investment of ₹42 crore and turnover of ₹210 crore. The company secretary is completing Udyam registration to reclassify from small to medium enterprise status.\n\nAadhaar: 456789012345\nPAN: AABCS6789Q\nOTP: 790215 (simulated)",
    },
    {
      task_id: "MSME_UDYAM_004",
      category: "MSME",
      course: "MSME Registration (Udyam)",
      duration_minutes: 20,
      seq_no: maxSeq + newTasks.length + 1,
      portal_name: "Udyam Registration Portal",
      portal_url: "https://udyamregistration.gov.in",
      credentials: { aadhaar: "567890123456", pan: "AAFRL7890R", otp: "824613" },
      business_name: "Rapid Logistics Services LLP",
      applicant_name: "Kiran Shah",
      location: "Ahmedabad, Gujarat",
      scenario: "Rapid Logistics Services LLP provides last-mile delivery and warehousing services in Ahmedabad with investment in equipment of ₹2 crore and turnover of ₹15 crore. The designated partner is registering on Udyam to access priority-sector lending for services.\n\nAadhaar: 567890123456\nPAN: AAFRL7890R\nOTP: 824613 (simulated)",
    },
    {
      task_id: "MSME_UDYAM_005",
      category: "MSME",
      course: "MSME Registration (Udyam)",
      duration_minutes: 20,
      seq_no: maxSeq + newTasks.length + 1,
      portal_name: "Udyam Registration Portal",
      portal_url: "https://udyamregistration.gov.in",
      credentials: { aadhaar: "678901234567", pan: "AAACH8901S", otp: "935724" },
      business_name: "Himalayan Herbal Foods",
      applicant_name: "Devendra Rawat",
      location: "Dehradun, Uttarakhand",
      scenario: "Himalayan Herbal Foods is a farmer-run co-operative processing herbal teas and dried fruits in Dehradun, with investment of ₹9 lakhs and turnover of ₹22 lakhs. The society secretary is registering on Udyam to access subsidy schemes for micro food-processing units.\n\nAadhaar: 678901234567\nPAN: AAACH8901S\nOTP: 935724 (simulated)",
    }
  )
}

// ── MCA - DIN Allotment (5 tasks) ───────────────────────────────────────────
if (!hasDIN) {
  const dinTasks = [
    task_id: "DIN_001",
    category: "Ministry of Corporate Affairs",
    course: "MCA - DIN Allotment",
    duration_minutes: 20,
    seq_no: maxSeq + 1,
    portal_name: "MCA V3 Portal",
    portal_url: "https://www.mca.gov.in",
    credentials: { user_id: "rajesh.ca@nergymail.com", password: "Rajesh@123", pan: "AAFXR1234A" },
    business_name: "Rajesh Kumar",
    applicant_name: "Rajesh Kumar",
    location: "Mumbai, Maharashtra",
    scenario: "Mr. Rajesh Kumar, a newly qualified Chartered Accountant, has been appointed as a director in his family business company. Before his appointment can be formalised, he needs to obtain a Director Identification Number (DIN) from the MCA. Assist Mr. Rajesh Kumar in filing the DIR-3 eForm to obtain his DIN.\n\nUser ID: rajesh.ca@nergymail.com\nPassword: Rajesh@123\n\nDetails of the Applicant:\nName: Rajesh Kumar\nFather's Name: Suresh Kumar\nDate of Birth: 15/06/1990\nGender: Male\nNationality: Indian\nPAN: AAFXR1234A\nAadhaar: 123456789012\nOccupation: Professional\nAddress: A-12, Green Park, Andheri West, Mumbai, Maharashtra, 400058",
  },
  {
    task_id: "DIN_002",
    category: "Ministry of Corporate Affairs",
    course: "MCA - DIN Allotment",
    duration_minutes: 20,
    seq_no: maxSeq + 2,
    portal_name: "MCA V3 Portal",
    portal_url: "https://www.mca.gov.in",
    credentials: { user_id: "priya.cs@nergymail.com", password: "Priya@456", pan: "BBBXP5678B" },
    business_name: "Priya Sharma",
    applicant_name: "Priya Sharma",
    location: "New Delhi, Delhi",
    scenario: "Ms. Priya Sharma has been appointed as an Independent Director at ABC Technologies Pvt. Ltd. She does not have a DIN and needs to apply for one through the MCA portal before her appointment is effective. Assist Ms. Priya Sharma in applying for a DIN using the DIR-3 eForm.\n\nUser ID: priya.cs@nergymail.com\nPassword: Priya@456\n\nDetails of the Applicant:\nName: Priya Sharma\nFather's Name: Anil Sharma\nDate of Birth: 22/09/1985\nGender: Female\nNationality: Indian\nPAN: BBBXP5678B\nAadhaar: 234567890123\nOccupation: Business\nAddress: B-45, Lajpat Nagar, New Delhi, 110024",
  },
  {
    task_id: "DIN_003",
    category: "Ministry of Corporate Affairs",
    course: "MCA - DIN Allotment",
    duration_minutes: 20,
    seq_no: maxSeq + 3,
    portal_name: "MCA V3 Portal",
    portal_url: "https://www.mca.gov.in",
    credentials: { user_id: "vikram.md@nergymail.com", password: "Vikram@789", pan: "CCCXV9012C" },
    business_name: "Vikram Singh",
    applicant_name: "Vikram Singh",
    location: "Bengaluru, Karnataka",
    scenario: "Mr. Vikram Singh is being appointed as Managing Director in a newly incorporated startup, Techvista Solutions Pvt. Ltd. He needs a Director Identification Number (DIN) to be included as a subscriber to the Memorandum of Association. Assist Mr. Vikram Singh in obtaining his DIN via DIR-3.\n\nUser ID: vikram.md@nergymail.com\nPassword: Vikram@789\n\nDetails of the Applicant:\nName: Vikram Singh\nFather's Name: Rajendra Singh\nDate of Birth: 05/03/1978\nGender: Male\nNationality: Indian\nPAN: CCCXV9012C\nAadhaar: 345678901234\nOccupation: Professional\nAddress: C-78, Koramangala 5th Block, Bengaluru, Karnataka, 560095",
  },
  {
    task_id: "DIN_004",
    category: "Ministry of Corporate Affairs",
    course: "MCA - DIN Allotment",
    duration_minutes: 20,
    seq_no: maxSeq + 4,
    portal_name: "MCA V3 Portal",
    portal_url: "https://www.mca.gov.in",
    credentials: { user_id: "ananya.dir@nergymail.com", password: "Ananya@321", pan: "DDDXA3456D" },
    business_name: "Ananya Reddy",
    applicant_name: "Ananya Reddy",
    location: "Hyderabad, Telangana",
    scenario: "Ms. Ananya Reddy has been shortlisted as an Additional Director in Sunrise Pharma Ltd. Before the board resolution is passed, she must have a valid DIN. Assist Ms. Ananya Reddy in applying for a DIN through the DIR-3 eForm on the MCA V3 portal.\n\nUser ID: ananya.dir@nergymail.com\nPassword: Ananya@321\n\nDetails of the Applicant:\nName: Ananya Reddy\nFather's Name: Ramu Reddy\nDate of Birth: 18/11/1992\nGender: Female\nNationality: Indian\nPAN: DDDXA3456D\nAadhaar: 456789012345\nOccupation: Professional\nAddress: D-23, Jubilee Hills, Hyderabad, Telangana, 500033",
  },
  {
    task_id: "DIN_005",
    category: "Ministry of Corporate Affairs",
    course: "MCA - DIN Allotment",
    duration_minutes: 20,
    seq_no: maxSeq + 5,
    portal_name: "MCA V3 Portal",
    portal_url: "https://www.mca.gov.in",
    credentials: { user_id: "mohan.cma@nergymail.com", password: "Mohan@654", pan: "EEEXA7890E" },
    business_name: "Mohan Iyer",
    applicant_name: "Mohan Iyer",
    location: "Chennai, Tamil Nadu",
    scenario: "Mr. Mohan Iyer is the founder of a new Non-Banking Financial Company (NBFC) being incorporated in Chennai. As per RBI guidelines, all directors must have a DIN registered with MCA. Assist Mr. Mohan Iyer in obtaining his DIN through the DIR-3 eForm before the company's incorporation.\n\nUser ID: mohan.cma@nergymail.com\nPassword: Mohan@654\n\nDetails of the Applicant:\nName: Mohan Iyer\nFather's Name: Krishnamurthy Iyer\nDate of Birth: 30/07/1975\nGender: Male\nNationality: Indian\nPAN: EEEXA7890E\nAadhaar: 567890123456\nOccupation: Business\nAddress: E-56, Anna Nagar West, Chennai, Tamil Nadu, 600040",
  },

  // ── MCA - DIR-3 KYC (Web) (5 tasks) ────────────────────────────────────────
  {
    task_id: "DIR3KYCWEB_001",
    category: "Ministry of Corporate Affairs",
    course: "MCA - DIR-3 KYC (Web)",
    duration_minutes: 20,
    seq_no: maxSeq + 6,
    portal_name: "MCA V3 Portal",
    portal_url: "https://www.mca.gov.in",
    credentials: { user_id: "sunita.dir@nergymail.com", password: "Sunita@123", din: "99990101", pan: "FFFXS2345F" },
    business_name: "Sunita Mehta",
    applicant_name: "Sunita Mehta",
    location: "Pune, Maharashtra",
    scenario: "Ms. Sunita Mehta, a director with DIN 99990101, needs to file DIR-3 KYC Web before 30th September to avoid deactivation of her DIN. She has not changed any personal details and is filing the annual KYC using the pre-filled web-based form. Assist Ms. Mehta in completing the DIR-3 KYC Web filing.\n\nUser ID: sunita.dir@nergymail.com\nPassword: Sunita@123\n\nDirector Details:\nName: Sunita Mehta\nDIN: 99990101\nPAN: FFFXS2345F\nAadhaar: 678901234567\nPersonal Mobile: 2345678901\nPersonal Email: sunita.dir@nergymail.com\nAddress: F-12, Baner Road, Pune, Maharashtra, 411045",
  },
  {
    task_id: "DIR3KYCWEB_002",
    category: "Ministry of Corporate Affairs",
    course: "MCA - DIR-3 KYC (Web)",
    duration_minutes: 20,
    seq_no: maxSeq + 7,
    portal_name: "MCA V3 Portal",
    portal_url: "https://www.mca.gov.in",
    credentials: { user_id: "arjun.dir@nergymail.com", password: "Arjun@456", din: "99990202", pan: "GGGXA6789G" },
    business_name: "Arjun Nair",
    applicant_name: "Arjun Nair",
    location: "Kochi, Kerala",
    scenario: "Mr. Arjun Nair is a director in two companies and must file his annual DIR-3 KYC Web before the deadline to keep his DIN 99990202 active. The web-based form is pre-filled from his previous filing data and only requires OTP verification. Assist Mr. Arjun Nair in completing the DIR-3 KYC Web process.\n\nUser ID: arjun.dir@nergymail.com\nPassword: Arjun@456\n\nDirector Details:\nName: Arjun Nair\nDIN: 99990202\nPAN: GGGXA6789G\nAadhaar: 789012345678\nPersonal Mobile: 2456789012\nPersonal Email: arjun.dir@nergymail.com\nAddress: G-33, Marine Drive, Kochi, Kerala, 682031",
  },
  {
    task_id: "DIR3KYCWEB_003",
    category: "Ministry of Corporate Affairs",
    course: "MCA - DIR-3 KYC (Web)",
    duration_minutes: 20,
    seq_no: maxSeq + 8,
    portal_name: "MCA V3 Portal",
    portal_url: "https://www.mca.gov.in",
    credentials: { user_id: "kavitha.dir@nergymail.com", password: "Kavitha@789", din: "99990303", pan: "HHHXK0123H" },
    business_name: "Kavitha Krishnan",
    applicant_name: "Kavitha Krishnan",
    location: "Coimbatore, Tamil Nadu",
    scenario: "Ms. Kavitha Krishnan, who holds DIN 99990303, is the director of a textile manufacturing company. Her DIN was flagged as 'Deactivated due to non-filing of KYC'. She needs to file DIR-3 KYC Web to reactivate her DIN. Assist Ms. Kavitha in completing the web-based KYC filing.\n\nUser ID: kavitha.dir@nergymail.com\nPassword: Kavitha@789\n\nDirector Details:\nName: Kavitha Krishnan\nDIN: 99990303\nPAN: HHHXK0123H\nAadhaar: 890123456789\nPersonal Mobile: 2567890123\nPersonal Email: kavitha.dir@nergymail.com\nAddress: H-7, RS Puram, Coimbatore, Tamil Nadu, 641002",
  },
  {
    task_id: "DIR3KYCWEB_004",
    category: "Ministry of Corporate Affairs",
    course: "MCA - DIR-3 KYC (Web)",
    duration_minutes: 20,
    seq_no: maxSeq + 9,
    portal_name: "MCA V3 Portal",
    portal_url: "https://www.mca.gov.in",
    credentials: { user_id: "ravi.dir@nergymail.com", password: "Ravi@321", din: "99990404", pan: "IIIXR4567I" },
    business_name: "Ravi Shankar Gupta",
    applicant_name: "Ravi Shankar Gupta",
    location: "Lucknow, Uttar Pradesh",
    scenario: "Mr. Ravi Shankar Gupta is a director in a government-aided construction company and holds DIN 99990404. As part of mandatory annual compliance, he must file DIR-3 KYC Web before September 30th. His CA firm has asked you to complete the web KYC filing on his behalf. Assist in completing the DIR-3 KYC Web.\n\nUser ID: ravi.dir@nergymail.com\nPassword: Ravi@321\n\nDirector Details:\nName: Ravi Shankar Gupta\nDIN: 99990404\nPAN: IIIXR4567I\nAadhaar: 901234567890\nPersonal Mobile: 2678901234\nPersonal Email: ravi.dir@nergymail.com\nAddress: I-88, Gomti Nagar, Lucknow, Uttar Pradesh, 226010",
  },
  {
    task_id: "DIR3KYCWEB_005",
    category: "Ministry of Corporate Affairs",
    course: "MCA - DIR-3 KYC (Web)",
    duration_minutes: 20,
    seq_no: maxSeq + 10,
    portal_name: "MCA V3 Portal",
    portal_url: "https://www.mca.gov.in",
    credentials: { user_id: "nalini.dir@nergymail.com", password: "Nalini@654", din: "99990505", pan: "JJJXN8901J" },
    business_name: "Nalini Prabhu",
    applicant_name: "Nalini Prabhu",
    location: "Mangaluru, Karnataka",
    scenario: "Ms. Nalini Prabhu is a Whole-Time Director in a logistics company and holds DIN 99990505. She has recently moved to a new address and updated her mobile number. She needs to file DIR-3 KYC Web to update her records with MCA and maintain an active DIN. Assist Ms. Nalini in filing the annual DIR-3 KYC Web.\n\nUser ID: nalini.dir@nergymail.com\nPassword: Nalini@654\n\nDirector Details:\nName: Nalini Prabhu\nDIN: 99990505\nPAN: JJJXN8901J\nAadhaar: 012345678901\nPersonal Mobile: 2789012345\nPersonal Email: nalini.dir@nergymail.com\nAddress: J-14, Kadri Hills, Mangaluru, Karnataka, 575002",
  },
]

const combined = [...existing, ...newTasks]
fs.writeFileSync(jsonPath, JSON.stringify(combined, null, 1))

console.log(`✅ Total tasks: ${combined.Count || combined.length}`)
const byCourse = combined.reduce((a, t) => { a[t.course] = (a[t.course] || 0) + 1; return a }, {})
const mca = Object.entries(byCourse).filter(([k]) => k.startsWith('MCA'))
console.log('MCA breakdown:')
mca.forEach(([k, v]) => console.log(`  ${v}x  ${k}`))
