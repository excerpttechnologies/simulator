"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import type { Simulation, SimulationAttempt } from "@/lib/types"

const ACCOUNTS = [
  "Cash A/c",
  "Bank A/c",
  "Purchases A/c",
  "Sales A/c",
  "Capital A/c",
  "Rent A/c",
  "Salary A/c",
  "Machinery A/c",
  "Debtors A/c",
  "Creditors A/c",
  "Stock A/c",
  "Loan A/c",
  "Interest A/c",
  "Commission A/c",
  "Drawings A/c",
  "Building A/c",
  "Depreciation A/c",
  "Advertisement A/c",
  "Discount A/c",
]

// Default question sets per engine type — used when no questionSet is configured
const DEFAULT_QUESTION_SETS: Record<string, any> = {
  JOURNAL: {
    questions: [
      { transaction: "Commenced business with cash ₹50,000", correctDebit: "Cash A/c", correctCredit: "Capital A/c", amount: 50000 },
      { transaction: "Purchased goods for cash ₹10,000", correctDebit: "Purchases A/c", correctCredit: "Cash A/c", amount: 10000 },
      { transaction: "Sold goods to Ramesh on credit ₹15,000", correctDebit: "Debtors A/c", correctCredit: "Sales A/c", amount: 15000 },
      { transaction: "Paid rent ₹3,000 by cheque", correctDebit: "Rent A/c", correctCredit: "Bank A/c", amount: 3000 },
      { transaction: "Received cash from Ramesh ₹15,000", correctDebit: "Cash A/c", correctCredit: "Debtors A/c", amount: 15000 },
    ],
  },
  LEDGER: {
    questions: [
      { transaction: "Capital introduced ₹1,00,000", journalDebit: "Cash A/c", journalCredit: "Capital A/c", amount: 100000, particular: "01-Apr" },
      { transaction: "Purchases ₹20,000 on credit", journalDebit: "Purchases A/c", journalCredit: "Creditors A/c", amount: 20000, particular: "05-Apr" },
      { transaction: "Sales ₹35,000 for cash", journalDebit: "Cash A/c", journalCredit: "Sales A/c", amount: 35000, particular: "10-Apr" },
      { transaction: "Paid salary ₹8,000", journalDebit: "Salary A/c", journalCredit: "Cash A/c", amount: 8000, particular: "30-Apr" },
    ],
  },
  TRIAL_BALANCE: {
    questions: [
      { account: "Capital A/c", correctSide: "Credit", balance: 100000 },
      { account: "Cash A/c", correctSide: "Debit", balance: 45000 },
      { account: "Purchases A/c", correctSide: "Debit", balance: 30000 },
      { account: "Sales A/c", correctSide: "Credit", balance: 55000 },
      { account: "Salary A/c", correctSide: "Debit", balance: 12000 },
      { account: "Rent A/c", correctSide: "Debit", balance: 6000 },
      { account: "Debtors A/c", correctSide: "Debit", balance: 18000 },
      { account: "Creditors A/c", correctSide: "Credit", balance: 14000 },
      { account: "Stock A/c", correctSide: "Debit", balance: 22000 },
      { account: "Bank A/c", correctSide: "Debit", balance: 46000 },
    ],
  },
  TDS: {
    questions: [
      { type: "Contractor payment", section: "194C", correctTDS: 1000, dueDate: "7th of next month", amount: 50000, rate: 2 },
      { type: "Professional fees", section: "194J", correctTDS: 3000, dueDate: "7th of next month", amount: 30000, rate: 10 },
      { type: "Rent (building)", section: "194I", correctTDS: 2000, dueDate: "7th of next month", amount: 20000, rate: 10 },
      { type: "Commission", section: "194H", correctTDS: 750, dueDate: "7th of next month", amount: 15000, rate: 5 },
    ],
  },
  EXCEL: {
    questions: [
      { exercise: "Calculate SUM of A1:A5 where values are 10,20,30,40,50", functionName: "SUM", expectedResult: "150" },
      { exercise: "Find AVERAGE of 80, 90, 70, 85, 95", functionName: "AVERAGE", expectedResult: "84" },
      { exercise: "Use VLOOKUP to find salary of Employee ID 3 in a table (IDs 1-5, salaries 30000-50000)", functionName: "VLOOKUP", expectedResult: "40000" },
      { exercise: "Count cells with values > 50 in range [60,45,80,30,90]", functionName: "COUNTIF", expectedResult: "3" },
    ],
  },
}

function safeParseJson(value: any) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value)
    } catch {
      return {}
    }
  }
  return value ?? {}
}

function buildDefaultResponses(engineType: string, questionSet: any, initialResponses: any) {
  if (initialResponses) return initialResponses
  const questions = Array.isArray(questionSet.questions) && questionSet.questions.length > 0
    ? questionSet.questions
    : (DEFAULT_QUESTION_SETS[engineType]?.questions ?? [])
  switch (engineType) {
    case "JOURNAL":
    case "LEDGER":
      return questions.map(() => ({ debit: "", credit: "", amount: "" }))
    case "TRIAL_BALANCE":
      return questions.map(() => ({ side: "", amount: "" }))
    case "TDS":
      return questions.map(() => ({ section: "", tds: "", dueDate: "" }))
    case "EXCEL":
      return questions.map(() => ({ formula: "", result: "" }))
    case "GST_INVOICE":
    case "GST_RETURN":
    case "EWAYBILL":
    case "PAYROLL":
    case "INCOME_TAX":
    case "BANKING":
      return initialResponses || {}
    default:
      return questions.map(() => ({ answer: "" }))
  }
}

interface Props {
  simulation: Simulation
  attempt: SimulationAttempt | null
  slug: string
  onScore?: (score: any) => void
}

export default function SimulationPlayer({ simulation, attempt, slug, onScore }: Props) {
  const engineType = simulation.engineType || "JOURNAL"
  const questionSet = safeParseJson(simulation.questionSet)
  const [responses, setResponses] = useState<any>(() => buildDefaultResponses(engineType, questionSet, attempt?.responses))
  const [scoreResult, setScoreResult] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [timeStarted] = useState(Date.now())
  const [timeSpent, setTimeSpent] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - timeStarted) / 1000))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [timeStarted])

  useEffect(() => {
    if (attempt?.responses) {
      setResponses(attempt.responses)
    }
  }, [attempt])

  const headerLabel = useMemo(() => {
    switch (engineType) {
      case "JOURNAL":
        return "Journal entry practice"
      case "TRIAL_BALANCE":
        return "Trial balance preparation"
      case "TDS":
        return "TDS calculation exercise"
      case "GST_INVOICE":
        return "GST invoice validation"
      case "GST_RETURN":
        return "GST return computation"
      case "EWAYBILL":
        return "E-Way bill generation"
      case "EXCEL":
        return "Excel formula practice"
      default:
        return "Simulation exercise"
    }
  }, [engineType])

  const questions = Array.isArray(questionSet.questions) && questionSet.questions.length > 0
    ? questionSet.questions
    : (DEFAULT_QUESTION_SETS[engineType]?.questions ?? [])

  function updateAnswer(index: number, field: string, value: string) {
    setResponses((prev: any) => {
      const next = Array.isArray(prev) ? [...prev] : [...buildDefaultResponses(engineType, questionSet, [])]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  async function saveProgress(completed = false) {
    setSaving(true)
    try {
      const response = await fetch(`/api/user/simulations/${slug}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progress: { engineType, step: completed ? "completed" : "in-progress" },
          responses,
          currentStep: completed ? "completed" : "workspace",
          timeSpent,
          status: completed ? "completed" : "in-progress",
          score: completed ? 0 : attempt?.score ?? 0,
          completed,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        toast({ title: "Unable to save progress", description: data.error || "Please try again." })
        return null
      }
      toast({ title: completed ? "Simulation completed" : "Progress saved", description: completed ? "Your attempt is now submitted." : "Your progress was saved." })
      return data
    } catch (error) {
      toast({ title: "Error", description: "Unable to reach the server." })
      return null
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/user/simulations/${slug}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses,
          progress: { engineType, step: "completed" },
          currentStep: "completed",
          timeSpent,
          completed: true,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        toast({ title: "Unable to submit", description: data.error || "Please try again." })
        return
      }
      setScoreResult(data.score)
      if (onScore) onScore(data.score)
      toast({ title: "Submission received", description: `Score: ${data.score.percentage}%` })
    } catch (error) {
      toast({ title: "Error", description: "Unable to submit the simulation." })
    } finally {
      setSubmitting(false)
    }
  }

  function renderJournal() {
    return (
      <div className="space-y-4">
        {questions.map((q: any, index: number) => (
          <div key={index} className="rounded-3xl border border-neutral-200 bg-slate-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Transaction {index + 1}</p>
                <p className="mt-2 text-base font-semibold text-slate-950 dark:text-white">{q.transaction || q.prompt || "Describe the transaction."}</p>
              </div>
              <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 dark:border-neutral-700 dark:text-slate-300">₹{q.amount ?? q.correctAmount ?? 0}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 mt-4">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Debit account</label>
                <select value={responses[index]?.debit ?? ""} onChange={(event) => updateAnswer(index, "debit", event.target.value)} className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100">
                  <option value="">Select account…</option>
                  {ACCOUNTS.map((account) => (<option key={account} value={account}>{account}</option>))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Credit account</label>
                <select value={responses[index]?.credit ?? ""} onChange={(event) => updateAnswer(index, "credit", event.target.value)} className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100">
                  <option value="">Select account…</option>
                  {ACCOUNTS.map((account) => (<option key={account} value={account}>{account}</option>))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Amount</label>
                <input value={responses[index]?.amount ?? ""} onChange={(event) => updateAnswer(index, "amount", event.target.value)} type="number" className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  function renderTrialBalance() {
    return (
      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-slate-50 dark:border-neutral-800 dark:bg-neutral-900">
        <table className="w-full text-sm text-left">
          <thead className="bg-white text-slate-700 dark:bg-neutral-950 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Side</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {questions.map((q: any, index: number) => (
              <tr key={index} className="bg-white dark:bg-neutral-950">
                <td className="px-4 py-4">{q.account || q.label}</td>
                <td className="px-4 py-4">₹{q.balance ?? q.amount ?? 0}</td>
                <td className="px-4 py-4">
                  <select value={responses[index]?.side ?? ""} onChange={(event) => updateAnswer(index, "side", event.target.value)} className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100">
                    <option value="">Select…</option>
                    <option value="Dr">Dr</option>
                    <option value="Cr">Cr</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  function renderTDS() {
    return (
      <div className="space-y-4">
        {questions.map((q: any, index: number) => (
          <div key={index} className="rounded-3xl border border-neutral-200 bg-slate-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Payment {index + 1}</p>
                <p className="mt-2 text-base font-semibold text-slate-950 dark:text-white">{q.payee || q.description || "Contractor payment"}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Amount: ₹{q.amount ?? 0}</p>
              </div>
              <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 dark:border-neutral-700 dark:text-slate-300">{q.section || q.type || "194C"}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 mt-4">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Section</label>
                <input value={responses[index]?.section ?? ""} onChange={(event) => updateAnswer(index, "section", event.target.value)} className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100" placeholder="194C" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">TDS amount</label>
                <input value={responses[index]?.tds ?? ""} onChange={(event) => updateAnswer(index, "tds", event.target.value)} type="number" className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Due date</label>
                <input value={responses[index]?.dueDate ?? ""} onChange={(event) => updateAnswer(index, "dueDate", event.target.value)} className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100" placeholder="15th Jul" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  function renderGSTInvoice() {
    const scenario = questionSet.scenario || {}
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-sm text-slate-500 dark:text-slate-400">Invoice data from scenario. Fill in the fields to validate the GST invoice.</p>
        </div>
        {[
          { label: "Seller GSTIN", field: "sellerGSTIN" },
          { label: "Buyer GSTIN", field: "buyerGSTIN" },
          { label: "HSN Code", field: "hsnCode" },
          { label: "Place of supply", field: "placeOfSupply" },
          { label: "Supply type", field: "supplyType" },
          { label: "Taxable value", field: "taxableValue" },
          { label: "GST rate", field: "gstRate" },
          { label: "CGST", field: "cgst" },
          { label: "SGST", field: "sgst" },
          { label: "Total amount", field: "totalAmount" },
          { label: "Invoice number", field: "invoiceNo" },
          { label: "Invoice date", field: "invoiceDate" },
        ].map((item) => (
          <div key={item.field} className="space-y-2">
            <label className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.label}</label>
            <input
              value={responses[item.field] ?? ""}
              onChange={(event) => setResponses((prev: any) => ({ ...prev, [item.field]: event.target.value }))}
              className="w-full rounded-2xl border border-neutral-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100"
            />
          </div>
        ))}
        {scenario.taxableValue ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950 dark:text-emerald-300">Expected taxable value: ₹{scenario.taxableValue}</p>
        ) : null}
      </div>
    )
  }

  function renderExcel() {
    return (
      <div className="space-y-4">
        {questions.map((question: any, index: number) => (
          <div key={index} className="rounded-3xl border border-neutral-200 bg-slate-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Exercise {index + 1}</p>
            <p className="mt-2 text-base font-semibold text-slate-950 dark:text-white">{question.exercise || question.prompt}</p>
            <div className="grid gap-3 sm:grid-cols-2 mt-4">
              <label className="space-y-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Formula</span>
                <input value={responses[index]?.formula ?? ""} onChange={(event) => updateAnswer(index, "formula", event.target.value)} className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100" />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Result</span>
                <input value={responses[index]?.result ?? ""} onChange={(event) => updateAnswer(index, "result", event.target.value)} className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100" />
              </label>
            </div>
          </div>
        ))}
      </div>
    )
  }

  function renderGeneric() {
    return (
      <div className="space-y-4">
        {questions.map((question: any, index: number) => (
          <div key={index} className="rounded-3xl border border-neutral-200 bg-slate-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Question {index + 1}</p>
            <p className="mt-2 text-base font-semibold text-slate-950 dark:text-white">{question.prompt || question.question || `Question ${index + 1}`}</p>
            <textarea
              value={responses[index]?.answer ?? ""}
              onChange={(event) => updateAnswer(index, "answer", event.target.value)}
              rows={4}
              className="mt-4 w-full rounded-2xl border border-neutral-200 bg-white px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100"
            />
          </div>
        ))}
      </div>
    )
  }

  function renderPlayer() {
    if (questions.length === 0) {
      return (
        <div className="rounded-3xl border border-dashed border-neutral-200 bg-slate-50 py-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-3xl mb-3">📝</div>
          <p className="font-semibold text-foreground">No questions available</p>
          <p className="text-sm text-muted-foreground mt-1">
            Contact your instructor to configure this simulation.
          </p>
        </div>
      )
    }

    switch (engineType) {
      case "JOURNAL":
      case "LEDGER":
        return renderJournal()
      case "TRIAL_BALANCE":
        return renderTrialBalance()
      case "TDS":
        return renderTDS()
      case "GST_INVOICE":
        return renderGSTInvoice()
      case "EXCEL":
        return renderExcel()
      default:
        return renderGeneric()
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-primary">{headerLabel}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{simulation.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{simulation.instructions}</p>
          </div>
          <div className="space-y-2 text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Elapsed time</p>
            <p className="text-xl font-semibold text-slate-950 dark:text-white">{Math.floor(timeSpent / 60)}m {timeSpent % 60}s</p>
          </div>
        </div>
      </div>

      {renderPlayer()}

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <Button variant="outline" onClick={() => saveProgress(false)} disabled={saving || submitting}>
          Save progress
        </Button>
        <Button onClick={handleSubmit} disabled={submitting || saving}>
          Submit answers
        </Button>
      </div>

      {scoreResult ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          <p className="text-base font-semibold">Assessment result</p>
          <p className="mt-3">Final score: <strong>{scoreResult.percentage}%</strong></p>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{scoreResult.breakdown?.length ? "Detailed feedback is available below." : "The simulation was graded automatically."}</p>
          {scoreResult.breakdown?.length ? (
            <div className="mt-4 space-y-3">
              {scoreResult.breakdown.map((item: any, index: number) => (
                <div key={index} className="rounded-2xl border border-emerald-200 bg-white p-4 dark:border-emerald-900 dark:bg-neutral-950">
                  <p className="font-semibold text-slate-900 dark:text-white">{item.question || item.label || item.step || `Item ${index + 1}`}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Score: {item.marks}/{item.maxMarks ?? item.marks}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
