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

export default function GSTInvoicing({ scenario, onSubmit, initialResponses }: Props) {
  const [startTime] = useState(Date.now())
  const [formData, setFormData] = useState(initialResponses || {
    invoiceNo: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    invoiceDate: new Date().toISOString().split("T")[0],
    sellerName: scenario.sellerName,
    sellerGSTIN: scenario.sellerGSTIN,
    sellerAddress: scenario.sellerAddress,
    sellerState: scenario.sellerState,
    buyerName: scenario.buyerName,
    buyerGSTIN: scenario.buyerGSTIN,
    buyerAddress: scenario.buyerAddress,
    buyerState: scenario.buyerState,
    product: scenario.product,
    hsnCode: scenario.hsnCode,
    quantity: scenario.quantity,
    rate: scenario.rate,
    taxableValue: 0,
    gstRate: scenario.gstRate,
    supplyType: scenario.supplyType,
    cgst: 0,
    sgst: 0,
    igst: 0,
    totalAmount: 0,
    placeOfSupply: scenario.placeOfSupply,
  })

  const handleCalculate = () => {
    const taxableValue = formData.quantity * formData.rate
    const isInterstate = formData.supplyType === "Interstate"
    const cgst = isInterstate ? 0 : Math.round(taxableValue * (formData.gstRate / 2) / 100)
    const sgst = isInterstate ? 0 : Math.round(taxableValue * (formData.gstRate / 2) / 100)
    const igst = isInterstate ? Math.round(taxableValue * formData.gstRate / 100) : 0
    const totalAmount = taxableValue + cgst + sgst + igst

    setFormData((prev: any) => ({
      ...prev,
      taxableValue,
      cgst,
      sgst,
      igst,
      totalAmount,
    }))

    toast({ title: "Calculations updated!" })
  }

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    if (!formData.taxableValue || !formData.totalAmount) {
      toast({ title: "Please compute/calculate the totals first", variant: "destructive" })
      return
    }
    onSubmit(formData, timeSpent)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-neutral-200 bg-slate-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="text-lg font-semibold text-foreground mb-4">Billing Instruction Scenario</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <p><strong>Seller Company:</strong> {scenario.sellerName}</p>
            <p><strong>Seller GSTIN:</strong> {scenario.sellerGSTIN} ({scenario.sellerState})</p>
            <p><strong>Buyer Company:</strong> {scenario.buyerName}</p>
            <p><strong>Buyer GSTIN:</strong> {scenario.buyerGSTIN} ({scenario.buyerState})</p>
          </div>
          <div>
            <p><strong>Product Category:</strong> {scenario.product} (HSN: {scenario.hsnCode})</p>
            <p><strong>Quantity:</strong> {scenario.quantity} units</p>
            <p><strong>Unit Price:</strong> ₹{scenario.rate.toLocaleString()}</p>
            <p><strong>GST Tax Rate:</strong> {scenario.gstRate}%</p>
          </div>
        </div>
      </div>

      <Card className="p-6 border border-neutral-200 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="border-b border-border pb-4 mb-6 flex justify-between items-center">
          <h3 className="text-xl font-bold text-foreground">Tax Invoice</h3>
          <span className="text-xs uppercase tracking-wider bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
            {formData.supplyType}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">Invoice Number *</label>
            <Input
              value={formData.invoiceNo}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, invoiceNo: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">Invoice Date *</label>
            <Input
              type="date"
              value={formData.invoiceDate}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, invoiceDate: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">Place of Supply *</label>
            <Input
              value={formData.placeOfSupply}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, placeOfSupply: e.target.value }))}
              className="mt-1"
            />
          </div>
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-slate-50 dark:bg-neutral-900 text-muted-foreground font-semibold">
                <th className="p-3">Description</th>
                <th className="p-3">HSN Code</th>
                <th className="p-3 text-right">Qty</th>
                <th className="p-3 text-right">Rate (₹)</th>
                <th className="p-3 text-right">Taxable Value (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="p-3">
                  <Input
                    value={formData.product}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, product: e.target.value }))}
                    className="h-9"
                  />
                </td>
                <td className="p-3">
                  <Input
                    value={formData.hsnCode}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, hsnCode: e.target.value }))}
                    className="h-9 w-28"
                  />
                </td>
                <td className="p-3 text-right">
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, quantity: Number(e.target.value) }))}
                    className="h-9 w-20 text-right ml-auto"
                  />
                </td>
                <td className="p-3 text-right">
                  <Input
                    type="number"
                    value={formData.rate}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, rate: Number(e.target.value) }))}
                    className="h-9 w-28 text-right ml-auto"
                  />
                </td>
                <td className="p-3 text-right font-medium">
                  ₹{formData.taxableValue.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="space-y-4">
            <Button onClick={handleCalculate} variant="outline" className="w-full">
              Compute Tax Fields
            </Button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Taxable Value:</span>
              <span className="font-semibold">₹{formData.taxableValue.toLocaleString()}</span>
            </div>
            {formData.supplyType !== "Interstate" ? (
              <>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">CGST ({formData.gstRate / 2}%):</span>
                  <span className="font-semibold">₹{formData.cgst.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">SGST ({formData.gstRate / 2}%):</span>
                  <span className="font-semibold">₹{formData.sgst.toLocaleString()}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">IGST ({formData.gstRate}%):</span>
                <span className="font-semibold">₹{formData.igst.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold pt-2 text-primary">
              <span>Total Invoice Amount:</span>
              <span>₹{formData.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/90">
            Submit Invoice to ERP
          </Button>
        </div>
      </Card>
    </div>
  )
}
