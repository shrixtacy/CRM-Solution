"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, BarChart3 } from "lucide-react"
import { format, subDays, startOfDay, endOfDay } from "date-fns"

interface Invoice {
  id: string
  invoiceNumber: string
  customer: {
    name: string
    email: string
  }
  items: Array<{
    name: string
    sku: string
    price: number
    quantity: number
    total: number
  }>
  subtotal: number
  taxAmount: number
  total: number
  paymentMethod: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  createdAt: string
  dueDate: string
}

interface SalesData {
  totalRevenue: number
  totalInvoices: number
  averageOrderValue: number
  topProducts: Array<{
    name: string
    sku: string
    quantity: number
    revenue: number
  }>
  topCustomers: Array<{
    name: string
    email: string
    totalSpent: number
    invoiceCount: number
  }>
  paymentMethodBreakdown: Array<{
    method: string
    count: number
    revenue: number
    percentage: number
  }>
  dailySales: Array<{
    date: string
    revenue: number
    invoices: number
  }>
}

export default function SalesAnalytics() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [salesData, setSalesData] = useState<SalesData | null>(null)
  const [timeRange, setTimeRange] = useState('30')
  const [isLoading, setIsLoading] = useState(true)

  // Load invoices from localStorage
  useEffect(() => {
    const savedInvoices = localStorage.getItem('invoices')
    if (savedInvoices) {
      const parsedInvoices = JSON.parse(savedInvoices)
      setInvoices(parsedInvoices)
    }
    setIsLoading(false)
  }, [])

  // Calculate sales data based on time range
  useEffect(() => {
    if (invoices.length === 0) {
      setSalesData(null)
      return
    }

    const days = parseInt(timeRange)
    const startDate = startOfDay(subDays(new Date(), days))
    const endDate = endOfDay(new Date())

    const filteredInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.createdAt)
      return invoiceDate >= startDate && invoiceDate <= endDate
    })

    const paidInvoices = filteredInvoices.filter(invoice => invoice.status === 'paid')
    
    // Calculate total revenue
    const totalRevenue = paidInvoices.reduce((sum, invoice) => sum + invoice.total, 0)
    
    // Calculate total invoices
    const totalInvoices = filteredInvoices.length
    
    // Calculate average order value
    const averageOrderValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0

    // Calculate top products
    const productMap = new Map()
    paidInvoices.forEach(invoice => {
      invoice.items.forEach(item => {
        const key = `${item.name}-${item.sku}`
        if (productMap.has(key)) {
          const existing = productMap.get(key)
          productMap.set(key, {
            name: item.name,
            sku: item.sku,
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + item.total
          })
        } else {
          productMap.set(key, {
            name: item.name,
            sku: item.sku,
            quantity: item.quantity,
            revenue: item.total
          })
        }
      })
    })

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Calculate top customers
    const customerMap = new Map()
    paidInvoices.forEach(invoice => {
      const key = invoice.customer.email
      if (customerMap.has(key)) {
        const existing = customerMap.get(key)
        customerMap.set(key, {
          name: invoice.customer.name,
          email: invoice.customer.email,
          totalSpent: existing.totalSpent + invoice.total,
          invoiceCount: existing.invoiceCount + 1
        })
      } else {
        customerMap.set(key, {
          name: invoice.customer.name,
          email: invoice.customer.email,
          totalSpent: invoice.total,
          invoiceCount: 1
        })
      }
    })

    const topCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)

    // Calculate payment method breakdown
    const paymentMap = new Map()
    paidInvoices.forEach(invoice => {
      const method = invoice.paymentMethod
      if (paymentMap.has(method)) {
        const existing = paymentMap.get(method)
        paymentMap.set(method, {
          method: method,
          count: existing.count + 1,
          revenue: existing.revenue + invoice.total
        })
      } else {
        paymentMap.set(method, {
          method: method,
          count: 1,
          revenue: invoice.total
        })
      }
    })

    const paymentMethodBreakdown = Array.from(paymentMap.values()).map(item => ({
      ...item,
      percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0
    }))

    // Calculate daily sales
    const dailySalesMap = new Map()
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), i)
      const dateKey = format(date, 'yyyy-MM-dd')
      dailySalesMap.set(dateKey, {
        date: dateKey,
        revenue: 0,
        invoices: 0
      })
    }

    paidInvoices.forEach(invoice => {
      const dateKey = format(new Date(invoice.createdAt), 'yyyy-MM-dd')
      if (dailySalesMap.has(dateKey)) {
        const existing = dailySalesMap.get(dateKey)
        dailySalesMap.set(dateKey, {
          date: dateKey,
          revenue: existing.revenue + invoice.total,
          invoices: existing.invoices + 1
        })
      }
    })

    const dailySales = Array.from(dailySalesMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    setSalesData({
      totalRevenue,
      totalInvoices,
      averageOrderValue,
      topProducts,
      topCustomers,
      paymentMethodBreakdown,
      dailySales
    })
  }, [invoices, timeRange])

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'cash': return 'Cash'
      case 'upi': return 'UPI'
      case 'card': return 'Card'
      case 'bank_transfer': return 'Bank Transfer'
      case 'cheque': return 'Cheque'
      default: return method
    }
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-800'
      case 'upi': return 'bg-blue-100 text-blue-800'
      case 'card': return 'bg-purple-100 text-purple-800'
      case 'bank_transfer': return 'bg-yellow-100 text-yellow-800'
      case 'cheque': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!salesData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No sales data available</p>
          <p className="text-sm">Create some invoices to see analytics</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sales Analytics</h2>
          <p className="text-muted-foreground">Comprehensive sales insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Time Range:</span>
          <Select value={timeRange} onValueChange={setTimeRange}>
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
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₹{salesData.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{salesData.totalInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold">₹{salesData.averageOrderValue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Unique Customers</p>
                <p className="text-2xl font-bold">{salesData.topCustomers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {salesData.topProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData.topProducts.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.sku}</div>
                        </div>
                      </TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell className="font-bold">₹{product.revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No product data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {salesData.topCustomers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Invoices</TableHead>
                    <TableHead>Total Spent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData.topCustomers.map((customer, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{customer.invoiceCount}</TableCell>
                      <TableCell className="font-bold">₹{customer.totalSpent.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No customer data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {salesData.paymentMethodBreakdown.length > 0 ? (
            <div className="space-y-4">
              {salesData.paymentMethodBreakdown.map((method, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getPaymentMethodColor(method.method)}>
                      {getPaymentMethodName(method.method)}
                    </Badge>
                    <div>
                      <div className="font-medium">{method.count} transactions</div>
                      <div className="text-sm text-muted-foreground">
                        {method.percentage.toFixed(1)}% of total revenue
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₹{method.revenue.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Revenue</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No payment method data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Sales Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {salesData.dailySales.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoices</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesData.dailySales.slice(-10).reverse().map((day, index) => {
                  const previousDay = salesData.dailySales[salesData.dailySales.length - index - 2]
                  const trend = previousDay ? day.revenue - previousDay.revenue : 0
                  
                  return (
                    <TableRow key={index}>
                      <TableCell>{format(new Date(day.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{day.invoices}</TableCell>
                      <TableCell className="font-bold">₹{day.revenue.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {trend > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : trend < 0 ? (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          ) : null}
                          <span className={`text-sm ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                            {trend > 0 ? '+' : ''}₹{trend.toFixed(2)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No daily sales data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
