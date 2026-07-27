"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { ShieldCheck, User, Building2, MapPin, Phone, Mail, Hash, Calendar } from "lucide-react"

interface Props {
  scenario: any
  onSubmit: (responses: any, timeSpent: number) => void
  initialResponses?: any
}

const REGISTRATION_REASONS = [
  "Voluntary basis",
  "Aggregate turnover exceeds threshold",
  "Interstate supply",
  "E-commerce operator",
  "Casual taxable person",
]

const BUSINESS_TYPES = [
  "Proprietorship",
  "Partnership",
  "Private Limited",
  "LLP",
  "Public Limited",
  "HUF",
  "Trust",
  "Society",
]

const INDIAN_STATES = [
  { code: "01", name: "Jammu and Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "27", name: "Maharashtra" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh" },
]

export default function GSTRegistrationSanath({ scenario, onSubmit, initialResponses }: Props) {
  const [startTime] = useState(Date.now())
  const [tab, setTab] = useState<"part-a" | "part-b">("part-a")
  const [responses, setResponses] = useState(initialResponses || {
    // Part A — TRN & reason
    trn: "",
    registrationReason: "",
    commencementDate: "",
    // Part B — Proprietor details
    proprietorName: "",
    fatherName: "",
    pan: "",
    aadhaar: "",
    mobile: "",
    dob: "",
    email: "",
    // Residential address
    residentialRoomNo: "",
    residentialBuilding: "",
    residentialStreet: "",
    residentialDistrict: "",
    residentialState: "",
    residentialStateCode: "",
    residentialPincode: "",
    // Business address
    businessRoomNo: "",
    businessBuilding: "",
    businessStreet: "",
    businessDistrict: "",
    businessState: "",
    businessStateCode: "",
    businessPincode: "",
    businessEmail: "",
    // Jurisdiction
    sector: "",
    commissionerate: "",
    division: "",
    range: "",
    ward: "",
    // HSN
    hsnCode: "",
    hsnDescription: "",
    // Generated GSTIN
    gstin: "",
  })

  const set = (field: string, value: string) =>
    setResponses((prev: any) => ({ ...prev, [field]: value }))

  const handleStateChange = (prefix: "residential" | "business", stateName: string) => {
    const state = INDIAN_STATES.find((s) => s.name === stateName)
    setResponses((prev: any) => ({
      ...prev,
      [`${prefix}State`]: stateName,
      [`${prefix}StateCode`]: state?.code || "",
    }))
  }

  const generateGSTIN = () => {
    const pan = responses.pan?.trim().toUpperCase()
    const stateCode = responses.businessStateCode
    if (!stateCode || !pan || pan.length !== 10) {
      toast({ title: "Enter a valid PAN and select the business state first", variant: "destructive" })
      return
    }
    const checkDigit = Math.floor(Math.random() * 10)
    set("gstin", `${stateCode}${pan}1Z${checkDigit}`)
    toast({ title: "GSTIN generated!" })
  }

  const handleSubmit = () => {
    const required = [
      "trn", "registrationReason", "commencementDate",
      "proprietorName", "fatherName", "pan", "mobile", "email",
      "businessState", "businessPincode", "hsnCode", "gstin",
    ]
    const missing = required.filter((k) => !responses[k])
    if (missing.length) {
      toast({ title: `Please fill all required fields (${missing.length} missing)`, variant: "destructive" })
      return
    }
    onSubmit(responses, Math.floor((Date.now() - startTime) / 1000))
  }

  const inputCls =
    "mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100"
  const labelCls = "block text-xs font-semibold text-muted-foreground uppercase tracking-wide"
  const selectCls =
    "mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100"

  return (
    <div className="space-y-6">
      {/* Scenario card */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900/40 dark:bg-blue-950/20">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-foreground">Case Study — GST New Registration</h3>
        </div>
        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <p><span className="font-medium text-foreground">Applicant:</span> {scenario.proprietorName}</p>
          <p><span className="font-medium text-foreground">Brand / Business:</span> {scenario.company}</p>
          <p><span className="font-medium text-foreground">Activity:</span> {scenario.activity}</p>
          <p><span className="font-medium text-foreground">Registration Basis:</span> {scenario.registrationReason}</p>
          <p><span className="font-medium text-foreground">TRN Issued:</span> {scenario.trn}</p>
          <p><span className="font-medium text-foreground">Business State:</span> {scenario.businessState}</p>
        </div>
        <p className="mt-3 text-xs text-blue-700 dark:text-blue-400">
          Complete Part A and Part B of the GST REG-01 form using the details provided in the case study.
        </p>
      </div>

      {/* Portal header */}
      <div className="rounded-2xl border border-neutral-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-900">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-widest">GST Portal — Simulated</p>
            <h2 className="text-lg font-bold text-foreground">New Registration — REG-01</h2>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            TRN Stage
          </span>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-xl bg-muted p-1 w-fit">
        {(["part-a", "part-b"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t === "part-a" ? "Part A — TRN Details" : "Part B — Applicant Details"}
          </button>
        ))}
      </div>

      {tab === "part-a" && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-5 dark:border-neutral-800 dark:bg-neutral-950">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Hash className="h-4 w-4 text-primary" /> Part A — Temporary Reference Number
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Temporary Reference Number (TRN) *</label>
              <input type="text" value={responses.trn} onChange={(e) => set("trn", e.target.value)} placeholder="Enter TRN" className={inputCls} maxLength={15} />
              <p className="mt-1 text-xs text-muted-foreground">Scenario TRN: {scenario.trn}</p>
            </div>

            <div>
              <label className={labelCls}>Reason to Obtain Registration *</label>
              <select value={responses.registrationReason} onChange={(e) => set("registrationReason", e.target.value)} className={selectCls}>
                <option value="">Select reason</option>
                {REGISTRATION_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Date of Commencement of Business *</label>
              <input type="date" value={responses.commencementDate} onChange={(e) => set("commencementDate", e.target.value)} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Business / Brand Name *</label>
              <input type="text" value={responses.businessName || ""} onChange={(e) => set("businessName", e.target.value)} placeholder="Trade / Brand name" className={inputCls} />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button onClick={() => setTab("part-b")}>Continue to Part B →</Button>
          </div>
        </div>
      )}

      {tab === "part-b" && (
        <div className="space-y-6">
          {/* Proprietor details */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-5 dark:border-neutral-800 dark:bg-neutral-950">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Proprietor / Authorised Signatory Details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Name of Proprietor *</label>
                <input type="text" value={responses.proprietorName} onChange={(e) => set("proprietorName", e.target.value)} placeholder="Full name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Father's Name *</label>
                <input type="text" value={responses.fatherName} onChange={(e) => set("fatherName", e.target.value)} placeholder="Father's full name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>PAN *</label>
                <input type="text" value={responses.pan} onChange={(e) => set("pan", e.target.value.toUpperCase())} placeholder="DVIXP2288Y" maxLength={10} className={inputCls} />
                <p className="mt-1 text-xs text-muted-foreground">5 letters + 4 digits + 1 letter</p>
              </div>
              <div>
                <label className={labelCls}>Aadhaar Number</label>
                <input type="text" value={responses.aadhaar} onChange={(e) => set("aadhaar", e.target.value)} placeholder="12-digit Aadhaar" maxLength={12} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Date of Birth *</label>
                <input type="date" value={responses.dob} onChange={(e) => set("dob", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Mobile Number *</label>
                <input type="tel" value={responses.mobile} onChange={(e) => set("mobile", e.target.value)} placeholder="10-digit mobile" maxLength={10} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Personal Email *</label>
                <input type="email" value={responses.email} onChange={(e) => set("email", e.target.value)} placeholder="personal email" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Residential address */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-5 dark:border-neutral-800 dark:bg-neutral-950">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Residential Address
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Room / Door No.</label>
                <input type="text" value={responses.residentialRoomNo} onChange={(e) => set("residentialRoomNo", e.target.value)} placeholder="No. 51" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Flat / Building Name</label>
                <input type="text" value={responses.residentialBuilding} onChange={(e) => set("residentialBuilding", e.target.value)} placeholder="Planet Block 7" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Street / City</label>
                <input type="text" value={responses.residentialStreet} onChange={(e) => set("residentialStreet", e.target.value)} placeholder="Bandra" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>District</label>
                <input type="text" value={responses.residentialDistrict} onChange={(e) => set("residentialDistrict", e.target.value)} placeholder="Mumbai" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>State</label>
                <select value={responses.residentialState} onChange={(e) => handleStateChange("residential", e.target.value)} className={selectCls}>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s.code} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Pincode</label>
                <input type="text" value={responses.residentialPincode} onChange={(e) => set("residentialPincode", e.target.value)} placeholder="400050" maxLength={6} className={inputCls} />
              </div>
            </div>
          </div>

          {/* Business / Principal Place of Business */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-5 dark:border-neutral-800 dark:bg-neutral-950">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Principal Place of Business
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Room / Door No.</label>
                <input type="text" value={responses.businessRoomNo} onChange={(e) => set("businessRoomNo", e.target.value)} placeholder="38/VI" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Flat / Building Name</label>
                <input type="text" value={responses.businessBuilding} onChange={(e) => set("businessBuilding", e.target.value)} placeholder="Sindur Vihar" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Street / City</label>
                <input type="text" value={responses.businessStreet} onChange={(e) => set("businessStreet", e.target.value)} placeholder="Sindhur Nagar" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>District</label>
                <input type="text" value={responses.businessDistrict} onChange={(e) => set("businessDistrict", e.target.value)} placeholder="Mumbai" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>State *</label>
                <select value={responses.businessState} onChange={(e) => handleStateChange("business", e.target.value)} className={selectCls}>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s.code} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>State Code (auto)</label>
                <input type="text" value={responses.businessStateCode} readOnly className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-slate-100 px-3 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-400" />
              </div>
              <div>
                <label className={labelCls}>Pincode *</label>
                <input type="text" value={responses.businessPincode} onChange={(e) => set("businessPincode", e.target.value)} placeholder="400654" maxLength={6} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Business Email</label>
                <input type="email" value={responses.businessEmail} onChange={(e) => set("businessEmail", e.target.value)} placeholder="business@domain.com" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Jurisdiction */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-5 dark:border-neutral-800 dark:bg-neutral-950">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Hash className="h-4 w-4 text-primary" /> Jurisdiction Details
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelCls}>Sector</label>
                <input type="text" value={responses.sector} onChange={(e) => set("sector", e.target.value)} placeholder="37" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Commissionerate</label>
                <input type="text" value={responses.commissionerate} onChange={(e) => set("commissionerate", e.target.value)} placeholder="Mumbai" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Division</label>
                <input type="text" value={responses.division} onChange={(e) => set("division", e.target.value)} placeholder="4" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Range</label>
                <input type="text" value={responses.range} onChange={(e) => set("range", e.target.value)} placeholder="Mumbai" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Ward</label>
                <input type="text" value={responses.ward} onChange={(e) => set("ward", e.target.value)} placeholder="18" className={inputCls} />
              </div>
            </div>
          </div>

          {/* HSN / Manufacturing */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-5 dark:border-neutral-800 dark:bg-neutral-950">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Hash className="h-4 w-4 text-primary" /> Nature of Business — Goods / Services
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>HSN Code *</label>
                <input type="text" value={responses.hsnCode} onChange={(e) => set("hsnCode", e.target.value)} placeholder="94052090" maxLength={8} className={inputCls} />
                <p className="mt-1 text-xs text-muted-foreground">Manufacturing products — LED Bulbs: 94052090</p>
              </div>
              <div>
                <label className={labelCls}>Product / Service Description</label>
                <input type="text" value={responses.hsnDescription} onChange={(e) => set("hsnDescription", e.target.value)} placeholder="LED Bulbs — Manufacturing" className={inputCls} />
              </div>
            </div>
          </div>

          {/* GSTIN Generation */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-4 dark:border-neutral-800 dark:bg-neutral-950">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> GSTIN
            </h3>
            <div>
              <label className={labelCls}>GSTIN *</label>
              <div className="flex gap-2 mt-1.5">
                <input
                  type="text"
                  value={responses.gstin}
                  onChange={(e) => set("gstin", e.target.value.toUpperCase())}
                  placeholder="27DVIXP2288Y1Z5"
                  maxLength={15}
                  className="flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100"
                />
                <Button variant="outline" onClick={generateGSTIN}>Generate GSTIN</Button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Format: State Code (2) + PAN (10) + Entity No (1) + Z + Check Digit (1) = 15 chars
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setTab("part-a")} className="flex-1">← Back to Part A</Button>
            <Button onClick={handleSubmit} className="flex-1 bg-primary hover:bg-primary/90">Submit Registration</Button>
          </div>
        </div>
      )}
    </div>
  )
}
