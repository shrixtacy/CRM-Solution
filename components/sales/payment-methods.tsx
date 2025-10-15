"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { CreditCard, Plus, Edit, Trash2, CheckCircle, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface PaymentMethod {
  id: string
  name: string
  type: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque' | 'other'
  isActive: boolean
  description: string
  icon: string
  color: string
  createdAt: string
  updatedAt: string
}

export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'other' as 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque' | 'other',
    description: '',
    isActive: true
  })

  // Load payment methods from localStorage
  useEffect(() => {
    const savedMethods = localStorage.getItem('payment-methods')
    if (savedMethods) {
      setPaymentMethods(JSON.parse(savedMethods))
    } else {
      // Initialize with default payment methods
      const defaultMethods: PaymentMethod[] = [
        {
          id: '1',
          name: 'Cash',
          type: 'cash',
          isActive: true,
          description: 'Cash payments',
          icon: '💵',
          color: 'bg-green-100 text-green-800',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'UPI',
          type: 'upi',
          isActive: true,
          description: 'UPI payments (PhonePe, Google Pay, Paytm)',
          icon: '📱',
          color: 'bg-blue-100 text-blue-800',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Card',
          type: 'card',
          isActive: true,
          description: 'Credit/Debit card payments',
          icon: '💳',
          color: 'bg-purple-100 text-purple-800',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Bank Transfer',
          type: 'bank_transfer',
          isActive: true,
          description: 'Direct bank transfer',
          icon: '🏦',
          color: 'bg-yellow-100 text-yellow-800',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '5',
          name: 'Cheque',
          type: 'cheque',
          isActive: true,
          description: 'Cheque payments',
          icon: '📄',
          color: 'bg-orange-100 text-orange-800',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      setPaymentMethods(defaultMethods)
      localStorage.setItem('payment-methods', JSON.stringify(defaultMethods))
    }
  }, [])

  const savePaymentMethods = (newMethods: PaymentMethod[]) => {
    setPaymentMethods(newMethods)
    localStorage.setItem('payment-methods', JSON.stringify(newMethods))
  }

  const handleAddMethod = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a payment method name",
        variant: "destructive"
      })
      return
    }

    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      isActive: formData.isActive,
      description: formData.description,
      icon: getMethodIcon(formData.type),
      color: getMethodColor(formData.type),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedMethods = [...paymentMethods, newMethod]
    savePaymentMethods(updatedMethods)
    resetForm()
    setIsAddDialogOpen(false)
    toast({
      title: "Payment Method Added",
      description: "New payment method has been added"
    })
  }

  const handleEditMethod = () => {
    if (!editingMethod || !formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a payment method name",
        variant: "destructive"
      })
      return
    }

    const updatedMethods = paymentMethods.map(method =>
      method.id === editingMethod.id
        ? {
            ...method,
            name: formData.name,
            type: formData.type,
            isActive: formData.isActive,
            description: formData.description,
            icon: getMethodIcon(formData.type),
            color: getMethodColor(formData.type),
            updatedAt: new Date().toISOString()
          }
        : method
    )

    savePaymentMethods(updatedMethods)
    resetForm()
    setIsEditDialogOpen(false)
    setEditingMethod(null)
    toast({
      title: "Payment Method Updated",
      description: "Payment method has been updated"
    })
  }

  const handleDeleteMethod = (methodId: string) => {
    const updatedMethods = paymentMethods.filter(method => method.id !== methodId)
    savePaymentMethods(updatedMethods)
    toast({
      title: "Payment Method Deleted",
      description: "Payment method has been removed"
    })
  }

  const toggleMethodStatus = (methodId: string) => {
    const updatedMethods = paymentMethods.map(method =>
      method.id === methodId
        ? { ...method, isActive: !method.isActive, updatedAt: new Date().toISOString() }
        : method
    )
    savePaymentMethods(updatedMethods)
  }

  const openEditDialog = (method: PaymentMethod) => {
    setEditingMethod(method)
    setFormData({
      name: method.name,
      type: method.type,
      description: method.description,
      isActive: method.isActive
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'other',
      description: '',
      isActive: true
    })
  }

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'cash': return '💵'
      case 'upi': return '📱'
      case 'card': return '💳'
      case 'bank_transfer': return '🏦'
      case 'cheque': return '📄'
      default: return '💰'
    }
  }

  const getMethodColor = (type: string) => {
    switch (type) {
      case 'cash': return 'bg-green-100 text-green-800'
      case 'upi': return 'bg-blue-100 text-blue-800'
      case 'card': return 'bg-purple-100 text-purple-800'
      case 'bank_transfer': return 'bg-yellow-100 text-yellow-800'
      case 'cheque': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMethodName = (type: string) => {
    switch (type) {
      case 'cash': return 'Cash'
      case 'upi': return 'UPI'
      case 'card': return 'Card'
      case 'bank_transfer': return 'Bank Transfer'
      case 'cheque': return 'Cheque'
      default: return 'Other'
    }
  }

  const activeMethods = paymentMethods.filter(method => method.isActive)
  const inactiveMethods = paymentMethods.filter(method => !method.isActive)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Methods</h2>
          <p className="text-muted-foreground">Manage payment methods for invoices</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Method
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
            </DialogHeader>
            <PaymentMethodForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleAddMethod}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Active Payment Methods ({activeMethods.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeMethods.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Method</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeMethods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Created: {new Date(method.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={method.color}>
                        {getMethodName(method.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {method.description}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={method.isActive}
                          onCheckedChange={() => toggleMethodStatus(method.id)}
                        />
                        <span className="text-sm text-green-600">Active</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(method)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMethod(method.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active payment methods</p>
              <p className="text-sm">Add payment methods to start accepting payments</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inactive Payment Methods */}
      {inactiveMethods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Inactive Payment Methods ({inactiveMethods.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Method</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inactiveMethods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl opacity-50">{method.icon}</span>
                        <div>
                          <div className="font-medium opacity-50">{method.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Created: {new Date(method.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="opacity-50">
                        {getMethodName(method.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate opacity-50">
                      {method.description}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={method.isActive}
                          onCheckedChange={() => toggleMethodStatus(method.id)}
                        />
                        <span className="text-sm text-muted-foreground">Inactive</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(method)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMethod(method.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment Method</DialogTitle>
          </DialogHeader>
          <PaymentMethodForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleEditMethod}
            onCancel={() => {
              setIsEditDialogOpen(false)
              setEditingMethod(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PaymentMethodForm({ formData, setFormData, onSubmit, onCancel }: {
  formData: {
    name: string
    type: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque' | 'other'
    description: string
    isActive: boolean
  }
  setFormData: (data: {
    name: string
    type: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque' | 'other'
    description: string
    isActive: boolean
  }) => void
  onSubmit: () => void
  onCancel: () => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Payment Method Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter payment method name"
        />
      </div>

      <div>
        <Label htmlFor="type">Type</Label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque' | 'other' })}
          className="w-full p-2 border rounded-md"
        >
          <option value="cash">Cash</option>
          <option value="upi">UPI</option>
          <option value="card">Card</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="cheque">Cheque</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter description (optional)"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="isActive">Active</Label>
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          Save Method
        </Button>
      </div>
    </div>
  )
}
