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

export default function TDSChallan({ scenario, onSubmit, initialResponses }: Props) {
  const [startTime] = useState(Date.now())
  const [formData, setFormData] = useState(initialResponses || {
    tan: "",
    assessmentYear: "",
    totalTDS: 0,
    surcharge: 0,
    cess: 0,
    totalAmount: 0,
    paymentDate: new Date().toISOString().split("T")[0],
  })

  const handleCalculate = () => {
    const tds = Number(formData.totalTDS)
    const surcharge = tds > 100000 ? Math.round(tds * 0.10) : 0
    const cess = Math.round((tds + surcharge) * 0.04)
    const totalAmount = tds + surcharge + cess

    setFormData((prev: any) => ({
      ...prev,
      surcharge,
      cess,
      totalAmount,
    }))

    toast({ title: "Challan amount calculated successfully!" })
  }

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    if (!formData.tan || !formData.assessmentYear) {
      toast({ title: "Please fill TAN and Assessment Year", variant: "destructive" })
      return
    }
    if (!formData.totalTDS || !formData.totalAmount) {
      toast({ title: "Please calculate the total challan amount", variant: "destructive" })
      return
    }
    onSubmit(formData, timeSpent)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-neutral-200 bg-slate-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="text-lg font-semibold text-foreground mb-4">Challan Instructions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <p><strong>Deductor TAN:</strong> {scenario.tan}</p>
            <p><strong>Assessment Year:</strong> {scenario.assessmentYear}</p>
            <p><strong>TDS Sections included:</strong> {scenario.sections.join(", ")}</p>
          </div>
          <div>
            <p><strong>Base TDS Liability:</strong> ₹{scenario.totalTDS.toLocaleString()}</p>
            <p><strong>Surcharge expected:</strong> ₹{scenario.surcharge.toLocaleString()}</p>
            <p><strong>Cess expected:</strong> ₹{scenario.cess.toLocaleString()}</p>
            <p><strong>Expected Total Challan:</strong> ₹{scenario.totalAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <Card className="p-6 border border-neutral-200 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h3 className="text-lg font-bold text-foreground mb-6">Challan ITNS 281 Payment Form</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-foreground">Deductor TAN *</label>
              <Input
                value={formData.tan}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, tan: e.target.value.toUpperCase() }))}
                placeholder="ABCD12345E"
                maxLength={10}
                className="mt-2"
              />
              <p className="mt-1 text-xs text-muted-foreground">Format: 4 letters + 5 digits + 1 letter</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Assessment Year *</label>
              <select
                value={formData.assessmentYear}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, assessmentYear: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100"
              >
                <option value="">Select AY</option>
                <option value="2025-26">2025-26</option>
                <option value="2026-27">2026-27</option>
                <option value="2027-28">2027-28</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border pt-4">
            <div>
              <label className="text-sm font-medium text-foreground">Base TDS Amount (₹) *</label>
              <Input
                type="number"
                value={formData.totalTDS || ""}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, totalTDS: Number(e.target.value) }))}
                placeholder="Enter base TDS sum"
                className="mt-2"
              />
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

          <div className="flex flex-col md:flex-row gap-6 items-center pt-2">
            <Button onClick={handleCalculate} variant="outline" className="w-full md:w-auto">
              Compute Challan Breakdowns
            </Button>
          </div>

          <div className="space-y-2 text-sm pt-4 border-t border-border">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Surcharge amount:</span>
              <span className="font-semibold text-foreground">₹{formData.surcharge.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Education Cess:</span>
              <span className="font-semibold text-foreground">₹{formData.cess.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-primary pt-2">
              <span>Total Challan Amount:</span>
              <span>₹{formData.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/90">
            Generate Challan & Deposit Tax
          </Button>
        </div>
      </Card>
    </div>
  )
}
