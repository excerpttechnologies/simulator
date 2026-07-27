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

export default function TDSForm16({ scenario, onSubmit, initialResponses }: Props) {
  const [startTime] = useState(Date.now())
  const [formData, setFormData] = useState(initialResponses || {
    grossSalary: 0,
    standardDeduction: 50000,
    netSalary: 0,
    totalDeductions: 0,
    taxableIncome: 0,
    totalTax: 0,
  })

  const handleCalculate = () => {
    const gross = Number(formData.grossSalary)
    const stdDeduction = 50000
    const net = gross - stdDeduction
    const deductions = Number(formData.totalDeductions) || 0
    const taxable = net - deductions

    let tax = 0
    if (taxable <= 300000) tax = 0
    else if (taxable <= 600000) tax = (taxable - 300000) * 0.05
    else if (taxable <= 900000) tax = 15000 + (taxable - 600000) * 0.10
    else if (taxable <= 1200000) tax = 45000 + (taxable - 900000) * 0.15
    else if (taxable <= 1500000) tax = 90000 + (taxable - 1200000) * 0.20
    else tax = 150000 + (taxable - 1500000) * 0.30

    const cess = Math.round(tax * 0.04)
    const totalTax = Math.round(tax + cess)

    setFormData((prev: any) => ({
      ...prev,
      standardDeduction: stdDeduction,
      netSalary: net,
      taxableIncome: taxable,
      totalTax,
    }))

    toast({ title: "Tax computation complete!" })
  }

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    if (!formData.grossSalary || !formData.totalTax) {
      toast({ title: "Please compute the tax before submitting", variant: "destructive" })
      return
    }
    onSubmit(formData, timeSpent)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-neutral-200 bg-slate-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="text-lg font-semibold text-foreground mb-4">Form 16 — Employee Tax Certificate Scenario</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <p><strong>Employee:</strong> {scenario.employeeName}</p>
            <p><strong>Employee PAN:</strong> {scenario.employeePAN}</p>
            <p><strong>Employer TAN:</strong> {scenario.employerTAN}</p>
            <p><strong>Financial Year:</strong> {scenario.financialYear}</p>
          </div>
          <div>
            <p><strong>Basic Salary:</strong> ₹{scenario.basicSalary.toLocaleString()}</p>
            <p><strong>HRA:</strong> ₹{scenario.hra.toLocaleString()}</p>
            <p><strong>Dearness Allowance (DA):</strong> ₹{scenario.da.toLocaleString()}</p>
            <p><strong>Section 80C Investment:</strong> ₹{scenario.section80C.toLocaleString()}</p>
            <p><strong>Section 80D Health Insurance:</strong> ₹{scenario.section80D.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <Card className="p-6 border border-neutral-200 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-foreground">FORM 16 — Tax Computation Sheet</h3>
          <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">AY {scenario.assessmentYear}</span>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-foreground">Total Gross Salary (₹) *</label>
              <Input
                type="number"
                value={formData.grossSalary || ""}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, grossSalary: Number(e.target.value) }))}
                placeholder="Basic + HRA + DA (after HRA exemption)"
                className="mt-2"
              />
              <p className="mt-1 text-xs text-muted-foreground">Include all salary heads after applicable exemptions</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Total Chapter VI-A Deductions (₹) *</label>
              <Input
                type="number"
                value={formData.totalDeductions || ""}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, totalDeductions: Number(e.target.value) }))}
                placeholder="80C + 80D combined"
                className="mt-2"
              />
              <p className="mt-1 text-xs text-muted-foreground">Max 80C: ₹1,50,000 | Max 80D: ₹25,000</p>
            </div>
          </div>

          <div className="flex pt-2">
            <Button onClick={handleCalculate} variant="outline">
              Compute Tax Liability
            </Button>
          </div>

          {formData.netSalary > 0 && (
            <div className="mt-4 border border-border rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    { label: "Gross Salary", value: formData.grossSalary },
                    { label: "Less: Standard Deduction", value: -formData.standardDeduction },
                    { label: "Net Salary", value: formData.netSalary, bold: true },
                    { label: "Less: Chapter VI-A Deductions", value: -formData.totalDeductions },
                    { label: "Total Taxable Income", value: formData.taxableIncome, bold: true, highlight: true },
                    { label: "Income Tax (as per slab)", value: null },
                    { label: "Add: 4% Health & Education Cess", value: null },
                    { label: "Total Tax Payable", value: formData.totalTax, bold: true, primary: true },
                  ].map((row, i) => (
                    <tr key={i} className={`border-b border-border ${row.highlight ? "bg-primary/5" : ""}`}>
                      <td className={`p-3 ${row.bold ? "font-semibold" : ""} ${row.primary ? "text-primary" : ""}`}>{row.label}</td>
                      <td className={`p-3 text-right ${row.bold ? "font-semibold" : ""} ${row.primary ? "text-primary font-bold" : ""}`}>
                        {row.value !== null && row.value !== undefined
                          ? `₹${Math.abs(row.value).toLocaleString()}${row.value < 0 ? " (deduction)" : ""}`
                          : "As computed"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/90">
            Generate & Issue Form 16
          </Button>
        </div>
      </Card>
    </div>
  )
}
