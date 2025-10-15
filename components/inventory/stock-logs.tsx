"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TrendingUp, TrendingDown, Package, Search, Filter, Calendar as CalendarIcon, Download } from "lucide-react"
import { format } from "date-fns"
import { toast } from "@/hooks/use-toast"
import { db } from "@/db/supabase-direct"

interface StockMovement {
  id: string
  product_id: string
  product_name: string
  sku: string
  movement_type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason: string
  notes: string
  created_at: string
  user_id: string
  previous_stock: number
  new_stock: number
  // Legacy fields for backward compatibility
  productId?: string
  productName?: string
  type?: 'in' | 'out' | 'adjustment'
  timestamp?: string
  userId?: string
  previousStock?: number
  newStock?: number
}

interface Product {
  id: string
  name: string
  sku: string
}

export default function StockLogs() {
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const [filteredMovements, setFilteredMovements] = useState<StockMovement[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState<Date | undefined>()
  const [productFilter, setProductFilter] = useState('all')

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        const [movementsData, productsData] = await Promise.all([
          db.getStockMovements(),
          db.getProducts()
        ])
        setStockMovements(movementsData)
        setProducts(productsData)
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Error",
          description: "Failed to load stock data",
          variant: "destructive"
        })
      }
    }
    loadData()
  }, [])

  // Filter movements based on search and filters
  useEffect(() => {
    let filtered = stockMovements

    if (searchTerm) {
      filtered = filtered.filter(movement =>
        movement.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(movement => (movement.movement_type || movement.type) === typeFilter)
    }

    if (productFilter !== 'all') {
      filtered = filtered.filter(movement => (movement.product_id || movement.productId) === productFilter)
    }

    if (dateFilter) {
      const filterDate = format(dateFilter, 'yyyy-MM-dd')
      filtered = filtered.filter(movement =>
        (movement.created_at || movement.timestamp)?.startsWith(filterDate)
      )
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.created_at || b.timestamp || '').getTime() - new Date(a.created_at || a.timestamp || '').getTime())

    setFilteredMovements(filtered)
  }, [stockMovements, searchTerm, typeFilter, dateFilter, productFilter])

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'out':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Package className="h-4 w-4 text-blue-600" />
    }
  }

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'in':
        return 'text-green-600'
      case 'out':
        return 'text-red-600'
      default:
        return 'text-blue-600'
    }
  }

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'in':
        return <Badge variant="default" className="bg-green-100 text-green-800">Stock In</Badge>
      case 'out':
        return <Badge variant="destructive">Stock Out</Badge>
      default:
        return <Badge variant="outline">Adjustment</Badge>
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Product', 'SKU', 'Type', 'Quantity', 'Previous Stock', 'New Stock', 'Reason', 'Notes'],
      ...filteredMovements.map(movement => [
        format(new Date(movement.created_at || movement.timestamp || ''), 'yyyy-MM-dd HH:mm:ss'),
        movement.product_name || movement.productName || '',
        movement.sku || '',
        (movement.movement_type || movement.type || '').toUpperCase(),
        movement.quantity?.toString() || '0',
        (movement.previous_stock || movement.previousStock)?.toString() || '0',
        (movement.new_stock || movement.newStock)?.toString() || '0',
        movement.reason || '',
        movement.notes || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stock-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Successful",
      description: "Stock logs have been exported to CSV"
    })
  }

  const clearFilters = () => {
    setSearchTerm('')
    setTypeFilter('all')
    setDateFilter(undefined)
    setProductFilter('all')
  }

  const getTotalMovements = () => {
    const totalIn = filteredMovements
      .filter(m => m.type === 'in')
      .reduce((sum, m) => sum + m.quantity, 0)
    
    const totalOut = filteredMovements
      .filter(m => m.type === 'out')
      .reduce((sum, m) => sum + m.quantity, 0)
    
    return { totalIn, totalOut, totalMovements: filteredMovements.length }
  }

  const totals = getTotalMovements()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Stock Movement Logs</h2>
          <p className="text-muted-foreground">Track all inventory movements and changes</p>
        </div>
        <Button onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Movements</p>
                <p className="text-2xl font-bold">{totals.totalMovements}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Stock In</p>
                <p className="text-2xl font-bold">{totals.totalIn}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Stock Out</p>
                <p className="text-2xl font-bold">{totals.totalOut}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Net Change</p>
                <p className={`text-2xl font-bold ${totals.totalIn - totals.totalOut >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totals.totalIn - totals.totalOut >= 0 ? '+' : ''}{totals.totalIn - totals.totalOut}
                </p>
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
              <Label htmlFor="search">Search Logs</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by product, SKU, reason, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <Label htmlFor="type">Movement Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="in">Stock In</SelectItem>
                  <SelectItem value="out">Stock Out</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-48">
              <Label htmlFor="product">Product</Label>
              <Select value={productFilter} onValueChange={setProductFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-48">
              <Label>Date Filter</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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

      {/* Stock Movements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Movement History ({filteredMovements.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Stock Change</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {format(new Date(movement.created_at || movement.timestamp || ''), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(movement.created_at || movement.timestamp || ''), 'HH:mm:ss')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{movement.product_name || movement.productName}</div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {movement.sku}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getMovementIcon(movement.movement_type || movement.type)}
                      {getMovementBadge(movement.movement_type || movement.type)}
                    </div>
                  </TableCell>
                  <TableCell className={`font-bold ${getMovementColor(movement.movement_type || movement.type)}`}>
                    {(movement.movement_type || movement.type) === 'out' ? '-' : '+'}{movement.quantity}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="text-muted-foreground">
                        {movement.previous_stock || movement.previousStock} → {movement.new_stock || movement.newStock}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {movement.reason}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {movement.notes}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredMovements.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No stock movements found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
