"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BookOpen, FileDown, PlayCircle, ShieldCheck } from "lucide-react"

interface GSTTaskIntroContent {
  title?: string
  taskId?: string
  questionNo?: string
  duration?: string
  status?: string
  overview?: string[]
  learningPoints?: string[]
  portalAccess?: {
    userId?: string
    password?: string
  }
  steps?: string[]
  keyCalculations?: Array<{
    label: string
    value: string
  }>
  businessName?: string
  taxPeriod?: string
  salesInvoices?: Array<{
    date?: string
    invoiceNo?: string
    recipientGSTIN?: string
    recipient?: string
    taxableValue?: string
    gstRate?: string
    cgst?: string
    sgst?: string
    igst?: string
    invoiceValue?: string
  }>
  purchaseInvoices?: Array<{
    date?: string
    invoiceNo?: string
    supplierGSTIN?: string
    supplier?: string
    taxableValue?: string
    gstRate?: string
    cgst?: string
    sgst?: string
    igst?: string
    invoiceValue?: string
  }>
}

interface GSTTaskIntroductionProps {
  content?: GSTTaskIntroContent
  onStart: () => void
}

export default function GSTTaskIntroduction({ content, onStart }: GSTTaskIntroductionProps) {
  const intro = {
    title: "GSTR-1 & GSTR-3B Practical Task",
    taskId: "GST_RTN3B_024BFB",
    questionNo: "GST_RTN3B_024BFB",
    duration: "20 mins",
    status: "Not Started",
    overview: [
      "Kitchen World Pvt. Ltd. is a kitchen utensil shop located in Maharashtra.",
      "You are required to file GSTR-1 and GSTR-3B for February 2025 based on the sales and purchase details provided.",
      "Enter the outward supplies in the right tables, claim ITC from the GSTR-2B purchase details, and compute the net GST payable.",
    ],
    learningPoints: [
      "Classify B2B versus B2C outward invoices correctly.",
      "Apply CGST + SGST for intra-state Maharashtra supplies.",
      "Use the GSTR-2B purchase data for eligible ITC set-off.",
    ],
    steps: [
      "Log in to the simulated GST portal using the credentials provided.",
      "File GSTR-1 for the February 2025 return period.",
      "Claim ITC from the GSTR-2B purchases and file GSTR-3B.",
    ],
    keyCalculations: [
      { label: "Output tax liability", value: "₹2,80,146" },
      { label: "ITC available", value: "₹1,61,390" },
      { label: "Net tax payable", value: "₹1,18,756" },
    ],
    businessName: "Kitchen World Pvt. Ltd.",
    taxPeriod: "February 2025",
    salesInvoices: [
      { date: "02/02/2025", invoiceNo: "INV-635", recipientGSTIN: "33AQCXF4595J2ZC", recipient: "Riya Steels", taxableValue: "₹6,75,000", gstRate: "12%", cgst: "₹40,500", sgst: "₹40,500", igst: "—", invoiceValue: "₹7,56,000" },
      { date: "04/02/2025", invoiceNo: "INV-636", recipientGSTIN: "—", recipient: "Sarang (Maharashtra)", taxableValue: "₹4,900", gstRate: "18%", cgst: "₹441", sgst: "₹441", igst: "—", invoiceValue: "₹5,782" },
      { date: "13/02/2025", invoiceNo: "INV-637", recipientGSTIN: "—", recipient: "Krishna (Maharashtra)", taxableValue: "₹4,600", gstRate: "12%", cgst: "₹276", sgst: "₹276", igst: "—", invoiceValue: "₹5,152" },
      { date: "18/02/2025", invoiceNo: "INV-638", recipientGSTIN: "27KPYXN2300N2ZP", recipient: "Metal Plaza", taxableValue: "₹7,12,000", gstRate: "18%", cgst: "₹64,080", sgst: "₹64,080", igst: "—", invoiceValue: "₹8,40,160" },
      { date: "24/02/2025", invoiceNo: "INV-639", recipientGSTIN: "—", recipient: "Abdul (Maharashtra)", taxableValue: "₹1,400", gstRate: "18%", cgst: "₹126", sgst: "₹126", igst: "—", invoiceValue: "₹1,652" },
      { date: "25/02/2025", invoiceNo: "INV-640", recipientGSTIN: "33TYMXD6734F8ZC", recipient: "Delight Enterprise", taxableValue: "₹3,85,000", gstRate: "18%", cgst: "₹34,650", sgst: "₹34,650", igst: "—", invoiceValue: "₹4,54,300" },
    ],
    purchaseInvoices: [
      { date: "05/02/2025", invoiceNo: "G-974", supplierGSTIN: "27JOSXG5730F1ZC", supplier: "Accadia Gallery", taxableValue: "₹4,50,000", gstRate: "18%", cgst: "₹40,500", sgst: "₹40,500", igst: "—", invoiceValue: "₹5,31,000" },
      { date: "16/02/2025", invoiceNo: "INV000856", supplierGSTIN: "27NARXF6452B2ZD", supplier: "Sincere Trading Co.", taxableValue: "₹6,43,000", gstRate: "5%", cgst: "₹16,075", sgst: "₹16,075", igst: "—", invoiceValue: "₹6,75,150" },
      { date: "24/02/2025", invoiceNo: "GST/INV/630", supplierGSTIN: "32OPQXN2362N1ZC", supplier: "AKP Metals & Steels", taxableValue: "₹2,68,000", gstRate: "18%", cgst: "₹24,120", sgst: "₹24,120", igst: "—", invoiceValue: "₹3,16,240" },
    ],
    ...(content || {}),
    portalAccess: {
      userId: "Kitchenworld",
      password: "Kitchen@65",
      ...(content?.portalAccess || {}),
    },
  }

  const handleDownloadPdf = () => {
    if (typeof window !== "undefined") {
      window.print()
    }
  }

  return (
    <Card className="gst-task-intro-card overflow-hidden border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="border-b border-neutral-200 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 dark:border-neutral-800">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              <BookOpen className="h-4 w-4" /> Introduction / Theory Page
            </div>
            <h1 className="mt-3 text-2xl font-bold text-foreground">{intro.taskId}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {intro.taskId} • {intro.questionNo} • {intro.duration} • Status: {intro.status}
            </p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-white/80 px-4 py-3 text-sm shadow-sm dark:bg-neutral-900/80">
            <p className="font-semibold text-foreground">Simulated website</p>
            <p className="text-muted-foreground">For educational purpose only</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div className="rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 text-sm text-muted-foreground dark:border-neutral-800 dark:bg-neutral-900">
          <div className="font-medium text-foreground">🏠 / Essentials Of Digital Statutory ... / Learning Contents / Goods and Services Tax / E-Filing of GSTR-1 and GSTR-3B</div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-foreground">Scenario</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {intro.overview?.join(" ") || "Meena Sharma runs a kitchenware trading business called Kitchen World Pvt. Ltd. in Mumbai, Maharashtra. She is required to file GSTR-1 and GSTR-3B for the month of February 2025. As her GST consultant, you are required to enter the detailed outward and inward supplies and compute the net GST payable."}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">Structured Data Fields</h2>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <div className="rounded-2xl border border-neutral-200 bg-slate-50 p-3 text-sm text-muted-foreground dark:border-neutral-800 dark:bg-neutral-900">
                  <span className="font-semibold text-foreground">Business Name:</span> {intro.businessName || "Kitchen World Pvt. Ltd."}
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-slate-50 p-3 text-sm text-muted-foreground dark:border-neutral-800 dark:bg-neutral-900">
                  <span className="font-semibold text-foreground">Question No:</span> {intro.questionNo || "GST_RTN3B_024BFB"}
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-slate-50 p-3 text-sm text-muted-foreground dark:border-neutral-800 dark:bg-neutral-900">
                  <span className="font-semibold text-foreground">Tax Period:</span> {intro.taxPeriod || "February 2025"}
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-slate-50 p-3 text-sm text-muted-foreground dark:border-neutral-800 dark:bg-neutral-900">
                  <span className="font-semibold text-foreground">Portal User ID:</span> {intro.portalAccess?.userId || "Kitchenworld"}
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-slate-50 p-3 text-sm text-muted-foreground dark:border-neutral-800 dark:bg-neutral-900">
                  <span className="font-semibold text-foreground">Portal Password:</span> {intro.portalAccess?.password || "Kitchen@65"}
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-slate-50 p-3 text-sm text-muted-foreground dark:border-neutral-800 dark:bg-neutral-900">
                  <span className="font-semibold text-foreground">Status:</span> {intro.status || "Not Started"}
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Learning Objectives
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {(intro.learningPoints || []).map((point, index) => (
                  <li key={`${point}-${index}`} className="rounded-2xl border border-neutral-200 bg-slate-50 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900">
                    {point}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">Task Steps</h2>
              <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
                {(intro.steps || []).map((step, index) => (
                  <li key={`${step}-${index}`} className="rounded-2xl border border-neutral-200 bg-slate-50 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900">
                    <span className="mr-2 font-semibold text-foreground">{index + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">Outward Supply / Sales Invoice Table</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-left dark:bg-neutral-900">
                      <th className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">Date</th>
                      <th className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">Invoice No.</th>
                      <th className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">Recipient GSTIN</th>
                      <th className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">Recipient Name</th>
                      <th className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">Taxable Value (₹)</th>
                      <th className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">GST Rate</th>
                      <th className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">CGST (₹)</th>
                      <th className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">SGST (₹)</th>
                      <th className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">IGST (₹)</th>
                      <th className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">Invoice Value (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(intro.salesInvoices || []).map((invoice, index) => (
                      <tr key={`${invoice.invoiceNo || index}`}>
                        <td className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">{invoice.date || "—"}</td>
                        <td className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">{invoice.invoiceNo || "—"}</td>
                        <td className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">{invoice.recipientGSTIN || "—"}</td>
                        <td className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">{invoice.recipient || "—"}</td>
                        <td className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">{invoice.taxableValue || "—"}</td>
                        <td className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">{invoice.gstRate || "—"}</td>
                        <td className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">{invoice.cgst || "—"}</td>
                        <td className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">{invoice.sgst || "—"}</td>
                        <td className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">{invoice.igst || "—"}</td>
                        <td className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">{invoice.invoiceValue || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">Inward Supply / Purchase Invoice Table (for ITC)</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-left dark:bg-neutral-900">
                      <th className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">Date</th>
                      <th className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">Invoice No.</th>
                      <th className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">Supplier GSTIN</th>
                      <th className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">Supplier Name</th>
                      <th className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">Taxable Value (₹)</th>
                      <th className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">GST Rate</th>
                      <th className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">CGST (₹)</th>
                      <th className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">SGST (₹)</th>
                      <th className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">IGST (₹)</th>
                      <th className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">Invoice Value (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(intro.purchaseInvoices || []).map((invoice, index) => (
                      <tr key={`${invoice.invoiceNo || index}`}>
                        <td className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">{invoice.date || "—"}</td>
                        <td className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">{invoice.invoiceNo || "—"}</td>
                        <td className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">{invoice.supplierGSTIN || "—"}</td>
                        <td className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">{invoice.supplier || "—"}</td>
                        <td className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">{invoice.taxableValue || "—"}</td>
                        <td className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">{invoice.gstRate || "—"}</td>
                        <td className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">{invoice.cgst || "—"}</td>
                        <td className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">{invoice.sgst || "—"}</td>
                        <td className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">{invoice.igst || "—"}</td>
                        <td className="border border-neutral-200 px-2 py-2 dark:border-neutral-800">{invoice.invoiceValue || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="space-y-4 rounded-3xl border border-neutral-200 bg-slate-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Course Topics</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-900/40 dark:bg-emerald-950/20">1. GST_RTN3B_024BFB ✅</li>
                <li className="rounded-2xl border border-primary/20 bg-white px-3 py-2 dark:border-primary/20 dark:bg-neutral-950">2. GST_RTN3B_024BFB ← current</li>
                <li className="rounded-2xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-800 dark:bg-neutral-950">3. GST_RTN3B_024BFC</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground">Portal access</h2>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <p><span className="font-medium text-foreground">User ID:</span> {intro.portalAccess?.userId}</p>
                <p><span className="font-medium text-foreground">Password:</span> {intro.portalAccess?.password}</p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground">Reference calculations</h2>
              <div className="mt-3 space-y-2">
                {intro.keyCalculations?.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-3 text-sm text-primary">
              <div className="font-semibold">Simulated website - For Educational purpose only    Question No: {intro.questionNo}</div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">You are required to file GSTR-1 and GSTR-3B for the period February 2025.</p>
              <div className="rounded-2xl border border-neutral-200 bg-white p-3 text-sm text-muted-foreground dark:border-neutral-800 dark:bg-neutral-950">
                <div className="font-semibold text-foreground">Simulation Portal Login</div>
                <div className="mt-2">User ID: kitchenworld</div>
                <div>Password: Kitchen@65</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 print:hidden">
              <Button variant="outline" onClick={handleDownloadPdf} className="flex-1">
                <FileDown className="mr-2 h-4 w-4" /> Save as PDF
              </Button>
              <Button onClick={onStart} className="flex-1 bg-primary hover:bg-primary/90">
                <PlayCircle className="mr-2 h-4 w-4" /> Start Practical Task
              </Button>
            </div>
          </div>
        </div>

        <details className="rounded-2xl border border-neutral-200 bg-slate-50 p-4 text-sm text-muted-foreground dark:border-neutral-800 dark:bg-neutral-900">
          <summary className="cursor-pointer font-semibold text-foreground">Internal grading key (do not publish)</summary>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between gap-2"><span>Task ID:</span><span className="font-medium text-foreground">GST_RTN3B_024BFB</span></div>
            <div className="flex justify-between gap-2"><span>Period:</span><span className="font-medium text-foreground">February 2025</span></div>
            <div className="flex justify-between gap-2"><span>Output tax:</span><span className="font-medium text-foreground">₹2,80,146</span></div>
            <div className="flex justify-between gap-2"><span>ITC available:</span><span className="font-medium text-foreground">₹1,61,390</span></div>
            <div className="flex justify-between gap-2"><span>Net payable:</span><span className="font-medium text-foreground">₹1,18,756</span></div>
          </div>
        </details>
      </div>
    </Card>
  )
}
