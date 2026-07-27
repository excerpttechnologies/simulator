"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Card } from "@/components/ui/card"

interface Props {
  scenario: any
  onSubmit: (responses: any, timeSpent: number) => void
  initialResponses?: any
}

const TDS_SECTIONS_LIST = [
  { section: "194C", label: "194C - Payment to Contractors (1% Indiv / 2% Others)" },
  { section: "194J", label: "194J - Professional or Technical Fees (10%)" },
  { section: "194H", label: "194H - Commission or Brokerage (5%)" },
  { section: "194I", label: "194I - Rent on Land & Building (10%)" },
  { section: "194R", label: "194R - Benefit or Perquisite in Business (10%)" },
  { section: "194Q", label: "194Q - Purchase of Goods (0.1%)" },
]

export default function TDSDeduction({ scenario, onSubmit, initialResponses }: Props) {
  const [startTime] = useState(Date.now())
  const [formData, setFormData] = useState(initialResponses || {
    payeeName: scenario.payeeName,
    pan: "",
    section: "",
    tdsRate: 0,
    tdsAmount: 0,
    netPayable: 0,
    paymentDate: new Date().toISOString().split("T")[0],
  })

  const handleCalculate = () => {
    const gross = scenario.grossAmount
    const rate = Number(formData.tdsRate)
    const tdsAmount = Math.round((gross * rate) / 100)
    const netPayable = gross - tdsAmount

    setFormData((prev: any) => ({
      ...prev,
      tdsAmount,
      netPayable,
    }))

    toast({ title: "TDS calculations computed!" })
  }

  const handleSectionChange = (section: string) => {
    // Attempt to auto-fill rate based on selected section or leave for student to fill
    setFormData((prev: any) => ({ ...prev, section }))
  }

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    if (!formData.section || !formData.pan) {
      toast({ title: "Please fill section and payee PAN details", variant: "destructive" })
      return
    }
    if (!formData.tdsAmount || !formData.netPayable) {
      toast({ title: "Please calculate the TDS & Net Payable amounts first", variant: "destructive" })
      return
    }
    onSubmit(formData, timeSpent)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-neutral-200 bg-slate-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="text-lg font-semibold text-foreground mb-4">Expense Voucher Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <p><strong>Vendor (Payee):</strong> {scenario.payeeName}</p>
            <p><strong>Deductee Type:</strong> {scenario.deducteeType}</p>
            <p><strong>Expected Pan (Refer to vendor details):</strong> {scenario.pan}</p>
          </div>
          <div>
            <p><strong>Gross Invoice Amount:</strong> ₹{scenario.grossAmount.toLocaleString()}</p>
            <p><strong>Nature of Payment:</strong> {scenario.description}</p>
            <p><strong>Section Threshold Limit:</strong> ₹{scenario.threshold.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <Card className="p-6 border border-neutral-200 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h3 className="text-lg font-bold text-foreground mb-6">TDS Deduction Entry</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-foreground">Payee PAN *</label>
              <Input
                value={formData.pan}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, pan: e.target.value.toUpperCase() }))}
                placeholder="ABCDE1234F"
                maxLength={10}
                className="mt-2"
              />
              <p className="mt-1 text-xs text-muted-foreground">10-character alphanumeric code</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Payment Date *</label>
              <Input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, paymentDate: e.target.value }))}
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-foreground">TDS Section Code *</label>
              <select
                value={formData.section}
                onChange={(e) => handleSectionChange(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100"
              >
                <option value="">Select applicable Section</option>
                {TDS_SECTIONS_LIST.map((item) => (
                  <option key={item.section} value={item.section}>{item.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">TDS Rate (%) *</label>
              <Input
                type="number"
                step="0.1"
                value={formData.tdsRate || ""}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, tdsRate: Number(e.target.value) }))}
                placeholder="e.g. 10"
                className="mt-2"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center border-t border-border pt-4">
            <Button onClick={handleCalculate} variant="outline" className="w-full md:w-auto">
              Compute TDS Deduction
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
            <div className="flex justify-between items-center text-sm py-2">
              <span className="text-muted-foreground">TDS Deducted amount (to be deposited):</span>
              <span className="font-bold text-destructive">₹{formData.tdsAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2">
              <span className="text-muted-foreground">Net Payment to Vendor:</span>
              <span className="font-bold text-primary">₹{formData.netPayable.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/90">
            Post Voucher Ledger Entry
          </Button>
        </div>
      </Card>
    </div>
  )
}
