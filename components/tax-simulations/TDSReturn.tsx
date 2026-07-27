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

export default function TDSReturn({ scenario, onSubmit, initialResponses }: Props) {
  const [startTime] = useState(Date.now())
  const [formData, setFormData] = useState(initialResponses || {
    returnType: "",
    tan: "",
    quarter: "",
    totalDeductees: 0,
    totalAmount: 0,
    totalTDS: 0,
    filingDate: new Date().toISOString().split("T")[0],
  })

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    if (!formData.returnType || !formData.tan || !formData.quarter) {
      toast({ title: "Please fill return type, TAN and quarter", variant: "destructive" })
      return
    }
    if (!formData.totalDeductees || !formData.totalTDS) {
      toast({ title: "Please fill deductee count and TDS total", variant: "destructive" })
      return
    }
    onSubmit(formData, timeSpent)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-neutral-200 bg-slate-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="text-lg font-semibold text-foreground mb-4">TDS Return Filing Scenario</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <p><strong>Return Type:</strong> {scenario.returnType}</p>
            <p><strong>Deductor TAN:</strong> {scenario.tan}</p>
            <p><strong>Financial Year:</strong> {scenario.financialYear}</p>
            <p><strong>Quarter:</strong> {scenario.quarter}</p>
          </div>
          <div>
            <p><strong>Total Deductees:</strong> {scenario.totalDeductees}</p>
            <p><strong>Total Payment:</strong> ₹{scenario.totalAmount.toLocaleString()}</p>
            <p><strong>Total TDS:</strong> ₹{scenario.totalTDS.toLocaleString()}</p>
            <p><strong>Filing Due Date:</strong> {scenario.filingDueDate}</p>
          </div>
        </div>
      </div>

      <Card className="p-6 border border-neutral-200 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h3 className="text-lg font-bold text-foreground mb-6">TDS Return Filing Form</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-foreground">Return Type *</label>
              <select
                value={formData.returnType}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, returnType: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100"
              >
                <option value="">Select return type</option>
                <option value="24Q">24Q - TDS on Salary</option>
                <option value="26Q">26Q - TDS on Non-Salary</option>
                <option value="27Q">27Q - TDS on NRI Payments</option>
                <option value="27EQ">27EQ - TCS Return</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Deductor TAN *</label>
              <Input
                value={formData.tan}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, tan: e.target.value.toUpperCase() }))}
                placeholder="ABCD12345E"
                maxLength={10}
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-foreground">Quarter *</label>
              <select
                value={formData.quarter}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, quarter: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100"
              >
                <option value="">Select quarter</option>
                <option value="Q1 (Apr-Jun)">Q1 (Apr-Jun)</option>
                <option value="Q2 (Jul-Sep)">Q2 (Jul-Sep)</option>
                <option value="Q3 (Oct-Dec)">Q3 (Oct-Dec)</option>
                <option value="Q4 (Jan-Mar)">Q4 (Jan-Mar)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Filing Date *</label>
              <Input
                type="date"
                value={formData.filingDate}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, filingDate: e.target.value }))}
                className="mt-2"
              />
            </div>
          </div>

          <div className="border-t border-border pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-foreground">Total Deductees *</label>
              <Input
                type="number"
                value={formData.totalDeductees || ""}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, totalDeductees: Number(e.target.value) }))}
                placeholder="Number of deductees"
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Total Payment Amount (₹) *</label>
              <Input
                type="number"
                value={formData.totalAmount || ""}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, totalAmount: Number(e.target.value) }))}
                placeholder="Gross amount paid"
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Total TDS Deducted (₹) *</label>
              <Input
                type="number"
                value={formData.totalTDS || ""}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, totalTDS: Number(e.target.value) }))}
                placeholder="Total TDS amount"
                className="mt-2"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/90">
            Validate & File TDS Return
          </Button>
        </div>
      </Card>
    </div>
  )
}
