"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

interface Props {
  scenario: any
  onSubmit: (responses: any, timeSpent: number) => void
  initialResponses?: any
}

const BUSINESS_TYPES = ["Proprietorship", "Partnership", "Private Limited", "LLP", "Public Limited"]
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
  { code: "11", name: "Sikkim" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" },
  { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" },
  { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "27", name: "Maharashtra" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman and Nicobar" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh" },
]

export default function GSTRegistration({ scenario, onSubmit, initialResponses }: Props) {
  const [startTime] = useState(Date.now())
  const [responses, setResponses] = useState(initialResponses || {
    businessType: "",
    pan: "",
    state: "",
    stateCode: "",
    address: "",
    pincode: "",
    mobile: "",
    email: "",
    gstin: "",
  })

  const handleChange = (field: string, value: string) => {
    setResponses((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleStateChange = (stateName: string) => {
    const state = INDIAN_STATES.find(s => s.name === stateName)
    setResponses((prev: any) => ({
      ...prev,
      state: stateName,
      stateCode: state?.code || "",
    }))
  }

  const generateGSTIN = () => {
    if (!responses.stateCode || !responses.pan || responses.pan.length !== 10) {
      toast({ title: "Please select state and enter valid PAN first", variant: "destructive" })
      return
    }
    
    const checkDigit = Math.floor(Math.random() * 10)
    const gstin = `${responses.stateCode}${responses.pan}1Z${checkDigit}`
    handleChange("gstin", gstin)
    toast({ title: "GSTIN generated successfully!" })
  }

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    
    // Validation
    if (!responses.businessType || !responses.pan || !responses.state || !responses.address || 
        !responses.pincode || !responses.mobile || !responses.email || !responses.gstin) {
      toast({ title: "Please fill all fields", variant: "destructive" })
      return
    }

    onSubmit(responses, timeSpent)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-neutral-200 bg-slate-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="text-lg font-semibold text-foreground mb-4">Scenario</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p><strong>Company:</strong> {scenario.company}</p>
          <p><strong>Business Type:</strong> {scenario.businessType}</p>
          <p><strong>PAN:</strong> {scenario.pan}</p>
          <p><strong>State:</strong> {scenario.state}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
        <h3 className="text-lg font-semibold text-foreground mb-4">GST Registration Form</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Business Type *</label>
            <select
              value={responses.businessType}
              onChange={(e) => handleChange("businessType", e.target.value)}
              className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100"
            >
              <option value="">Select business type</option>
              {BUSINESS_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">PAN *</label>
            <input
              type="text"
              value={responses.pan}
              onChange={(e) => handleChange("pan", e.target.value.toUpperCase())}
              placeholder="ABCDE1234F"
              maxLength={10}
              className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100"
            />
            <p className="mt-1 text-xs text-muted-foreground">Format: 5 letters + 4 digits + 1 letter</p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">State *</label>
            <select
              value={responses.state}
              onChange={(e) => handleStateChange(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100"
            >
              <option value="">Select state</option>
              {INDIAN_STATES.map(state => (
                <option key={state.code} value={state.name}>{state.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">State Code</label>
            <input
              type="text"
              value={responses.stateCode}
              readOnly
              className="mt-2 w-full rounded-2xl border border-neutral-200 bg-slate-100 px-4 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Address *</label>
            <textarea
              value={responses.address}
              onChange={(e) => handleChange("address", e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Pincode *</label>
            <input
              type="text"
              value={responses.pincode}
              onChange={(e) => handleChange("pincode", e.target.value)}
              placeholder="400001"
              maxLength={6}
              className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Mobile *</label>
            <input
              type="tel"
              value={responses.mobile}
              onChange={(e) => handleChange("mobile", e.target.value)}
              placeholder="+91 9876543210"
              className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Email *</label>
            <input
              type="email"
              value={responses.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="company@example.com"
              className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">GSTIN *</label>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={responses.gstin}
                onChange={(e) => handleChange("gstin", e.target.value.toUpperCase())}
                placeholder="27ABCDE1234F1Z5"
                maxLength={15}
                className="flex-1 rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100"
              />
              <Button onClick={generateGSTIN} variant="outline">
                Generate GSTIN
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Format: State Code (2) + PAN (10) + Entity Number (1) + Z + Check Digit (1)</p>
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={handleSubmit} className="w-full">
            Submit Registration
          </Button>
        </div>
      </div>
    </div>
  )
}
