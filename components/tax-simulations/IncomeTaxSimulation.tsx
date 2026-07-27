"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Calculator, User, FileText } from "lucide-react"

interface Props {
  scenario: any
  onSubmit: (responses: any, timeSpent: number) => void
  initialResponses?: any
}

export default function IncomeTaxSimulation({ scenario, onSubmit, initialResponses }: Props) {
  const [startTime] = useState(Date.now())
  const [answers, setAnswers] = useState(initialResponses || {
    grossSalary: "",
    netSalary: "",
    grossTotalIncome: "",
    totalDeductions: "",
    taxableIncome: "",
    totalTax: "",
  })
  const [computed, setComputed] = useState<any>(null)

  const set = (k: string, v: string) => setAnswers((p: any) => ({ ...p, [k]: v }))

  function handleCompute() {
    const gross = Number(answers.grossSalary)
    if (!gross) { toast({ title: "Enter Gross Salary first", variant: "destructive" }); return }
    const stdDed = 50000
    const net = gross - stdDed
    const deductions = Number(answers.totalDeductions) || 0
    const gti = net + (scenario.otherIncome || 0)
    const taxable = gti - deductions

    let tax = 0
    if (taxable > 300000) {
      if (taxable <= 600000) tax = (taxable - 300000) * 0.05
      else if (taxable <= 900000) tax = 15000 + (taxable - 600000) * 0.10
      else if (taxable <= 1200000) tax = 45000 + (taxable - 900000) * 0.15
      else if (taxable <= 1500000) tax = 90000 + (taxable - 1200000) * 0.20
      else tax = 150000 + (taxable - 1500000) * 0.30
    }
    const cess = Math.round(tax * 0.04)
    const total = Math.round(tax + cess)

    setComputed({ net, gti, taxable, total })
    setAnswers((p: any) => ({ ...p, netSalary: String(net), grossTotalIncome: String(Math.round(gti)), taxableIncome: String(Math.round(taxable)), totalTax: String(total) }))
    toast({ title: "Tax computed — review and submit" })
  }

  function handleSubmit() {
    const required = ["grossSalary", "netSalary", "grossTotalIncome", "totalDeductions", "taxableIncome", "totalTax"]
    const missing = required.filter((k) => !answers[k])
    if (missing.length) { toast({ title: "Please fill all fields", variant: "destructive" }); return }
    onSubmit(answers, Math.floor((Date.now() - startTime) / 1000))
  }

  const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`

  return (
    <div className="space-y-6">
      {/* Scenario card */}
      <Card className="p-5 border border-sky-200 bg-sky-50 dark:border-sky-900/40 dark:bg-sky-950/20">
        <div className="flex items-center gap-2 mb-3">
          <User className="h-5 w-5 text-sky-600" />
          <h3 className="font-semibold text-foreground">Income Tax Computation — AY {scenario.assessmentYear}</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground">
          <p><span className="font-medium text-foreground">Employee:</span> {scenario.employeeName}</p>
          <p><span className="font-medium text-foreground">City Type:</span> {scenario.cityType}</p>
          <p><span className="font-medium text-foreground">Basic Salary:</span> {fmt(scenario.basicSalary)}</p>
          <p><span className="font-medium text-foreground">HRA Received:</span> {fmt(scenario.hra)}</p>
          <p><span className="font-medium text-foreground">Dearness Allowance:</span> {fmt(scenario.da)}</p>
          <p><span className="font-medium text-foreground">Rent Paid:</span> {fmt(scenario.rentPaid)}</p>
          <p><span className="font-medium text-foreground">Other Income:</span> {fmt(scenario.otherIncome || 0)}</p>
        </div>
        <div className="mt-3 pt-3 border-t border-sky-200 dark:border-sky-900/40 grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground">
          <p><span className="font-medium text-foreground">Section 80C:</span> {fmt(scenario.section80C)} <span className="text-xs">(max ₹1,50,000)</span></p>
          <p><span className="font-medium text-foreground">Section 80D:</span> {fmt(scenario.section80D)} <span className="text-xs">(max ₹25,000)</span></p>
        </div>
        <p className="mt-3 text-xs text-sky-700 dark:text-sky-400">
          Compute the taxable income and total tax liability (including 4% cess) under the new tax regime.
        </p>
      </Card>

      {/* Input form */}
      <Card className="p-6 border border-neutral-200 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center gap-2 mb-5">
          <Calculator className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground">Tax Computation Sheet</h3>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Total Gross Salary (₹) <span className="text-xs text-muted-foreground">(after HRA exemption)</span>
              </label>
              <Input type="number" value={answers.grossSalary} onChange={(e) => set("grossSalary", e.target.value)} placeholder="Enter gross salary" className="rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Total Chapter VI-A Deductions (₹)
              </label>
              <Input type="number" value={answers.totalDeductions} onChange={(e) => set("totalDeductions", e.target.value)} placeholder="80C + 80D" className="rounded-xl" />
              <p className="mt-1 text-xs text-muted-foreground">Max 80C: ₹1,50,000 | Max 80D: ₹25,000</p>
            </div>
          </div>

          <div className="flex justify-start pt-1">
            <Button onClick={handleCompute} variant="outline" className="rounded-xl gap-2">
              <Calculator className="h-4 w-4" /> Compute Tax
            </Button>
          </div>

          {/* Derived fields — auto-filled by compute, editable */}
          <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-border">
            {[
              { key: "netSalary", label: "Net Salary (after ₹50,000 std deduction)" },
              { key: "grossTotalIncome", label: "Gross Total Income (incl. other income)" },
              { key: "taxableIncome", label: "Total Taxable Income" },
              { key: "totalTax", label: "Total Tax Payable (incl. 4% cess)" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-foreground mb-1.5">{label} (₹)</label>
                <Input
                  type="number"
                  value={answers[key]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder="0"
                  className={`rounded-xl ${key === "totalTax" ? "border-primary" : ""}`}
                />
              </div>
            ))}
          </div>

          {/* Computation table preview */}
          {computed && (
            <div className="rounded-xl border border-border overflow-hidden mt-2">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    { label: "Gross Salary", value: Number(answers.grossSalary) },
                    { label: "Less: Standard Deduction", value: -50000 },
                    { label: "Net Salary", value: computed.net, bold: true },
                    { label: "Add: Other Income", value: scenario.otherIncome || 0 },
                    { label: "Gross Total Income", value: computed.gti, bold: true },
                    { label: "Less: Chapter VI-A Deductions", value: -Number(answers.totalDeductions || 0) },
                    { label: "Taxable Income", value: computed.taxable, bold: true, highlight: true },
                    { label: "Income Tax + 4% Cess", value: computed.total, bold: true, primary: true },
                  ].map((row, i) => (
                    <tr key={i} className={`border-b border-border ${row.highlight ? "bg-primary/5" : ""}`}>
                      <td className={`px-4 py-2 ${row.bold ? "font-semibold" : ""} ${row.primary ? "text-primary" : ""}`}>{row.label}</td>
                      <td className={`px-4 py-2 text-right ${row.bold ? "font-semibold" : ""} ${row.primary ? "text-primary font-bold" : ""}`}>
                        {row.value < 0 ? `(${fmt(Math.abs(row.value))})` : fmt(row.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <Button onClick={handleSubmit} className="w-full rounded-xl bg-primary hover:bg-primary/90 gap-2">
            <FileText className="h-4 w-4" /> Submit Tax Computation
          </Button>
        </div>
      </Card>
    </div>
  )
}
