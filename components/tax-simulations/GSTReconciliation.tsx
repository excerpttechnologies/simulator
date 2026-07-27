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

export default function GSTReconciliation({ scenario, onSubmit, initialResponses }: Props) {
  const [startTime] = useState(Date.now())
  const [formData, setFormData] = useState(initialResponses || {
    booksSales: 0,
    gstr1Sales: 0,
    mismatch: 0,
    notes: "",
    actionPlan: "",
  })

  const handleCalculate = () => {
    const books = Number(formData.booksSales)
    const gstr = Number(formData.gstr1Sales)
    const mismatch = Math.abs(books - gstr)
    setFormData((prev: any) => ({ ...prev, mismatch }))
    toast({ title: "Calculated discrepancy: ₹" + mismatch.toLocaleString() })
  }

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    if (!formData.booksSales || !formData.gstr1Sales) {
      toast({ title: "Please enter books sales and GSTR-1 sales figures first", variant: "destructive" })
      return
    }
    if (!formData.notes || !formData.actionPlan) {
      toast({ title: "Please write reconciliation notes and your action plan", variant: "destructive" })
      return
    }
    onSubmit(formData, timeSpent)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-neutral-200 bg-slate-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="text-lg font-semibold text-foreground mb-4">Reconciliation Scenario Instructions</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p><strong>Auditing Target:</strong> {scenario.company}</p>
          <p><strong>Sales Value as per Books of Accounts:</strong> ₹{scenario.booksSales.toLocaleString()}</p>
          <p><strong>Sales Value as per GSTR-1 Return Report:</strong> ₹{scenario.gstr1Sales.toLocaleString()}</p>
          <p className="text-xs text-primary font-medium mt-3">Instructions: Fill in the correct Books and GSTR-1 figures, calculate the mismatch amount, and propose a reconciliation action plan (e.g., filing an amendment or raising debit notes).</p>
        </div>
      </div>

      <Card className="p-6 border border-neutral-200 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h3 className="text-lg font-bold text-foreground mb-6">Reconciliation & Discrepancy Sheet</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-sm font-medium text-foreground">Sales Value in Books (₹) *</label>
            <Input
              type="number"
              value={formData.booksSales || ""}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, booksSales: Number(e.target.value) }))}
              placeholder="e.g. 500000"
              className="mt-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Sales Value in GSTR-1 (₹) *</label>
            <Input
              type="number"
              value={formData.gstr1Sales || ""}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, gstr1Sales: Number(e.target.value) }))}
              placeholder="e.g. 450000"
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center border-t border-border pt-4 mb-6">
          <Button onClick={handleCalculate} variant="outline" className="w-full md:w-auto">
            Calculate Discrepancy (Mismatch)
          </Button>
          <div className="text-sm font-medium">
            Computed Mismatch: <span className="text-destructive text-lg font-bold">₹{formData.mismatch.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Reconciliation Notes (Explain reasons for mismatch) *</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, notes: e.target.value }))}
              placeholder="Identify why they differ (e.g. invoice omitted, duplicate filing...)"
              rows={3}
              className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Action Plan (Resolution Steps) *</label>
            <textarea
              value={formData.actionPlan}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, actionPlan: e.target.value }))}
              placeholder="What changes/filings must be carried out to reconcile?"
              rows={3}
              className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/90">
            Submit Reconciliation Statement
          </Button>
        </div>
      </Card>
    </div>
  )
}
