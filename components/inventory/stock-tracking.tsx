"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, TrendingUp, TrendingDown, Package, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { db } from "@/db/supabase-direct"

interface Product {
  id: string
  name: string
  sku: string
  stock: number
  minStock: number
  maxStock: number
  price: number
  category: string
}

interface StockMovement {
  id: string
  productId: string
  productName: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason: string
  notes: string
  timestamp: string
  userId: string
}

export default function StockTracking() {
  const [products, setProducts] = useState<Product[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [adjustmentData, setAdjustmentData] = useState({
    quantity: '',
    type: 'adjustment' as 'in' | 'out' | 'adjustment',
    reason: '',
    notes: ''
  })

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, movementsData] = await Promise.all([
          db.getProducts(),
          db.getStockMovements()
        ])
        setProducts(productsData)
        setStockMovements(movementsData)
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Error",
          description: "Failed to load inventory data",
          variant: "destructive"
        })
      }
    }
    loadData()
  }, [])


  const updateProductStock = async (productId: string, newStock: number) => {
    try {
      await db.updateProductStock(productId, newStock)
      const updatedProducts = products.map(product =>
        product.id === productId
          ? { ...product, stock: newStock }
          : product
      )
      setProducts(updatedProducts)
    } catch (error) {
      console.error('Error updating product stock:', error)
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive"
      })
    }
  }

  const handleStockAdjustment = async () => {
    if (!selectedProduct || !adjustmentData.quantity || !adjustmentData.reason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      const quantity = parseInt(adjustmentData.quantity)
      const currentStock = selectedProduct.stock
      let newStock = currentStock

      if (adjustmentData.type === 'in') {
        newStock = currentStock + quantity
      } else if (adjustmentData.type === 'out') {
        newStock = currentStock - quantity
        if (newStock < 0) {
          toast({
            title: "Error",
            description: "Cannot reduce stock below zero",
            variant: "destructive"
          })
          return
        }
      } else {
        newStock = quantity
      }

      // Create stock movement record
      const movementData = {
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        sku: selectedProduct.sku,
        movement_type: adjustmentData.type,
        quantity: Math.abs(quantity),
        reason: adjustmentData.reason,
        notes: adjustmentData.notes,
        user_id: 'current-user',
        previous_stock: currentStock,
        new_stock: newStock
      }

      // Save stock movement to Supabase
      await db.insertStockMovement(movementData)

      // Update product stock
      await updateProductStock(selectedProduct.id, newStock)

      // Reload data to get updated movements
      const movementsData = await db.getStockMovements()
      setStockMovements(movementsData)

      // Reset form
      setAdjustmentData({
        quantity: '',
        type: 'adjustment',
        reason: '',
        notes: ''
      })
      setIsAdjustDialogOpen(false)
      setSelectedProduct(null)

      toast({
        title: "Success",
        description: "Stock updated successfully"
      })
    } catch (error) {
      console.error('Error updating stock:', error)
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive"
      })
    }
  }

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { status: 'Out of Stock', variant: 'destructive' as const }
    if (stock <= minStock) return { status: 'Low Stock', variant: 'destructive' as const }
    return { status: 'In Stock', variant: 'default' as const }
  }

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

  const lowStockProducts = products.filter(p => p.stock <= p.minStock && p.stock > 0)
  const outOfStockProducts = products.filter(p => p.stock === 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Stock Tracking</h2>
          <p className="text-muted-foreground">Monitor and adjust stock levels in real-time</p>
        </div>
        <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adjust Stock
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adjust Stock</DialogTitle>
            </DialogHeader>
            <StockAdjustmentForm
              products={products}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
              adjustmentData={adjustmentData}
              setAdjustmentData={setAdjustmentData}
              onSubmit={handleStockAdjustment}
              onCancel={() => setIsAdjustDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stock Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">In Stock</p>
                <p className="text-2xl font-bold">
                  {products.filter(p => p.stock > p.minStock).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{lowStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold">{outOfStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Stock Levels */}
      <Card>
        <CardHeader>
          <CardTitle>Current Stock Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Min Stock</TableHead>
                <TableHead>Max Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const stockStatus = getStockStatus(product.stock, product.minStock)
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell className="font-bold">{product.stock}</TableCell>
                    <TableCell>{product.minStock}</TableCell>
                    <TableCell>{product.maxStock}</TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.variant}>
                        {stockStatus.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(product)
                          setAdjustmentData({
                            quantity: product.stock.toString(),
                            type: 'adjustment',
                            reason: '',
                            notes: ''
                          })
                          setIsAdjustDialogOpen(true)
                        }}
                      >
                        Adjust
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Stock Movements */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Stock Movements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockMovements.slice(-10).reverse().map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="font-medium">{movement.productName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getMovementIcon(movement.type)}
                      <span className="capitalize">{movement.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className={`font-bold ${getMovementColor(movement.type)}`}>
                    {movement.type === 'out' ? '-' : '+'}{movement.quantity}
                  </TableCell>
                  <TableCell>{movement.reason}</TableCell>
                  <TableCell>
                    {new Date(movement.timestamp).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function StockAdjustmentForm({ 
  products, 
  selectedProduct, 
  setSelectedProduct, 
  adjustmentData, 
  setAdjustmentData, 
  onSubmit, 
  onCancel 
}: {
  products: Product[]
  selectedProduct: Product | null
  setSelectedProduct: (product: Product | null) => void
  adjustmentData: {
    quantity: string
    type: 'in' | 'out' | 'adjustment'
    reason: string
    notes: string
  }
  setAdjustmentData: (data: {
    quantity: string
    type: 'in' | 'out' | 'adjustment'
    reason: string
    notes: string
  }) => void
  onSubmit: () => void
  onCancel: () => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="product">Select Product</Label>
        <Select 
          value={selectedProduct?.id || ''} 
          onValueChange={(value) => {
            const product = products.find(p => p.id === value)
            setSelectedProduct(product || null)
            if (product) {
              setAdjustmentData({
                ...adjustmentData,
                quantity: product.stock.toString()
              })
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a product" />
          </SelectTrigger>
          <SelectContent>
            {products.map(product => (
              <SelectItem key={product.id} value={product.id}>
                {product.name} ({product.sku}) - Current: {product.stock}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProduct && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Adjustment Type</Label>
              <Select 
                value={adjustmentData.type} 
                onValueChange={(value) => setAdjustmentData({ ...adjustmentData, type: value as 'in' | 'out' | 'adjustment' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Stock In (+)</SelectItem>
                  <SelectItem value="out">Stock Out (-)</SelectItem>
                  <SelectItem value="adjustment">Set Quantity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={adjustmentData.quantity}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, quantity: e.target.value })}
                placeholder="Enter quantity"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="reason">Reason *</Label>
            <Input
              id="reason"
              value={adjustmentData.reason}
              onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
              placeholder="Enter reason for adjustment"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={adjustmentData.notes}
              onChange={(e) => setAdjustmentData({ ...adjustmentData, notes: e.target.value })}
              placeholder="Additional notes (optional)"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onSubmit}>
              Update Stock
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
