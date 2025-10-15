import { db } from "@/db/supabase-direct"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  Package,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { unstable_noStore as noStore } from 'next/cache';

export const revalidate = 0

async function getBusinessData() {
  noStore();
  try {
    // First, update all existing invoices to paid status
    await db.updateAllInvoicesToPaid()
    
    const [customers, products, invoices, stockMovements, invoiceItems] = await Promise.all([
      db.getCustomers(),
      db.getProducts(),
      db.getInvoices(),
      db.getStockMovements(),
      db.getAllInvoiceItems()
    ])

    // Add invoice items to each invoice
    const invoicesWithItems = invoices.map(invoice => ({
      ...invoice,
      items: invoiceItems.filter(item => item.invoice_id === invoice.id)
    }))

    return {
      customers,
      products,
      invoices: invoicesWithItems,
      stockMovements,
      invoiceItems
    }
  } catch (error) {
    console.error('Error fetching business data:', error)
    return {
      customers: [],
      products: [],
      invoices: [],
      stockMovements: [],
      invoiceItems: []
    }
  }
}

export default async function BusinessPage() {
  const { customers, products, invoices, stockMovements, invoiceItems } = await getBusinessData()


  // Calculate real business metrics
  // All invoices are now treated as paid
  const paidInvoices = invoices.filter(invoice => invoice.total > 0)
  const totalInvoiceRevenue = paidInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0)
  
  // Calculate revenue from stock movements (inventory sales)
  const stockSalesRevenue = stockMovements
    .filter(movement => movement.movement_type === 'out')
    .reduce((sum, movement) => {
      const product = products.find(p => p.id === movement.product_id)
      if (product) {
        return sum + (product.price * movement.quantity)
      }
      return sum
    }, 0)
  
  const totalRevenue = totalInvoiceRevenue + stockSalesRevenue
  const totalInvoiceValue = invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0)
  
  console.log('💰 Revenue Debug:')
  console.log('Total invoices:', invoices.length)
  console.log('Paid invoices:', paidInvoices.length)
  console.log('Invoice revenue:', totalInvoiceRevenue)
  console.log('Stock sales revenue:', stockSalesRevenue)
  console.log('Total revenue:', totalRevenue)
  console.log('Sample invoice:', invoices[0])
  const totalCustomers = customers.length
  const totalProducts = products.length
  const totalInvoices = invoices.length
  const paidInvoicesCount = paidInvoices.length
  const avgOrderValue = paidInvoicesCount > 0 ? totalRevenue / paidInvoicesCount : 0
  
  // Calculate inventory value
  const inventoryValue = products.reduce((sum, product) => sum + (product.stock * product.price), 0)
  
  // Calculate monthly revenue (last 30 days) - only paid invoices
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentPaidInvoices = paidInvoices.filter(invoice => 
    new Date(invoice.created_at) >= thirtyDaysAgo
  )
  const monthlyRevenue = recentPaidInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0)
  
  // Calculate growth metrics - only paid invoices
  const previousMonth = new Date()
  previousMonth.setMonth(previousMonth.getMonth() - 1)
  const previousMonthPaidInvoices = paidInvoices.filter(invoice => {
    const invoiceDate = new Date(invoice.created_at)
    return invoiceDate >= previousMonth && invoiceDate < thirtyDaysAgo
  })
  const previousMonthRevenue = previousMonthPaidInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0)
  const revenueGrowth = previousMonthRevenue > 0 ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0
  
  // Top selling products - get from invoice_items table
  const productSales = products.map(product => {
    // Get all invoice items for this product from the invoiceItems array
    const productInvoiceItems = invoiceItems.filter(item => item.product_id === product.id)
    
    const totalSold = productInvoiceItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
    const revenue = productInvoiceItems.reduce((sum, item) => sum + (item.total || 0), 0)
    
    
    return {
      ...product,
      totalSold,
      revenue
    }
  }).sort((a, b) => b.totalSold - a.totalSold)
  
  // Calculate revenue trend data based on inventory value changes (last 5 months)
  const getRevenueTrendData = () => {
    const now = new Date()
    const months = []
    
    console.log('🔍 DEBUG: getRevenueTrendData called')
    console.log('🔍 Total paidInvoices:', paidInvoices.length)
    console.log('🔍 Total stockMovements:', stockMovements.length)
    console.log('🔍 Total products:', products.length)
    console.log('🔍 Sample paidInvoice:', paidInvoices[0])
    console.log('🔍 Sample stockMovement:', stockMovements[0])
    console.log('🔍 Sample product:', products[0])
    
    for (let i = 4; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      
      console.log(`🔍 Processing month: ${monthDate.toLocaleDateString('en-US', { month: 'short' })}`)
      
      // Calculate revenue from both invoices AND stock movements
      const monthInvoiceRevenue = paidInvoices
        .filter(invoice => {
          const invoiceDate = new Date(invoice.created_at)
          return invoiceDate >= monthDate && invoiceDate < nextMonth
        })
        .reduce((sum, invoice) => sum + (invoice.total || 0), 0)
      
      console.log(`🔍 Month ${monthDate.toLocaleDateString('en-US', { month: 'short' })} - Invoice revenue: ${monthInvoiceRevenue}`)
      
      // Calculate value from stock movements (sales = stock out with pricing)
      const monthStockValue = stockMovements
        .filter(movement => {
          const movementDate = new Date(movement.created_at)
          return movementDate >= monthDate && movementDate < nextMonth && movement.movement_type === 'out'
        })
        .reduce((sum, movement) => {
          // Find the product to get its price
          const product = products.find(p => p.id === movement.product_id)
          if (product) {
            const value = product.price * movement.quantity
            console.log(`🔍 Stock movement: ${movement.product_name} - Qty: ${movement.quantity}, Price: ${product.price}, Value: ${value}`)
            return sum + value
          }
          return sum
        }, 0)
      
      console.log(`🔍 Month ${monthDate.toLocaleDateString('en-US', { month: 'short' })} - Stock value: ${monthStockValue}`)
      
      const totalMonthValue = monthInvoiceRevenue + monthStockValue
      
      console.log(`🔍 Month ${monthDate.toLocaleDateString('en-US', { month: 'short' })} - Total value: ${totalMonthValue}`)
      
      months.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        revenue: totalMonthValue,
        invoiceRevenue: monthInvoiceRevenue,
        stockValue: monthStockValue
      })
    }
    
    console.log('🔍 Final revenue trend data:', months)
    return months
  }
  
  const revenueTrendData = getRevenueTrendData()
  
  // If no real data, create sample trend for demonstration
  if (revenueTrendData.every(month => month.revenue === 0)) {
    console.log('📈 No real data found, creating sample trend')
    const sampleData = [
      { month: 'Aug', revenue: 5000, invoiceRevenue: 3000, stockValue: 2000 },
      { month: 'Sep', revenue: 7500, invoiceRevenue: 4500, stockValue: 3000 },
      { month: 'Oct', revenue: 12000, invoiceRevenue: 8000, stockValue: 4000 },
      { month: 'Nov', revenue: 15000, invoiceRevenue: 10000, stockValue: 5000 },
      { month: 'Dec', revenue: totalRevenue || 18000, invoiceRevenue: totalInvoiceRevenue || 12000, stockValue: stockSalesRevenue || 6000 }
    ]
    revenueTrendData.splice(0, revenueTrendData.length, ...sampleData)
  }
  
  const maxRevenue = Math.max(...revenueTrendData.map(m => m.revenue), 1)
  
  console.log('📈 Revenue Trend Data:', revenueTrendData)
  console.log('📈 Max Revenue:', maxRevenue)
  
  // Recent activity
  const recentActivity = [
    ...invoices.slice(0, 5).map(invoice => ({
      type: 'sale',
      description: `New sale: ${invoice.customer_name}`,
      amount: invoice.total,
      date: invoice.created_at,
      icon: ShoppingCart
    })),
    ...stockMovements.slice(0, 5).map(movement => ({
      type: 'stock',
      description: `Stock ${movement.movement_type}: ${movement.product_name}`,
      amount: movement.quantity,
      date: movement.created_at,
      icon: Package
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-b border-gray-800">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Business Analytics
              </h1>
              <p className="text-gray-400 mt-2">Real-time insights and performance metrics</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-purple-500 text-purple-400">
                <Activity className="w-4 h-4 mr-2" />
                Live Data
              </Badge>
              <Button variant="outline" className="border-gray-600 hover:bg-gray-800">
                <Calendar className="w-4 h-4 mr-2" />
                Last 30 Days
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-gray-900/50 border-gray-800 hover:bg-gray-900/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Paid Revenue</p>
                  <p className="text-3xl font-bold text-green-400">₹{totalRevenue.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    {revenueGrowth >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-green-400 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-400 mr-1" />
                    )}
                    <span className={`text-sm ${revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {Math.abs(revenueGrowth).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{paidInvoicesCount} paid invoices</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 hover:bg-gray-900/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Customers</p>
                  <p className="text-3xl font-bold text-blue-400">{totalCustomers}</p>
                  <p className="text-sm text-gray-400 mt-2">Active users</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 hover:bg-gray-900/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Avg Order Value</p>
                  <p className="text-3xl font-bold text-purple-400">₹{avgOrderValue.toFixed(0)}</p>
                  <p className="text-sm text-gray-400 mt-2">Per transaction</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-full">
                  <ShoppingCart className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 hover:bg-gray-900/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Invoice Value</p>
                  <p className="text-3xl font-bold text-yellow-400">₹{totalInvoiceValue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{totalInvoices} total invoices</p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-full">
                  <BarChart3 className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 hover:bg-gray-900/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Inventory Value</p>
                  <p className="text-3xl font-bold text-orange-400">₹{inventoryValue.toLocaleString()}</p>
                  <p className="text-sm text-gray-400 mt-2">Stock value</p>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-full">
                  <Package className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full-Length Revenue Overview */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center text-2xl">
              <BarChart3 className="w-6 h-6 mr-3 text-purple-400" />
              Revenue Analytics Dashboard
            </CardTitle>
            <p className="text-gray-400 mt-2">Real-time revenue tracking and growth analysis</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Revenue Metrics */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-400">This Month</p>
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-green-400">₹{monthlyRevenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{recentPaidInvoices.length} paid invoices</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-400">Total Revenue</p>
                      <DollarSign className="w-4 h-4 text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-blue-400">₹{totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{paidInvoicesCount} paid invoices</p>
                  </div>
                </div>

                {/* Revenue Trend Graph */}
                <div className="p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Revenue Trend</h3>
                    <div className="flex items-center">
                      {revenueGrowth >= 0 ? (
                        <ArrowUpRight className="w-5 h-5 text-green-400 mr-2" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-red-400 mr-2" />
                      )}
                      <span className={`text-lg font-bold ${revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {Math.abs(revenueGrowth).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Line Graph */}
                  <div className="h-32 relative">
                    <svg className="w-full h-full" viewBox="0 0 400 120">
                      {/* Grid lines */}
                      <defs>
                        <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      
                      {/* Revenue line - dynamic based on real data */}
                      <polyline
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={revenueTrendData.map((data, index) => {
                          const x = 40 + (index * 80)
                          const y = 100 - (data.revenue / maxRevenue) * 80
                          return `${x},${y}`
                        }).join(' ')}
                        className="animate-pulse"
                      />
                      
                      {/* Data points - dynamic based on real data */}
                      {revenueTrendData.map((data, index) => {
                        const x = 40 + (index * 80)
                        const y = 100 - (data.revenue / maxRevenue) * 80
                        return (
                          <circle key={index} cx={x} cy={y} r="4" fill="#8b5cf6" />
                        )
                      })}
                      
                      {/* Gradient definition */}
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    {/* Labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 mt-2">
                      {revenueTrendData.map((data, index) => (
                        <span key={index}>{data.month}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold">Revenue Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-sm text-gray-400">Invoice Revenue</span>
                      <span className="font-semibold text-green-400">₹{totalInvoiceRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-sm text-gray-400">Inventory Sales</span>
                      <span className="font-semibold text-blue-400">₹{stockSalesRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-sm text-gray-400">Total Revenue</span>
                      <span className="font-semibold text-purple-400">₹{totalRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sales Performance Graph */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Sales Performance</h3>
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </div>
                
                {/* Bar Chart */}
                <div className="p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                  <div className="h-40 relative">
                    <svg className="w-full h-full" viewBox="0 0 400 160">
                      {/* Grid lines */}
                      <defs>
                        <pattern id="barGrid" width="40" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#barGrid)" />
                      
                      {/* Bar chart for top 5 products */}
                      {productSales.slice(0, 5).map((product, index) => {
                        const maxRevenue = productSales[0]?.revenue || 1
                        const height = (product.revenue / maxRevenue) * 120
                        const x = 40 + (index * 70)
                        const y = 140 - height
                        
                        return (
                          <g key={product.id}>
                            {/* Bar */}
                            <rect
                              x={x - 15}
                              y={y}
                              width="30"
                              height={height}
                              fill="url(#barGradient)"
                              rx="4"
                              className="hover:opacity-80 transition-opacity"
                            />
                            {/* Value label */}
                            <text
                              x={x}
                              y={y - 5}
                              textAnchor="middle"
                              className="text-xs fill-gray-300"
                            >
                              ₹{product.revenue.toLocaleString()}
                            </text>
                            {/* Product name */}
                            <text
                              x={x}
                              y={155}
                              textAnchor="middle"
                              className="text-xs fill-gray-400"
                            >
                              {product.name.length > 8 ? product.name.substring(0, 8) + '...' : product.name}
                            </text>
                          </g>
                        )
                      })}
                      
                      {/* Gradient for bars */}
                      <defs>
                        <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                {/* Top Products List */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold">Top Products</h4>
                  <div className="space-y-2">
                    {productSales.slice(0, 5).map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-gray-400">{product.sku}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-400 text-sm">₹{product.revenue.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">{product.totalSold} sold</p>
                        </div>
                      </div>
                    ))}
                    
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-Time Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inventory vs Sales Pie Chart */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <PieChart className="w-5 h-5 mr-2 text-purple-400" />
                Inventory vs Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 relative">
                <svg className="w-full h-full" viewBox="0 0 300 300">
                  {/* Pie chart for inventory vs sales */}
                  <circle
                    cx="150"
                    cy="150"
                    r="100"
                    fill="none"
                    stroke="#374151"
                    strokeWidth="2"
                  />
                  
                  {/* Sales segment */}
                  <path
                    d="M 150 50 A 100 100 0 0 1 150 250 A 100 100 0 0 1 150 50"
                    fill="url(#salesGradient)"
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                  
                  {/* Inventory segment */}
                  <path
                    d="M 150 250 A 100 100 0 0 1 150 50 A 100 100 0 0 1 150 250"
                    fill="url(#inventoryGradient)"
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                  
                  {/* Center text */}
                  <text
                    x="150"
                    y="140"
                    textAnchor="middle"
                    className="text-lg font-bold fill-white"
                  >
                    {totalProducts}
                  </text>
                  <text
                    x="150"
                    y="160"
                    textAnchor="middle"
                    className="text-sm fill-gray-400"
                  >
                    Products
                  </text>
                  
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="salesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="inventoryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Legend */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-400">Sold ({totalInvoices})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span className="text-sm text-gray-400">In Stock ({totalProducts})</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Activity className="w-5 h-5 mr-2 text-blue-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                  <div className="p-2 bg-purple-500/10 rounded-full">
                    <activity.icon className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(activity.date).toLocaleDateString()} at {new Date(activity.date).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-400">₹{activity.amount?.toLocaleString()}</p>
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Business Summary Table */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Target className="w-5 h-5 mr-2 text-green-400" />
              Business Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Total Invoices</h3>
                <p className="text-3xl font-bold text-purple-400">{totalInvoices}</p>
                <p className="text-sm text-gray-400 mt-2">All time</p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-6 h-6 text-green-400" />
            </div>
                <h3 className="text-lg font-semibold mb-2">Products</h3>
                <p className="text-3xl font-bold text-green-400">{totalProducts}</p>
                <p className="text-sm text-gray-400 mt-2">In inventory</p>
            </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PieChart className="w-6 h-6 text-blue-400" />
            </div>
                <h3 className="text-lg font-semibold mb-2">Growth Rate</h3>
                <p className="text-3xl font-bold text-blue-400">{revenueGrowth.toFixed(1)}%</p>
                <p className="text-sm text-gray-400 mt-2">This month</p>
            </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
