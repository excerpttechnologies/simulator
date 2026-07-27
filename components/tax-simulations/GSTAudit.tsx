"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Card } from "@/components/ui/card"

interface Props {
  scenario: any
  onSubmit: (responses: any, timeSpent: number) => void
  initialResponses?: any
}

export default function GSTAudit({ scenario, onSubmit, initialResponses }: Props) {
  const [startTime] = useState(Date.now())
  const [findings, setFindings] = useState<any[]>(
    initialResponses?.findings ||
      scenario.auditPoints.map((p: any) => ({
        id: p.id,
        identified: false,
        remarks: "",
      }))
  )

  const handleCheckboxChange = (index: number, val: boolean) => {
    setFindings((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], identified: val }
      return updated
    })
  }

  const handleRemarksChange = (index: number, val: string) => {
    setFindings((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], remarks: val }
      return updated
    })
  }

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)

    // Ensure all transactions have remarks
    const missingRemarks = findings.some((f) => !f.remarks || f.remarks.trim().length < 10)
    if (missingRemarks) {
      toast({ title: "Please provide detailed remarks (min 10 characters) for all audit points", variant: "destructive" })
      return
    }

    onSubmit({ findings }, timeSpent)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-neutral-200 bg-slate-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="text-lg font-semibold text-foreground mb-2">GST Internal Audit Workdesk</h3>
        <p className="text-sm text-muted-foreground">
          <strong>Auditee Company:</strong> {scenario.company}
        </p>
        <p className="text-xs text-primary font-medium mt-3 leading-relaxed">
          Audit Guidelines: Inspect the transactions below. Under Section 17(5) of the CGST Act, certain purchases are not eligible for Input Tax Credit (ITC) (Blocked Credits). Disallow/Flag ineligible credits and document your audit remarks.
        </p>
      </div>

      <Card className="p-6 border border-neutral-200 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h3 className="text-lg font-bold text-foreground mb-6">Auditing Transactions ledger</h3>

        <div className="space-y-6">
          {scenario.auditPoints.map((point: any, idx: number) => (
            <div
              key={point.id}
              className={`p-4 rounded-2xl border transition-colors ${
                findings[idx]?.identified
                  ? "border-destructive/30 bg-destructive/5 dark:bg-destructive/10"
                  : "border-border bg-slate-50/50 dark:bg-neutral-900/50"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 dark:bg-neutral-800 dark:text-slate-200">
                      Point #{point.id}
                    </span>
                    <span className="text-sm font-semibold text-foreground">₹{point.amount.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-foreground">{point.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 bg-white dark:bg-neutral-950 px-3 py-2 rounded-xl border border-border">
                  <Checkbox
                    id={`flag-${point.id}`}
                    checked={findings[idx]?.identified || false}
                    onCheckedChange={(val) => handleCheckboxChange(idx, !!val)}
                  />
                  <label htmlFor={`flag-${point.id}`} className="text-xs font-bold text-destructive cursor-pointer uppercase">
                    Disallow ITC
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Audit Remark & Legal Reference *</label>
                <input
                  type="text"
                  value={findings[idx]?.remarks || ""}
                  onChange={(e) => handleRemarksChange(idx, e.target.value)}
                  placeholder="Reference section (e.g. Eligible under Section 16, or Blocked credit under Sec 17(5)...)"
                  className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/90">
            Submit Audit Report & Findings
          </Button>
        </div>
      </Card>
    </div>
  )
}
