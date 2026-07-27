const fs = require('fs')
const path = require('path')

const jsonPath = path.join(process.cwd(), 'public', 'assignment.json')
const existing = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
const maxSeq = Math.max(...existing.map(t => t.seq_no))

// Only add if not present
const hasDIN = existing.filter(t => t.course === "MCA - DIN Allotment").length
const hasDIR3WEB = existing.filter(t => t.course === "MCA - DIR-3 KYC (Web)").length

const toAdd = []
let seq = maxSeq

// Check for MSME tasks
const hasMSME = existing.filter(t => t.course === "MSME Registration (Udyam)").length

if (hasMSME < 5) {
  console.log(`Adding ${5 - hasMSME} MSME Registration tasks...`)
  const msmeData = [
    { id: 1, business: "Anand Handicrafts", applicant: "Anand Kumar Sharma", location: "Jaipur, Rajasthan", aadhaar: "234567890123", pan: "AAOAK1234N", otp: "573920", scenario: "Anand Handicrafts is a small home-based handicraft manufacturing unit in Jaipur with an investment in plant & machinery of ₹18 lakhs and annual turnover of ₹35 lakhs. The proprietor wants to register on the Udyam portal to avail collateral-free loans and government tender benefits." },
    { id: 2, business: "Vinayak Auto Components", applicant: "Vinayak Patil", location: "Pune, Maharashtra", aadhaar: "345678901234", pan: "AAFVA5678P", otp: "681204", scenario: "Vinayak Auto Components is a two-partner firm supplying precision auto parts near Pune, with plant & machinery investment of ₹4.5 crore and turnover of ₹28 crore. The partners are registering under Udyam to qualify as a small enterprise for MSME procurement benefits." },
    { id: 3, business: "Sree Lakshmi Textiles Pvt. Ltd.", applicant: "Meenakshi Sundaram", location: "Coimbatore, Tamil Nadu", aadhaar: "456789012345", pan: "AABCS6789Q", otp: "790215", scenario: "Sree Lakshmi Textiles Pvt. Ltd. runs a mid-sized weaving and processing unit with investment of ₹42 crore and turnover of ₹210 crore. The company secretary is completing Udyam registration to reclassify from small to medium enterprise status." },
    { id: 4, business: "Rapid Logistics Services LLP", applicant: "Kiran Shah", location: "Ahmedabad, Gujarat", aadhaar: "567890123456", pan: "AAFRL7890R", otp: "824613", scenario: "Rapid Logistics Services LLP provides last-mile delivery and warehousing services in Ahmedabad with investment in equipment of ₹2 crore and turnover of ₹15 crore. The designated partner is registering on Udyam to access priority-sector lending for services." },
    { id: 5, business: "Himalayan Herbal Foods", applicant: "Devendra Rawat", location: "Dehradun, Uttarakhand", aadhaar: "678901234567", pan: "AAACH8901S", otp: "935724", scenario: "Himalayan Herbal Foods is a farmer-run co-operative processing herbal teas and dried fruits in Dehradun, with investment of ₹9 lakhs and turnover of ₹22 lakhs. The society secretary is registering on Udyam to access subsidy schemes for micro food-processing units." }
  ]
  for (let i = hasMSME; i < 5; i++) {
    const d = msmeData[i]
    toAdd.push({
      task_id: `MSME_UDYAM_00${d.id}`,
      category: "MSME",
      course: "MSME Registration (Udyam)",
      duration_minutes: 20,
      seq_no: ++seq,
      portal_name: "Udyam Registration Portal",
      portal_url: "https://udyamregistration.gov.in",
      credentials: { aadhaar: d.aadhaar, pan: d.pan, otp: d.otp },
      business_name: d.business,
      applicant_name: d.applicant,
      location: d.location,
      scenario: d.scenario
    })
  }
}

if (hasDIN < 5) {
  console.log(`Adding ${5 - hasDIN} DIN Allotment tasks...`)
  for (let i = hasDIN + 1; i <= 5; i++) {
    toAdd.push({
      task_id: `DIN_00${i}`,
      category: "Ministry of Corporate Affairs",
      course: "MCA - DIN Allotment",
      duration_minutes: 20,
      seq_no: ++seq,
      portal_name: "MCA V3 Portal",
      portal_url: "https://www.mca.gov.in",
      credentials: { user_id: `din${i}@nergymail.com`, password: `Din${i}@123`, pan: `DIN${i}1234X` },
      applicant_name: `Director ${i}`,
      location: ["Mumbai", "Delhi", "Bengaluru", "Chennai", "Hyderabad"][i - 1],
      scenario: `Director ${i} needs to obtain a Director Identification Number (DIN) before being appointed to a company board. Complete the DIR-3 eForm application on the MCA V3 portal.`
    })
  }
}

if (hasDIR3WEB < 5) {
  console.log(`Adding ${5 - hasDIR3WEB} DIR-3 KYC Web tasks...`)
  for (let i = hasDIR3WEB + 1; i <= 5; i++) {
    toAdd.push({
      task_id: `DIR3KYCWEB_00${i}`,
      category: "Ministry of Corporate Affairs",
      course: "MCA - DIR-3 KYC (Web)",
      duration_minutes: 20,
      seq_no: ++seq,
      portal_name: "MCA V3 Portal",
      portal_url: "https://www.mca.gov.in",
      credentials: { user_id: `dir3${i}@nergymail.com`, password: `Dir3${i}@123`, din: `9999${String(i).padStart(4, '0')}` },
      applicant_name: `Director KYC ${i}`,
      location: ["Pune", "Kochi", "Coimbatore", "Lucknow", "Mangaluru"][i - 1],
      scenario: `Director with DIN 9999${String(i).padStart(4, '0')} must file annual DIR-3 KYC Web before 30th September to keep their DIN active. Complete the web-based KYC form.`
    })
  }
}

if (toAdd.length === 0) {
  console.log('✅ All tasks already present')
} else {
  const updated = [...existing, ...toAdd]
  fs.writeFileSync(jsonPath, JSON.stringify(updated, null, 1))
  console.log(`✅ Added ${toAdd.length} tasks. Total: ${updated.length}`)
}
