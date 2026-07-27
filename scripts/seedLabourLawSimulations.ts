/**
 * Seed script — Labour Laws simulations (EPFO + ESIC)
 * Run: npm run seed:labour
 */
import mongoose from "mongoose"
import * as dotenv from "dotenv"
import path from "path"
import { randomUUID } from "crypto"

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const uri = process.env.MONGODB_URI!
if (!uri) throw new Error("MONGODB_URI not set in .env.local")

// ── Mongoose schemas (inline, no model import side-effects) ──────────────────
const SimSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
}, { strict: false })
const Sim = mongoose.models?.["SimulationSeed"] || mongoose.model("SimulationSeed", SimSchema, "simulations")

// ── Helper ───────────────────────────────────────────────────────────────────
function slug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}
function uid() {
  return randomUUID().replace(/-/g, "")
}

// ── EPFO Tasks ────────────────────────────────────────────────────────────────
const EPFO_TASKS = [
  {
    taskNumber: 1,
    businessName: "Krishna Textiles Pvt. Ltd.",
    location: "Coimbatore, Tamil Nadu",
    bizType: "Private Limited Company",
    scenario: "Krishna Textiles Pvt. Ltd. has crossed 20 employees on its payroll for the first time and is now statutorily required to register with EPFO within the prescribed time limit. The HR manager begins registration on the Unified Shram Suvidha Portal (USSP).",
    applicantDetails: {
      establishmentName: "Krishna Textiles Pvt. Ltd.",
      pan: "AAKCK1234L",
      cin: "U17111TZ2015PTC098765",
      employeeCount: 22,
      dateOfSetup: "12/03/2015",
      state: "Tamil Nadu",
      district: "Coimbatore",
    },
    steps: [
      {
        stepNumber: 1,
        name: "Establishment details",
        fields: [
          { label: "Establishment Name", type: "text", correctAnswer: "Krishna Textiles Pvt. Ltd.", hint: "Legal name as per incorporation certificate" },
          { label: "PAN of Establishment", type: "text", correctAnswer: "AAKCK1234L" },
          { label: "Type of Establishment", type: "select", options: ["Factory", "Shop/Commercial", "Society/Trust", "Others"], correctAnswer: "Factory" },
          { label: "Date of Setup", type: "date", correctAnswer: "12/03/2015" },
        ],
      },
      {
        stepNumber: 2,
        name: "Employer details",
        fields: [
          { label: "Employer Name", type: "text", correctAnswer: "Ramesh Krishnan" },
          { label: "Designation", type: "text", correctAnswer: "Managing Director" },
          { label: "Employer PAN", type: "text", correctAnswer: "BXNPK5678M" },
          { label: "Mobile Number", type: "text", correctAnswer: "9843556677" },
          { label: "Email", type: "text", correctAnswer: "hr@krishnatextiles.in" },
        ],
      },
      {
        stepNumber: 3,
        name: "Employment strength & applicability",
        fields: [
          { label: "Total Employees", type: "text", correctAnswer: "22", hint: "Above 20 employees triggers mandatory EPF registration" },
          { label: "Date Threshold Crossed", type: "date", correctAnswer: "01/06/2024" },
          { label: "Applicable Act", type: "select", options: ["EPF & MP Act 1952", "ESI Act 1948", "Both"], correctAnswer: "EPF & MP Act 1952" },
        ],
      },
      {
        stepNumber: 4,
        name: "Address & bank details",
        fields: [
          { label: "Registered Address", type: "text", correctAnswer: "Plot 14, SIDCO Industrial Estate, Coimbatore" },
          { label: "Pincode", type: "text", correctAnswer: "641021" },
          { label: "Bank Account Number", type: "text", correctAnswer: "50100234567890" },
          { label: "IFSC Code", type: "text", correctAnswer: "HDFC0001234" },
        ],
      },
      {
        stepNumber: 5,
        name: "DSC verification & submit",
        fields: [
          { label: "Digital Signature (DSC) of Employer", type: "select", options: ["Uploaded", "Not Uploaded"], correctAnswer: "Uploaded" },
          { label: "Declaration", type: "select", options: ["I agree", "I do not agree"], correctAnswer: "I agree" },
          { label: "Establishment Code Generated", type: "text", correctAnswer: "TN/CBE/0045678", hint: "Simulated EPFO establishment code on successful submission" },
        ],
      },
    ],
  },
  {
    taskNumber: 2,
    businessName: "Bluewave IT Solutions",
    location: "Hyderabad, Telangana",
    bizType: "Private Limited Company",
    scenario: "Bluewave IT Solutions is a growing software services company that just onboarded its 25th employee. As an IT/ITES establishment, it must register voluntarily or mandatorily with EPFO depending on employee strength. The founder is completing the registration.",
    applicantDetails: { establishmentName: "Bluewave IT Solutions", pan: "AALCB6789N", employeeCount: 25, dateOfSetup: "04/09/2019", state: "Telangana", district: "Hyderabad" },
    steps: [
      { stepNumber: 1, name: "Establishment details", fields: [{ label: "Establishment Name", type: "text", correctAnswer: "Bluewave IT Solutions" }, { label: "PAN of Establishment", type: "text", correctAnswer: "AALCB6789N" }, { label: "Type of Establishment", type: "select", options: ["Factory", "Shop/Commercial", "Society/Trust", "Others"], correctAnswer: "Shop/Commercial" }, { label: "Date of Setup", type: "date", correctAnswer: "04/09/2019" }] },
      { stepNumber: 2, name: "Employer details", fields: [{ label: "Employer Name", type: "text", correctAnswer: "Aditya Rao" }, { label: "Designation", type: "text", correctAnswer: "Founder & CEO" }, { label: "Employer PAN", type: "text", correctAnswer: "CMNPR2345P" }, { label: "Mobile Number", type: "text", correctAnswer: "9866223344" }, { label: "Email", type: "text", correctAnswer: "aditya@bluewaveit.com" }] },
      { stepNumber: 3, name: "Employment strength", fields: [{ label: "Total Employees", type: "text", correctAnswer: "25" }, { label: "Date Threshold Crossed", type: "date", correctAnswer: "15/07/2024" }, { label: "Applicable Act", type: "select", options: ["EPF & MP Act 1952", "ESI Act 1948", "Both"], correctAnswer: "EPF & MP Act 1952" }] },
      { stepNumber: 4, name: "Address & bank details", fields: [{ label: "Registered Address", type: "text", correctAnswer: "Plot 8, HITEC City, Hyderabad" }, { label: "Pincode", type: "text", correctAnswer: "500081" }, { label: "Bank Account Number", type: "text", correctAnswer: "60123456789012" }, { label: "IFSC Code", type: "text", correctAnswer: "ICIC0002345" }] },
      { stepNumber: 5, name: "DSC & submit", fields: [{ label: "Digital Signature (DSC) of Employer", type: "select", options: ["Uploaded", "Not Uploaded"], correctAnswer: "Uploaded" }, { label: "Declaration", type: "select", options: ["I agree", "I do not agree"], correctAnswer: "I agree" }, { label: "Establishment Code Generated", type: "text", correctAnswer: "TS/HYD/0067890" }] },
    ],
  },
  {
    taskNumber: 3,
    businessName: "Green Leaf Restaurants",
    location: "Kochi, Kerala",
    bizType: "Partnership Firm",
    scenario: "Green Leaf Restaurants operates 3 outlets across Kochi with a combined staff strength of 30. The partners have received a notice from the EPFO regional office for non-registration and must now complete registration along with backdated compliance details.",
    applicantDetails: { establishmentName: "Green Leaf Restaurants", pan: "AAFGL3456Q", employeeCount: 30, dateOfSetup: "20/01/2017", state: "Kerala", district: "Ernakulam" },
    steps: [
      { stepNumber: 1, name: "Establishment details", fields: [{ label: "Establishment Name", type: "text", correctAnswer: "Green Leaf Restaurants" }, { label: "PAN of Establishment", type: "text", correctAnswer: "AAFGL3456Q" }, { label: "Type of Establishment", type: "select", options: ["Factory", "Shop/Commercial", "Society/Trust", "Others"], correctAnswer: "Shop/Commercial" }, { label: "Date of Setup", type: "date", correctAnswer: "20/01/2017" }] },
      { stepNumber: 2, name: "Employer details", fields: [{ label: "Employer Name", type: "text", correctAnswer: "Thomas Varghese" }, { label: "Designation", type: "text", correctAnswer: "Managing Partner" }, { label: "Employer PAN", type: "text", correctAnswer: "DPQPV7890R" }, { label: "Mobile Number", type: "text", correctAnswer: "9847112233" }, { label: "Email", type: "text", correctAnswer: "accounts@greenleaf.in" }] },
      { stepNumber: 3, name: "Employment strength", fields: [{ label: "Total Employees", type: "text", correctAnswer: "30" }, { label: "Date Threshold Crossed", type: "date", correctAnswer: "01/04/2023", hint: "Registration is overdue — backdated liability applies" }, { label: "Applicable Act", type: "select", options: ["EPF & MP Act 1952", "ESI Act 1948", "Both"], correctAnswer: "EPF & MP Act 1952" }] },
      { stepNumber: 4, name: "Address & bank details", fields: [{ label: "Registered Address", type: "text", correctAnswer: "MG Road, Kochi" }, { label: "Pincode", type: "text", correctAnswer: "682016" }, { label: "Bank Account Number", type: "text", correctAnswer: "70234567890123" }, { label: "IFSC Code", type: "text", correctAnswer: "SBIN0007890" }] },
      { stepNumber: 5, name: "DSC & submit", fields: [{ label: "Digital Signature (DSC) of Employer", type: "select", options: ["Uploaded", "Not Uploaded"], correctAnswer: "Uploaded" }, { label: "Declaration", type: "select", options: ["I agree", "I do not agree"], correctAnswer: "I agree" }, { label: "Establishment Code Generated", type: "text", correctAnswer: "KL/EKM/0078901" }] },
    ],
  },
  {
    taskNumber: 4,
    businessName: "Om Sai Construction Co.",
    location: "Nagpur, Maharashtra",
    bizType: "Proprietorship",
    scenario: "Om Sai Construction Co. is a proprietorship that hires contract labour for civil projects. With 21 workers now on direct payroll, the proprietor must register with EPFO and correctly classify contract vs. direct employees.",
    applicantDetails: { establishmentName: "Om Sai Construction Co.", pan: "AAOSC4567S", employeeCount: 21, dateOfSetup: "10/11/2020", state: "Maharashtra", district: "Nagpur" },
    steps: [
      { stepNumber: 1, name: "Establishment details", fields: [{ label: "Establishment Name", type: "text", correctAnswer: "Om Sai Construction Co." }, { label: "PAN of Establishment", type: "text", correctAnswer: "AAOSC4567S" }, { label: "Type of Establishment", type: "select", options: ["Factory", "Shop/Commercial", "Society/Trust", "Others"], correctAnswer: "Factory" }, { label: "Date of Setup", type: "date", correctAnswer: "10/11/2020" }] },
      { stepNumber: 2, name: "Employer details", fields: [{ label: "Employer Name", type: "text", correctAnswer: "Suresh Deshmukh" }, { label: "Designation", type: "text", correctAnswer: "Proprietor" }, { label: "Employer PAN", type: "text", correctAnswer: "EQRPD8901T" }, { label: "Mobile Number", type: "text", correctAnswer: "9822334455" }, { label: "Email", type: "text", correctAnswer: "omsaiconstruction@gmail.com" }] },
      { stepNumber: 3, name: "Employment strength", fields: [{ label: "Total Employees", type: "text", correctAnswer: "21" }, { label: "Date Threshold Crossed", type: "date", correctAnswer: "05/05/2024" }, { label: "Applicable Act", type: "select", options: ["EPF & MP Act 1952", "ESI Act 1948", "Both"], correctAnswer: "EPF & MP Act 1952" }] },
      { stepNumber: 4, name: "Address & bank details", fields: [{ label: "Registered Address", type: "text", correctAnswer: "Wardha Road, Nagpur" }, { label: "Pincode", type: "text", correctAnswer: "440025" }, { label: "Bank Account Number", type: "text", correctAnswer: "80345678901234" }, { label: "IFSC Code", type: "text", correctAnswer: "PUNB0345600" }] },
      { stepNumber: 5, name: "DSC & submit", fields: [{ label: "Digital Signature (DSC) of Employer", type: "select", options: ["Uploaded", "Not Uploaded"], correctAnswer: "Uploaded" }, { label: "Declaration", type: "select", options: ["I agree", "I do not agree"], correctAnswer: "I agree" }, { label: "Establishment Code Generated", type: "text", correctAnswer: "MH/NGP/0089012" }] },
    ],
  },
  {
    taskNumber: 5,
    businessName: "Sunshine Public School",
    location: "Indore, Madhya Pradesh",
    bizType: "Society/Trust",
    scenario: "Sunshine Public School, run by a registered educational trust, has 40 teaching and non-teaching staff. The school administrator is completing EPFO registration to ensure PF compliance for all eligible staff.",
    applicantDetails: { establishmentName: "Sunshine Public School", pan: "AASPS5678U", employeeCount: 40, dateOfSetup: "01/06/2010", state: "Madhya Pradesh", district: "Indore" },
    steps: [
      { stepNumber: 1, name: "Establishment details", fields: [{ label: "Establishment Name", type: "text", correctAnswer: "Sunshine Public School" }, { label: "PAN of Establishment", type: "text", correctAnswer: "AASPS5678U" }, { label: "Type of Establishment", type: "select", options: ["Factory", "Shop/Commercial", "Society/Trust", "Others"], correctAnswer: "Society/Trust" }, { label: "Date of Setup", type: "date", correctAnswer: "01/06/2010" }] },
      { stepNumber: 2, name: "Employer details", fields: [{ label: "Employer Name", type: "text", correctAnswer: "Dr. Anjali Joshi" }, { label: "Designation", type: "text", correctAnswer: "Administrator" }, { label: "Employer PAN", type: "text", correctAnswer: "FRSPJ9012V" }, { label: "Mobile Number", type: "text", correctAnswer: "9893445566" }, { label: "Email", type: "text", correctAnswer: "admin@sunshineschool.edu.in" }] },
      { stepNumber: 3, name: "Employment strength", fields: [{ label: "Total Employees", type: "text", correctAnswer: "40" }, { label: "Date Threshold Crossed", type: "date", correctAnswer: "01/04/2011" }, { label: "Applicable Act", type: "select", options: ["EPF & MP Act 1952", "ESI Act 1948", "Both"], correctAnswer: "EPF & MP Act 1952" }] },
      { stepNumber: 4, name: "Address & bank details", fields: [{ label: "Registered Address", type: "text", correctAnswer: "AB Road, Indore" }, { label: "Pincode", type: "text", correctAnswer: "452001" }, { label: "Bank Account Number", type: "text", correctAnswer: "90456789012345" }, { label: "IFSC Code", type: "text", correctAnswer: "BARB0INDORE" }] },
      { stepNumber: 5, name: "DSC & submit", fields: [{ label: "Digital Signature (DSC) of Employer", type: "select", options: ["Uploaded", "Not Uploaded"], correctAnswer: "Uploaded" }, { label: "Declaration", type: "select", options: ["I agree", "I do not agree"], correctAnswer: "I agree" }, { label: "Establishment Code Generated", type: "text", correctAnswer: "MP/IND/0090123" }] },
    ],
  },
]

// ── ESIC Tasks ────────────────────────────────────────────────────────────────
const ESIC_TASKS = [
  {
    taskNumber: 1,
    businessName: "Krishna Textiles Pvt. Ltd.",
    location: "Coimbatore, Tamil Nadu",
    bizType: "Private Limited Company",
    scenario: "Following its EPFO registration, Krishna Textiles Pvt. Ltd. must also register under the ESI Act since it employs more than 10 workers, several of whom earn below the ₹21,000/month wage ceiling for ESI coverage.",
    applicantDetails: { establishmentName: "Krishna Textiles Pvt. Ltd.", pan: "AAKCK1234L", employeeCount: 22, employeesUnderWageCeiling: 15, state: "Tamil Nadu", district: "Coimbatore" },
    steps: [
      { stepNumber: 1, name: "Establishment & applicability", fields: [{ label: "Establishment Name", type: "text", correctAnswer: "Krishna Textiles Pvt. Ltd." }, { label: "PAN", type: "text", correctAnswer: "AAKCK1234L" }, { label: "Total Employees", type: "text", correctAnswer: "22" }, { label: "Employees Below Wage Ceiling (₹21,000)", type: "text", correctAnswer: "15", hint: "Only employees earning ≤ ₹21,000/month are ESI-eligible" }, { label: "Applicability", type: "select", options: ["Applicable", "Not Applicable"], correctAnswer: "Applicable", hint: "10+ employees with wages under ceiling → ESI applies" }] },
      { stepNumber: 2, name: "Employer & unit details", fields: [{ label: "Employer Name", type: "text", correctAnswer: "Ramesh Krishnan" }, { label: "Unit Type", type: "select", options: ["Factory", "Shop", "Others"], correctAnswer: "Factory" }, { label: "Nature of Work", type: "text", correctAnswer: "Textile manufacturing" }, { label: "Date of Applicability", type: "date", correctAnswer: "01/06/2024" }] },
      { stepNumber: 3, name: "Employee mapping", fields: [{ label: "Number of Insurable Employees", type: "text", correctAnswer: "15" }, { label: "Employer's Monthly Contribution Rate", type: "text", correctAnswer: "3.25", hint: "Employer share is 3.25% of wages" }, { label: "Employee's Monthly Contribution Rate", type: "text", correctAnswer: "0.75", hint: "Employee share is 0.75% of wages" }, { label: "Total Monthly Wages (Insurable)", type: "text", correctAnswer: "300000" }, { label: "Total Monthly Contribution", type: "text", correctAnswer: "12000", hint: "4% of 3,00,000 (3.25%+0.75%)" }] },
      { stepNumber: 4, name: "Bank & address details", fields: [{ label: "Registered Address", type: "text", correctAnswer: "Plot 14, SIDCO Industrial Estate, Coimbatore" }, { label: "Pincode", type: "text", correctAnswer: "641021" }, { label: "Bank Account Number", type: "text", correctAnswer: "50100234567890" }, { label: "IFSC Code", type: "text", correctAnswer: "HDFC0001234" }] },
      { stepNumber: 5, name: "Submit & challan", fields: [{ label: "Declaration", type: "select", options: ["I agree", "I do not agree"], correctAnswer: "I agree" }, { label: "ESIC Code Generated", type: "text", correctAnswer: "42-00-112233-000-1001", hint: "Simulated 17-digit ESIC code" }, { label: "Challan Due Date", type: "text", correctAnswer: "15/07/2024", hint: "ESI contribution due by 15th of following month" }] },
    ],
  },
  {
    taskNumber: 2,
    businessName: "Bluewave IT Solutions",
    location: "Hyderabad, Telangana",
    bizType: "Private Limited Company",
    scenario: "Bluewave IT Solutions has 25 employees, but most earn above the ESI wage ceiling. Only 8 support-staff employees qualify. The HR head must correctly determine applicability and register only the eligible employees.",
    applicantDetails: { establishmentName: "Bluewave IT Solutions", pan: "AALCB6789N", employeeCount: 25, employeesUnderWageCeiling: 8, state: "Telangana", district: "Hyderabad" },
    steps: [
      { stepNumber: 1, name: "Establishment & applicability", fields: [{ label: "Establishment Name", type: "text", correctAnswer: "Bluewave IT Solutions" }, { label: "PAN", type: "text", correctAnswer: "AALCB6789N" }, { label: "Total Employees", type: "text", correctAnswer: "25" }, { label: "Employees Below Wage Ceiling (₹21,000)", type: "text", correctAnswer: "8" }, { label: "Applicability", type: "select", options: ["Applicable", "Not Applicable"], correctAnswer: "Applicable" }] },
      { stepNumber: 2, name: "Employer & unit details", fields: [{ label: "Employer Name", type: "text", correctAnswer: "Aditya Rao" }, { label: "Unit Type", type: "select", options: ["Factory", "Shop", "Others"], correctAnswer: "Shop" }, { label: "Nature of Work", type: "text", correctAnswer: "IT services" }, { label: "Date of Applicability", type: "date", correctAnswer: "15/07/2024" }] },
      { stepNumber: 3, name: "Employee mapping", fields: [{ label: "Number of Insurable Employees", type: "text", correctAnswer: "8" }, { label: "Employer's Monthly Contribution Rate", type: "text", correctAnswer: "3.25" }, { label: "Employee's Monthly Contribution Rate", type: "text", correctAnswer: "0.75" }, { label: "Total Monthly Wages (Insurable)", type: "text", correctAnswer: "144000" }, { label: "Total Monthly Contribution", type: "text", correctAnswer: "5760" }] },
      { stepNumber: 4, name: "Bank & address details", fields: [{ label: "Registered Address", type: "text", correctAnswer: "Plot 8, HITEC City, Hyderabad" }, { label: "Pincode", type: "text", correctAnswer: "500081" }, { label: "Bank Account Number", type: "text", correctAnswer: "60123456789012" }, { label: "IFSC Code", type: "text", correctAnswer: "ICIC0002345" }] },
      { stepNumber: 5, name: "Submit & challan", fields: [{ label: "Declaration", type: "select", options: ["I agree", "I do not agree"], correctAnswer: "I agree" }, { label: "ESIC Code Generated", type: "text", correctAnswer: "36-00-223344-000-1002" }, { label: "Challan Due Date", type: "text", correctAnswer: "15/08/2024" }] },
    ],
  },
  {
    taskNumber: 3,
    businessName: "Green Leaf Restaurants",
    location: "Kochi, Kerala",
    bizType: "Partnership Firm",
    scenario: "Green Leaf Restaurants' 30 staff members are mostly kitchen and service staff earning below the ESI ceiling. The partners must register all 26 eligible workers under ESIC.",
    applicantDetails: { establishmentName: "Green Leaf Restaurants", pan: "AAFGL3456Q", employeeCount: 30, employeesUnderWageCeiling: 26, state: "Kerala", district: "Ernakulam" },
    steps: [
      { stepNumber: 1, name: "Establishment & applicability", fields: [{ label: "Establishment Name", type: "text", correctAnswer: "Green Leaf Restaurants" }, { label: "PAN", type: "text", correctAnswer: "AAFGL3456Q" }, { label: "Total Employees", type: "text", correctAnswer: "30" }, { label: "Employees Below Wage Ceiling (₹21,000)", type: "text", correctAnswer: "26" }, { label: "Applicability", type: "select", options: ["Applicable", "Not Applicable"], correctAnswer: "Applicable" }] },
      { stepNumber: 2, name: "Employer & unit details", fields: [{ label: "Employer Name", type: "text", correctAnswer: "Thomas Varghese" }, { label: "Unit Type", type: "select", options: ["Factory", "Shop", "Others"], correctAnswer: "Shop" }, { label: "Nature of Work", type: "text", correctAnswer: "Restaurant/hospitality" }, { label: "Date of Applicability", type: "date", correctAnswer: "01/04/2023" }] },
      { stepNumber: 3, name: "Employee mapping", fields: [{ label: "Number of Insurable Employees", type: "text", correctAnswer: "26" }, { label: "Employer's Monthly Contribution Rate", type: "text", correctAnswer: "3.25" }, { label: "Employee's Monthly Contribution Rate", type: "text", correctAnswer: "0.75" }, { label: "Total Monthly Wages (Insurable)", type: "text", correctAnswer: "390000" }, { label: "Total Monthly Contribution", type: "text", correctAnswer: "15600" }] },
      { stepNumber: 4, name: "Bank & address details", fields: [{ label: "Registered Address", type: "text", correctAnswer: "MG Road, Kochi" }, { label: "Pincode", type: "text", correctAnswer: "682016" }, { label: "Bank Account Number", type: "text", correctAnswer: "70234567890123" }, { label: "IFSC Code", type: "text", correctAnswer: "SBIN0007890" }] },
      { stepNumber: 5, name: "Submit & challan", fields: [{ label: "Declaration", type: "select", options: ["I agree", "I do not agree"], correctAnswer: "I agree" }, { label: "ESIC Code Generated", type: "text", correctAnswer: "34-00-334455-000-1003" }, { label: "Challan Due Date", type: "text", correctAnswer: "15/05/2023" }] },
    ],
  },
  {
    taskNumber: 4,
    businessName: "Om Sai Construction Co.",
    location: "Nagpur, Maharashtra",
    bizType: "Proprietorship",
    scenario: "Om Sai Construction Co. has 21 direct-payroll workers, of whom 18 earn below the ESI ceiling. The proprietor is registering the establishment and mapping insurable employees for the first time.",
    applicantDetails: { establishmentName: "Om Sai Construction Co.", pan: "AAOSC4567S", employeeCount: 21, employeesUnderWageCeiling: 18, state: "Maharashtra", district: "Nagpur" },
    steps: [
      { stepNumber: 1, name: "Establishment & applicability", fields: [{ label: "Establishment Name", type: "text", correctAnswer: "Om Sai Construction Co." }, { label: "PAN", type: "text", correctAnswer: "AAOSC4567S" }, { label: "Total Employees", type: "text", correctAnswer: "21" }, { label: "Employees Below Wage Ceiling (₹21,000)", type: "text", correctAnswer: "18" }, { label: "Applicability", type: "select", options: ["Applicable", "Not Applicable"], correctAnswer: "Applicable" }] },
      { stepNumber: 2, name: "Employer & unit details", fields: [{ label: "Employer Name", type: "text", correctAnswer: "Suresh Deshmukh" }, { label: "Unit Type", type: "select", options: ["Factory", "Shop", "Others"], correctAnswer: "Factory" }, { label: "Nature of Work", type: "text", correctAnswer: "Civil construction" }, { label: "Date of Applicability", type: "date", correctAnswer: "05/05/2024" }] },
      { stepNumber: 3, name: "Employee mapping", fields: [{ label: "Number of Insurable Employees", type: "text", correctAnswer: "18" }, { label: "Employer's Monthly Contribution Rate", type: "text", correctAnswer: "3.25" }, { label: "Employee's Monthly Contribution Rate", type: "text", correctAnswer: "0.75" }, { label: "Total Monthly Wages (Insurable)", type: "text", correctAnswer: "270000" }, { label: "Total Monthly Contribution", type: "text", correctAnswer: "10800" }] },
      { stepNumber: 4, name: "Bank & address details", fields: [{ label: "Registered Address", type: "text", correctAnswer: "Wardha Road, Nagpur" }, { label: "Pincode", type: "text", correctAnswer: "440025" }, { label: "Bank Account Number", type: "text", correctAnswer: "80345678901234" }, { label: "IFSC Code", type: "text", correctAnswer: "PUNB0345600" }] },
      { stepNumber: 5, name: "Submit & challan", fields: [{ label: "Declaration", type: "select", options: ["I agree", "I do not agree"], correctAnswer: "I agree" }, { label: "ESIC Code Generated", type: "text", correctAnswer: "35-00-445566-000-1004" }, { label: "Challan Due Date", type: "text", correctAnswer: "15/06/2024" }] },
    ],
  },
  {
    taskNumber: 5,
    businessName: "Sunshine Public School",
    location: "Indore, Madhya Pradesh",
    bizType: "Society/Trust",
    scenario: "Sunshine Public School has 40 staff, of whom 12 support-staff members fall below the ESI wage ceiling. The administrator must register and correctly exclude teaching staff who earn above the ceiling.",
    applicantDetails: { establishmentName: "Sunshine Public School", pan: "AASPS5678U", employeeCount: 40, employeesUnderWageCeiling: 12, state: "Madhya Pradesh", district: "Indore" },
    steps: [
      { stepNumber: 1, name: "Establishment & applicability", fields: [{ label: "Establishment Name", type: "text", correctAnswer: "Sunshine Public School" }, { label: "PAN", type: "text", correctAnswer: "AASPS5678U" }, { label: "Total Employees", type: "text", correctAnswer: "40" }, { label: "Employees Below Wage Ceiling (₹21,000)", type: "text", correctAnswer: "12" }, { label: "Applicability", type: "select", options: ["Applicable", "Not Applicable"], correctAnswer: "Applicable" }] },
      { stepNumber: 2, name: "Employer & unit details", fields: [{ label: "Employer Name", type: "text", correctAnswer: "Dr. Anjali Joshi" }, { label: "Unit Type", type: "select", options: ["Factory", "Shop", "Others"], correctAnswer: "Others" }, { label: "Nature of Work", type: "text", correctAnswer: "Education services" }, { label: "Date of Applicability", type: "date", correctAnswer: "01/04/2011" }] },
      { stepNumber: 3, name: "Employee mapping", fields: [{ label: "Number of Insurable Employees", type: "text", correctAnswer: "12" }, { label: "Employer's Monthly Contribution Rate", type: "text", correctAnswer: "3.25" }, { label: "Employee's Monthly Contribution Rate", type: "text", correctAnswer: "0.75" }, { label: "Total Monthly Wages (Insurable)", type: "text", correctAnswer: "180000" }, { label: "Total Monthly Contribution", type: "text", correctAnswer: "7200" }] },
      { stepNumber: 4, name: "Bank & address details", fields: [{ label: "Registered Address", type: "text", correctAnswer: "AB Road, Indore" }, { label: "Pincode", type: "text", correctAnswer: "452001" }, { label: "Bank Account Number", type: "text", correctAnswer: "90456789012345" }, { label: "IFSC Code", type: "text", correctAnswer: "BARB0INDORE" }] },
      { stepNumber: 5, name: "Submit & challan", fields: [{ label: "Declaration", type: "select", options: ["I agree", "I do not agree"], correctAnswer: "I agree" }, { label: "ESIC Code Generated", type: "text", correctAnswer: "23-00-556677-000-1005" }, { label: "Challan Due Date", type: "text", correctAnswer: "15/05/2011" }] },
    ],
  },
]

// ── Simulation definitions ────────────────────────────────────────────────────
const SIMULATIONS = [
  {
    id: "LL_EPFO_001",
    title: "EPFO Registration",
    slug: "epfo-registration",
    category: "Labour Laws",
    engineType: "LABOUR_EPFO",
    description: "Learn to register an establishment with EPFO for employees' provident fund and pension compliance.",
    learningObjective: "Understand the complete process of registering an establishment with EPFO including eligibility, documents, and DSC-based submission.",
    tasks: EPFO_TASKS,
  },
  {
    id: "LL_ESIC_001",
    title: "ESIC Registration",
    slug: "esic-registration",
    category: "Labour Laws",
    engineType: "LABOUR_ESIC",
    description: "Master ESI Act registration — wage ceiling eligibility, employee mapping, and challan generation.",
    learningObjective: "Learn to register an establishment under the Employees' State Insurance Act on the ESIC portal.",
    tasks: ESIC_TASKS,
  },
]

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🔗 Connecting to MongoDB…")
  await mongoose.connect(uri, { dbName: "saa_accounting_platform" })
  console.log("✅ Connected")

  // Remove only Labour Laws simulations (safe re-seed)
  const deleted = await Sim.deleteMany({ category: "Labour Laws" })
  console.log(`🗑  Removed ${deleted.deletedCount} existing Labour Laws simulations`)

  for (const sim of SIMULATIONS) {
    const questionSet = {
      tasks: sim.tasks.map((t) => ({
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
          fields: s.fields.map((f) => ({
            label: f.label,
            type: f.type,
            ...(("options" in f) ? { options: (f as any).options } : {}),
            // correctAnswer stored server-side only
            correctAnswer: (f as any).correctAnswer,
            ...((f as any).hint ? { hint: (f as any).hint } : {}),
          })),
        })),
      })),
    }

    await Sim.create({
      id: sim.id,
      title: sim.title,
      slug: sim.slug,
      description: sim.description,
      category: sim.category,
      difficulty: "Intermediate",
      duration: "120 mins",
      tags: ["Labour Laws", "EPFO", "ESIC", "Compliance", "Registration"],
      thumbnailUrl: "/placeholder-thumbnail.jpg",
      videoUrl: "/placeholder-video.mp4",
      scenario: sim.learningObjective,
      instructions: `Complete all 5 tasks in sequence. Each task covers a different business scenario requiring ${sim.title}. Follow the step-by-step portal simulation and enter the correct details for each field.`,
      assessmentRules: "Each step is auto-graded. Numeric fields accept ±10 tolerance. Contribution amounts accept ±10 rupees tolerance.",
      passingScore: 70,
      attemptsAllowed: 3,
      certificateEligible: true,
      engineType: sim.engineType,
      questionSet,
      learningObjectives: [sim.learningObjective],
      status: "published",
      published: true,
      createdBy: "system",
      views: 0,
      sortOrder: Date.now(),
    })
    console.log(`✅ Seeded: ${sim.title} (${sim.tasks.length} tasks)`)
  }

  await mongoose.disconnect()
  console.log("🎉 Labour Laws seed complete!")
}

main().catch((e) => {
  console.error("❌ Seed failed:", e.message)
  process.exit(1)
})
