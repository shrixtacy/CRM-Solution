"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Filter, Download, Eye, Printer, Share2, Mail } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { db } from "@/db/supabase-direct"

interface Invoice {
  id: string
  invoice_number: string
  customer_id?: string
  customer_name: string
  customer_email?: string
  customer_phone?: string
  subtotal: number
  tax_amount: number
  total: number
  payment_method: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  created_at: string
  due_date?: string
  notes?: string
  items?: Array<{
    product_name: string
    sku: string
    price: number
    quantity: number
    total: number
  }>
}

export default function InvoiceHistory() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load invoices from Supabase
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true)
        const [invoicesData, invoiceItemsData] = await Promise.all([
          db.getInvoices(),
          db.getAllInvoiceItems()
        ])
        
        // Combine invoices with their items
        const invoicesWithItems = invoicesData.map(invoice => ({
          ...invoice,
          items: invoiceItemsData.filter(item => item.invoice_id === invoice.id)
        }))
        
        setInvoices(invoicesWithItems)
        setFilteredInvoices(invoicesWithItems)
        console.log('📋 Loaded invoices:', invoicesWithItems.length)
      } catch (error) {
        console.error('Error loading invoices:', error)
        toast({
          title: "Error",
          description: "Failed to load invoices",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadInvoices()
  }, [])

  // Filter invoices based on search and filters
  useEffect(() => {
    let filtered = invoices

    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.customer_email && invoice.customer_email.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter)
    }

    if (paymentMethodFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.payment_method === paymentMethodFilter)
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter).toISOString().split('T')[0]
      filtered = filtered.filter(invoice => 
        invoice.created_at.startsWith(filterDate)
      )
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    setFilteredInvoices(filtered)
  }, [invoices, searchTerm, statusFilter, paymentMethodFilter, dateFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>
      case 'sent':
        return <Badge variant="default">Sent</Badge>
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800">Paid</Badge>
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case 'cash':
        return <Badge variant="outline">Cash</Badge>
      case 'upi':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">UPI</Badge>
      case 'card':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Card</Badge>
      case 'bank_transfer':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Bank Transfer</Badge>
      case 'cheque':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Cheque</Badge>
      default:
        return <Badge variant="outline">{method}</Badge>
    }
  }

  const viewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsViewDialogOpen(true)
  }

  const printInvoice = (invoice: Invoice) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${invoice.invoice_number}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .invoice-details { margin-bottom: 30px; }
              .customer-details { margin-bottom: 30px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .total-section { text-align: right; margin-top: 20px; }
              .total-line { margin: 5px 0; }
              .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>INVOICE</h1>
              <h2>${invoice.invoice_number}</h2>
            </div>
            
            <div class="invoice-details">
              <p><strong>Date:</strong> ${format(new Date(invoice.created_at || ''), 'PPP')}</p>
              <p><strong>Due Date:</strong> ${format(new Date(invoice.due_date || ''), 'PPP')}</p>
              <p><strong>Payment Method:</strong> ${invoice.payment_method.toUpperCase()}</p>
            </div>
            
            <div class="customer-details">
              <h3>Bill To:</h3>
              <p><strong>${invoice.customer_name}</strong></p>
              <p>${invoice.customer_email || ''}</p>
              <p>${invoice.customer_phone || ''}</p>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${(invoice.items || []).map(item => `
                  <tr>
                    <td>${item.product_name}</td>
                    <td>${item.sku}</td>
                    <td>₹${item.price.toFixed(2)}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.total.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="total-section">
              <div class="total-line">Subtotal: ₹${invoice.subtotal.toFixed(2)}</div>
              <div class="total-line">GST (18%): ₹${invoice.tax_amount.toFixed(2)}</div>
              <div class="total-line grand-total">Total: ₹${invoice.total.toFixed(2)}</div>
            </div>
            
            ${invoice.notes ? `<div style="margin-top: 30px;"><strong>Notes:</strong> ${invoice.notes}</div>` : ''}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const shareInvoice = (invoice: Invoice) => {
    if (navigator.share) {
      navigator.share({
        title: `Invoice ${invoice.invoice_number}`,
        text: `Invoice ${invoice.invoice_number} - Total: ₹${invoice.total.toFixed(2)} - Customer: ${invoice.customer_name}`
      })
    } else {
      // Fallback for WhatsApp sharing
      const text = `Invoice ${invoice.invoice_number}\nTotal: ₹${invoice.total.toFixed(2)}\nCustomer: ${invoice.customer_name}\nDate: ${format(new Date(invoice.created_at || ''), 'PPP')}`
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
      window.open(whatsappUrl, '_blank')
    }
  }

  const sendInvoiceEmail = async (invoice: Invoice) => {
    try {
      const response = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: invoice.customer_email,
          customerName: invoice.customer_name,
          invoiceNumber: invoice.invoice_number,
          invoiceDate: invoice.created_at,
          dueDate: invoice.due_date,
          items: invoice.items || [],
          subtotal: invoice.subtotal,
          taxAmount: invoice.tax_amount,
          total: invoice.total,
          paymentMethod: invoice.payment_method,
          notes: invoice.notes
        })
      })

      if (response.ok) {
        toast({
          title: "Email Sent",
          description: `Invoice email sent to ${invoice.customer_email}`
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to send email",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error sending email:', error)
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive"
      })
    }
  }

  const exportInvoices = () => {
    const csvContent = [
      ['Invoice Number', 'Customer', 'Date', 'Status', 'Payment Method', 'Subtotal', 'Tax', 'Total'],
      ...filteredInvoices.map(invoice => [
        invoice.invoice_number,
        invoice.customer_name,
        format(new Date(invoice.created_at || ''), 'yyyy-MM-dd'),
        invoice.status,
        invoice.payment_method,
        invoice.subtotal.toFixed(2),
        invoice.tax_amount.toFixed(2),
        invoice.total.toFixed(2)
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoices-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Successful",
      description: "Invoices have been exported to CSV"
    })
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setPaymentMethodFilter('all')
    setDateFilter('')
  }

  const getTotalRevenue = () => {
    return filteredInvoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + invoice.total, 0)
  }

  const getTotalInvoices = () => {
    return filteredInvoices.length
  }

  const getPaidInvoices = () => {
    return filteredInvoices.filter(invoice => invoice.status === 'paid').length
  }

  const getPendingInvoices = () => {
    return filteredInvoices.filter(invoice => invoice.status === 'sent').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Invoice History</h2>
          <p className="text-muted-foreground">View and manage all your invoices</p>
        </div>
        <Button onClick={exportInvoices}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{getTotalInvoices()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Paid Invoices</p>
                <p className="text-2xl font-bold">{getPaidInvoices()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{getPendingInvoices()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₹{getTotalRevenue().toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Invoices</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by invoice number, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-48">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-48">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                      <span className="ml-2">Loading invoices...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No invoices found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invoice.customer_name}</div>
                      <div className="text-sm text-muted-foreground">{invoice.customer_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(invoice.created_at), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>{getPaymentMethodBadge(invoice.payment_method)}</TableCell>
                  <TableCell className="font-bold">₹{invoice.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewInvoice(invoice)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => printInvoice(invoice)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareInvoice(invoice)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendInvoiceEmail(invoice)}
                        title="Send Email"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No invoices found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Invoice Dialog */}
      {selectedInvoice && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Invoice {selectedInvoice.invoice_number}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Bill To:</h3>
                  <p className="font-medium">{selectedInvoice.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedInvoice.customer_email}</p>
                  <p className="text-sm text-muted-foreground">{selectedInvoice.customer_phone}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Invoice Details:</h3>
                  <p className="text-sm">Date: {format(new Date(selectedInvoice.created_at), 'PPP')}</p>
                  <p className="text-sm">Due: {selectedInvoice.due_date ? format(new Date(selectedInvoice.due_date), 'PPP') : 'N/A'}</p>
                  <p className="text-sm">Payment: {selectedInvoice.payment_method.toUpperCase()}</p>
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <h3 className="font-semibold mb-2">Items:</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                        <TableCell>₹{item.price.toFixed(2)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₹{item.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Invoice Summary */}
              <div className="text-right space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span>₹{selectedInvoice.tax_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>₹{selectedInvoice.total.toFixed(2)}</span>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes:</h3>
                  <p className="text-sm text-muted-foreground">{selectedInvoice.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => printInvoice(selectedInvoice)}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" onClick={() => shareInvoice(selectedInvoice)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
