import { Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CreateInvoice from "@/components/sales/create-invoice"
import InvoiceHistory from "@/components/sales/invoice-history"
import PaymentMethods from "@/components/sales/payment-methods"
import TaxSettings from "@/components/sales/tax-settings"
import SalesReports from "@/components/sales/sales-reports"
import { Receipt, History, CreditCard, Calculator, FileText } from "lucide-react"

export default function SalesPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales & Invoicing</h1>
          <p className="text-muted-foreground">Manage sales, create invoices, and track payments</p>
        </div>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Create Invoice
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Invoice History
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Methods
          </TabsTrigger>
          <TabsTrigger value="tax" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Tax Settings
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Suspense fallback={<div>Loading invoice creator...</div>}>
            <CreateInvoice />
          </Suspense>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Suspense fallback={<div>Loading invoice history...</div>}>
            <InvoiceHistory />
          </Suspense>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Suspense fallback={<div>Loading payment methods...</div>}>
            <PaymentMethods />
          </Suspense>
        </TabsContent>

        <TabsContent value="tax" className="space-y-6">
          <Suspense fallback={<div>Loading tax settings...</div>}>
            <TaxSettings />
          </Suspense>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Suspense fallback={<div>Loading reports...</div>}>
            <SalesReports />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
