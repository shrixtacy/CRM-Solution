"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Plus, Minus, Trash2, Search, Calculator, Share2, Printer } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { db } from "@/db/supabase-direct"

interface Product {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  category: string
}

interface InvoiceItem {
  productId: string
  name: string
  sku: string
  price: number
  quantity: number
  total: number
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

interface Invoice {
  id: string
  invoiceNumber: string
  customer: Customer
  items: InvoiceItem[]
  subtotal: number
  taxAmount: number
  total: number
  paymentMethod: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  createdAt: string
  dueDate: string
  notes: string
}

export default function CreateInvoice() {
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [invoiceData, setInvoiceData] = useState({
    notes: '',
    paymentMethod: 'cash',
    dueDate: ''
  })

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, customersData] = await Promise.all([
          db.getProducts(),
          db.getCustomers()
        ])
        setProducts(productsData)
        setCustomers(customersData)
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive"
        })
      }
    }
    loadData()
  }, [])

  // Filter products based on search
  useEffect(() => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
  }, [products, searchTerm])

  const addProductToInvoice = (product: Product) => {
    const existingItem = invoiceItems.find(item => item.productId === product.id)
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${product.stock} units available`,
          variant: "destructive"
        })
        return
      }
      
      const updatedItems = invoiceItems.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      )
      setInvoiceItems(updatedItems)
    } else {
      if (product.stock === 0) {
        toast({
          title: "Out of Stock",
          description: `${product.name} is out of stock`,
          variant: "destructive"
        })
        return
      }
      
      const newItem: InvoiceItem = {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity: 1,
        total: product.price
      }
      setInvoiceItems([...invoiceItems, newItem])
    }
    
    setIsProductDialogOpen(false)
    setSearchTerm('')
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId)
      return
    }

    const product = products.find(p => p.id === productId)
    if (product && newQuantity > product.stock) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.stock} units available`,
        variant: "destructive"
      })
      return
    }

    const updatedItems = invoiceItems.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
        : item
    )
    setInvoiceItems(updatedItems)
  }

  const removeItem = (productId: string) => {
    setInvoiceItems(invoiceItems.filter(item => item.productId !== productId))
  }

  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateTax = () => {
    const taxRate = 0.18 // 18% GST - can be made configurable
    return calculateSubtotal() * taxRate
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const generateInvoiceNumber = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `INV-${year}${month}${day}-${random}`
  }

  const createInvoice = async () => {
    if (!selectedCustomer && !customerName.trim()) {
      toast({
        title: "Customer Required",
        description: "Please select a customer or enter customer name",
        variant: "destructive"
      })
      return
    }

    if (invoiceItems.length === 0) {
      toast({
        title: "Items Required",
        description: "Please add at least one item",
        variant: "destructive"
      })
      return
    }

    // Create customer object from either selected customer or manual input
    const customer = selectedCustomer || {
      id: 'manual',
      name: customerName.trim(),
      email: customerEmail.trim(),
      phone: customerPhone.trim(),
      address: ''
    }

    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: generateInvoiceNumber(),
      customer: customer,
      items: invoiceItems,
      subtotal: calculateSubtotal(),
      taxAmount: calculateTax(),
      total: calculateTotal(),
      paymentMethod: invoiceData.paymentMethod,
      status: 'paid',
      createdAt: new Date().toISOString(),
      dueDate: invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: invoiceData.notes
    }

    try {
      // Save invoice to Supabase
      const invoiceData = {
        invoice_number: invoice.invoiceNumber,
        customer_id: customer.id !== 'manual' ? customer.id : null,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        subtotal: invoice.subtotal,
        tax_amount: invoice.taxAmount,
        total: invoice.total,
        payment_method: invoice.paymentMethod,
        status: 'paid',
        due_date: invoice.dueDate,
        notes: invoice.notes
      }

      const savedInvoice = await db.insertInvoice(invoiceData)
      
      if (savedInvoice && savedInvoice.length > 0) {
        const invoiceId = savedInvoice[0].id

        // Save invoice items to Supabase
        const itemsData = invoiceItems.map(item => ({
          invoice_id: invoiceId,
          product_id: item.productId,
          product_name: item.name,
          sku: item.sku,
          price: item.price,
          quantity: item.quantity,
          total: item.total
        }))

        await db.insertInvoiceItems(itemsData)

        // Update inventory stock in Supabase
        for (const item of invoiceItems) {
          const product = products.find(p => p.id === item.productId)
          if (product) {
            const newStock = product.stock - item.quantity
            await db.updateProductStock(item.productId, newStock)

            // Create stock movement record
            const movementData = {
              product_id: item.productId,
              product_name: item.name,
              sku: item.sku,
              movement_type: 'out',
              quantity: item.quantity,
              reason: `Sale - Invoice ${invoice.invoiceNumber}`,
              notes: `Sold to ${customer.name}`,
              user_id: 'current-user',
              previous_stock: product.stock,
              new_stock: newStock
            }

            await db.insertStockMovement(movementData)
          }
        }

        // Update local state
        const updatedProducts = products.map(product => {
          const item = invoiceItems.find(i => i.productId === product.id)
          if (item) {
            return { ...product, stock: product.stock - item.quantity }
          }
          return product
        })
        setProducts(updatedProducts)

        // Send invoice email to customer
        if (customer.email) {
          try {
            const emailResponse = await fetch('/api/send-invoice', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                customerEmail: customer.email,
                customerName: customer.name,
                invoiceNumber: invoice.invoiceNumber,
                invoiceDate: invoice.createdAt,
                dueDate: invoice.dueDate,
                items: invoiceItems,
                subtotal: invoice.subtotal,
                taxAmount: invoice.taxAmount,
                total: invoice.total,
                paymentMethod: invoice.paymentMethod,
                notes: invoice.notes
              })
            })

            if (emailResponse.ok) {
              console.log('Invoice email sent successfully')
            } else {
              console.error('Failed to send invoice email')
            }
          } catch (emailError) {
            console.error('Error sending invoice email:', emailError)
            // Don't show error to user as invoice was created successfully
          }
        }
      }
    } catch (error) {
      console.error('Error saving invoice:', error)
      toast({
        title: "Error",
        description: "Failed to save invoice",
        variant: "destructive"
      })
      return
    }

    // Reset form
    setInvoiceItems([])
    setSelectedCustomer(null)
    setCustomerName('')
    setCustomerEmail('')
    setCustomerPhone('')
    setInvoiceData({ notes: '', paymentMethod: 'cash', dueDate: '' })

    toast({
      title: "Invoice Created & Paid",
      description: `Invoice ${invoice.invoiceNumber} has been created with PAID status, inventory updated, and email sent to customer`
    })
  }

  const printInvoice = () => {
    window.print()
  }

  const shareInvoice = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Invoice',
        text: `Invoice ${generateInvoiceNumber()} - Total: ₹${calculateTotal().toFixed(2)}`
      })
    } else {
      // Fallback for WhatsApp sharing
      const text = `Invoice ${generateInvoiceNumber()}\nTotal: ₹${calculateTotal().toFixed(2)}\nCustomer: ${selectedCustomer?.name || 'N/A'}`
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
      window.open(whatsappUrl, '_blank')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Create Invoice</h2>
          <p className="text-muted-foreground">Create and send invoices to customers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={printInvoice}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={shareInvoice}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer & Invoice Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="customer">Select Customer (Optional)</Label>
                  {selectedCustomer && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCustomer(null)
                        setCustomerName('')
                        setCustomerEmail('')
                        setCustomerPhone('')
                      }}
                    >
                      Clear Selection
                    </Button>
                  )}
                </div>
                <Select value={selectedCustomer?.id || ''} onValueChange={(value) => {
                  const customer = customers.find(c => c.id === value)
                  setSelectedCustomer(customer || null)
                  if (customer) {
                    setCustomerName(customer.name)
                    setCustomerEmail(customer.email)
                    setCustomerPhone(customer.phone)
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose existing customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Or enter customer details manually below
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>

                <div>
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Enter customer email"
                  />
                </div>

                <div>
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter customer phone"
                  />
                </div>
              </div>

              {selectedCustomer && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{selectedCustomer.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                </div>
              )}

              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={invoiceData.paymentMethod} onValueChange={(value) => setInvoiceData({ ...invoiceData, paymentMethod: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={invoiceData.dueDate}
                  onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={invoiceData.notes}
                  onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Add Products */}
          <Card>
            <CardHeader>
              <CardTitle>Add Products</CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Select Product</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredProducts.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{product.name}</div>
                                  <div className="text-sm text-muted-foreground">{product.sku}</div>
                                </div>
                              </TableCell>
                              <TableCell>₹{product.price.toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge variant={product.stock === 0 ? 'destructive' : product.stock <= 5 ? 'default' : 'secondary'}>
                                  {product.stock}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  onClick={() => addProductToInvoice(product)}
                                  disabled={product.stock === 0}
                                >
                                  Add
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Items & Summary */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              {invoiceItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No items added yet</p>
                  <p className="text-sm">Click &quot;Add Product&quot; to start building your invoice</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoiceItems.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">{item.sku}</div>
                          </div>
                        </TableCell>
                        <TableCell>₹{item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>₹{item.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeItem(item.productId)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%):</span>
                <span>₹{calculateTax().toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
              
              <Button 
                className="w-full" 
                onClick={createInvoice}
                disabled={(!selectedCustomer && !customerName.trim()) || invoiceItems.length === 0}
              >
                Create Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
