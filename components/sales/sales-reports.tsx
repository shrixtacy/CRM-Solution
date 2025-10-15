"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { 
  Download, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  
  Users, 
  BarChart3,
  Activity
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "@/hooks/use-toast"
import { db } from "@/db/supabase-direct"

interface ProductSales {
  name: string
  quantity: number
  revenue: number
}

interface InvoiceItem {
  product_name: string
  quantity: number
  total: number
}

interface ReportData {
  totalRevenue: number
  totalInvoices: number
  totalCustomers: number
  avgOrderValue: number
  topProducts: Array<{
    name: string
    quantity: number
    revenue: number
  }>
  recentInvoices: Array<{
    id: string
    invoice_number: string
    customer_name: string
    total: number
    created_at: string
    status: string
  }>
  monthlyRevenue: Array<{
    month: string
    revenue: number
  }>
}

export default function SalesReports() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')

  const loadReportData = useCallback(async () => {
    try {
      setLoading(true)
      const [invoices, invoiceItems, customers] = await Promise.all([
        db.getInvoices(),
        db.getAllInvoiceItems(),
        db.getCustomers()
      ])

      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(dateRange))

      // Filter invoices by date range
      const filteredInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.created_at)
        return invoiceDate >= startDate && invoiceDate <= endDate
      })

      // Calculate metrics
      const totalRevenue = filteredInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0)
      const totalInvoices = filteredInvoices.length
      const totalCustomers = customers.length
      const avgOrderValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0

      // Top products
      const productSales = invoiceItems.reduce((acc: ProductSales[], item: InvoiceItem) => {
        const existing = acc.find((p: ProductSales) => p.name === item.product_name)
        if (existing) {
          existing.quantity += item.quantity
          existing.revenue += item.total
        } else {
          acc.push({
            name: item.product_name,
            quantity: item.quantity,
            revenue: item.total
          })
        }
        return acc
      }, [] as Array<{ name: string; quantity: number; revenue: number }>)

      const topProducts = productSales
        .sort((a: ProductSales, b: ProductSales) => b.revenue - a.revenue)
        .slice(0, 5)

      // Recent invoices
      const recentInvoices = filteredInvoices
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)

      // Monthly revenue (last 6 months)
      const monthlyRevenue = []
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date()
        monthDate.setMonth(monthDate.getMonth() - i)
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
        
        const monthInvoices = invoices.filter(invoice => {
          const invoiceDate = new Date(invoice.created_at)
          return invoiceDate >= monthStart && invoiceDate <= monthEnd
        })
        
        const monthRevenue = monthInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0)
        
        monthlyRevenue.push({
          month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
          revenue: monthRevenue
        })
      }

      setReportData({
        totalRevenue,
        totalInvoices,
        totalCustomers,
        avgOrderValue,
        topProducts,
        recentInvoices,
        monthlyRevenue
      })
    } catch (error) {
      console.error('Error loading report data:', error)
      toast({
        title: "Error",
        description: "Failed to load report data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    loadReportData()
  }, [loadReportData])

  const exportReport = () => {
    if (!reportData) return

    const csvContent = [
      ['Sales Report', `Generated: ${new Date().toLocaleDateString()}`],
      [''],
      ['Summary'],
      ['Total Revenue', `₹${reportData.totalRevenue.toFixed(2)}`],
      ['Total Invoices', reportData.totalInvoices.toString()],
      ['Total Customers', reportData.totalCustomers.toString()],
      ['Average Order Value', `₹${reportData.avgOrderValue.toFixed(2)}`],
      [''],
      ['Top Products'],
      ['Product', 'Quantity Sold', 'Revenue'],
      ...reportData.topProducts.map(product => [
        product.name,
        product.quantity.toString(),
        `₹${product.revenue.toFixed(2)}`
      ])
    ]

    const csv = csvContent.map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Report Exported",
      description: "Sales report has been downloaded"
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading report data...</span>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
        <p className="text-gray-500">No sales data found for the selected period.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Sales Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="dateRange">Date Range:</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={exportReport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">₹{reportData.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Invoices</p>
                <p className="text-2xl font-bold text-blue-600">{reportData.totalInvoices}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Customers</p>
                <p className="text-2xl font-bold text-purple-600">{reportData.totalCustomers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Order Value</p>
                <p className="text-2xl font-bold text-orange-600">₹{reportData.avgOrderValue.toLocaleString()}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.quantity} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">₹{product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.monthlyRevenue.map((month, index) => {
                const maxRevenue = Math.max(...reportData.monthlyRevenue.map(m => m.revenue))
                const percentage = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{month.month}</span>
                      <span className="font-medium">₹{month.revenue.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.recentInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>{invoice.customer_name}</TableCell>
                  <TableCell>{format(new Date(invoice.created_at), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">₹{invoice.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
