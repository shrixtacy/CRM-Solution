"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calculator, Plus, Edit, Trash2, CheckCircle, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface TaxRate {
  id: string
  name: string
  rate: number
  type: 'percentage' | 'fixed'
  isActive: boolean
  description: string
  applicableTo: 'all' | 'products' | 'services'
  createdAt: string
  updatedAt: string
}

interface TaxSettings {
  enableTax: boolean
  defaultTaxRate: string
  taxInclusive: boolean
  showTaxBreakdown: boolean
  taxLabel: string
  currency: string
}

export default function TaxSettings() {
  const [taxRates, setTaxRates] = useState<TaxRate[]>([])
  const [settings, setSettings] = useState<TaxSettings>({
    enableTax: true,
    defaultTaxRate: '',
    taxInclusive: false,
    showTaxBreakdown: true,
    taxLabel: 'GST',
    currency: 'INR'
  })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingRate, setEditingRate] = useState<TaxRate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    rate: '',
    type: 'percentage' as 'percentage' | 'fixed',
    description: '',
    applicableTo: 'all' as 'all' | 'products' | 'services',
    isActive: true
  })

  // Load data from localStorage
  useEffect(() => {
    const savedRates = localStorage.getItem('tax-rates')
    const savedSettings = localStorage.getItem('tax-settings')
    
    if (savedRates) {
      setTaxRates(JSON.parse(savedRates))
    } else {
      // Initialize with default tax rates
      const defaultRates: TaxRate[] = [
        {
          id: '1',
          name: 'GST 18%',
          rate: 18,
          type: 'percentage',
          isActive: true,
          description: 'Standard GST rate',
          applicableTo: 'all',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'GST 5%',
          rate: 5,
          type: 'percentage',
          isActive: true,
          description: 'Reduced GST rate',
          applicableTo: 'all',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'GST 0%',
          rate: 0,
          type: 'percentage',
          isActive: true,
          description: 'Zero GST rate',
          applicableTo: 'all',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      setTaxRates(defaultRates)
      localStorage.setItem('tax-rates', JSON.stringify(defaultRates))
    }
    
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const saveTaxRates = (newRates: TaxRate[]) => {
    setTaxRates(newRates)
    localStorage.setItem('tax-rates', JSON.stringify(newRates))
  }

  const saveSettings = (newSettings: TaxSettings) => {
    setSettings(newSettings)
    localStorage.setItem('tax-settings', JSON.stringify(newSettings))
  }

  const handleAddRate = () => {
    if (!formData.name.trim() || !formData.rate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    const newRate: TaxRate = {
      id: Date.now().toString(),
      name: formData.name,
      rate: parseFloat(formData.rate),
      type: formData.type,
      isActive: formData.isActive,
      description: formData.description,
      applicableTo: formData.applicableTo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedRates = [...taxRates, newRate]
    saveTaxRates(updatedRates)
    resetForm()
    setIsAddDialogOpen(false)
    toast({
      title: "Tax Rate Added",
      description: "New tax rate has been added"
    })
  }

  const handleEditRate = () => {
    if (!editingRate || !formData.name.trim() || !formData.rate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    const updatedRates = taxRates.map(rate =>
      rate.id === editingRate.id
        ? {
            ...rate,
            name: formData.name,
            rate: parseFloat(formData.rate),
            type: formData.type,
            isActive: formData.isActive,
            description: formData.description,
            applicableTo: formData.applicableTo,
            updatedAt: new Date().toISOString()
          }
        : rate
    )

    saveTaxRates(updatedRates)
    resetForm()
    setIsEditDialogOpen(false)
    setEditingRate(null)
    toast({
      title: "Tax Rate Updated",
      description: "Tax rate has been updated"
    })
  }

  const handleDeleteRate = (rateId: string) => {
    const updatedRates = taxRates.filter(rate => rate.id !== rateId)
    saveTaxRates(updatedRates)
    toast({
      title: "Tax Rate Deleted",
      description: "Tax rate has been removed"
    })
  }

  const toggleRateStatus = (rateId: string) => {
    const updatedRates = taxRates.map(rate =>
      rate.id === rateId
        ? { ...rate, isActive: !rate.isActive, updatedAt: new Date().toISOString() }
        : rate
    )
    saveTaxRates(updatedRates)
  }

  const openEditDialog = (rate: TaxRate) => {
    setEditingRate(rate)
    setFormData({
      name: rate.name,
      rate: rate.rate.toString(),
      type: rate.type,
      description: rate.description,
      applicableTo: rate.applicableTo,
      isActive: rate.isActive
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      rate: '',
      type: 'percentage',
      description: '',
      applicableTo: 'all',
      isActive: true
    })
  }

  const getApplicableToBadge = (applicableTo: string) => {
    switch (applicableTo) {
      case 'all':
        return <Badge variant="default">All Items</Badge>
      case 'products':
        return <Badge variant="secondary">Products Only</Badge>
      case 'services':
        return <Badge variant="outline">Services Only</Badge>
      default:
        return <Badge variant="outline">{applicableTo}</Badge>
    }
  }

  const getRateDisplay = (rate: TaxRate) => {
    if (rate.type === 'percentage') {
      return `${rate.rate}%`
    } else {
      return `₹${rate.rate.toFixed(2)}`
    }
  }

  const activeRates = taxRates.filter(rate => rate.isActive)
  const inactiveRates = taxRates.filter(rate => !rate.isActive)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tax Settings</h2>
          <p className="text-muted-foreground">Configure tax rates and settings for invoices</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Tax Rate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Tax Rate</DialogTitle>
            </DialogHeader>
            <TaxRateForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleAddRate}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tax Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            General Tax Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableTax">Enable Tax Calculation</Label>
                <Switch
                  id="enableTax"
                  checked={settings.enableTax}
                  onCheckedChange={(checked) => saveSettings({ ...settings, enableTax: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="taxInclusive">Tax Inclusive Pricing</Label>
                <Switch
                  id="taxInclusive"
                  checked={settings.taxInclusive}
                  onCheckedChange={(checked) => saveSettings({ ...settings, taxInclusive: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showTaxBreakdown">Show Tax Breakdown</Label>
                <Switch
                  id="showTaxBreakdown"
                  checked={settings.showTaxBreakdown}
                  onCheckedChange={(checked) => saveSettings({ ...settings, showTaxBreakdown: checked })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="defaultTaxRate">Default Tax Rate</Label>
                <Select value={settings.defaultTaxRate} onValueChange={(value) => saveSettings({ ...settings, defaultTaxRate: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select default tax rate" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeRates.map(rate => (
                      <SelectItem key={rate.id} value={rate.id}>
                        {rate.name} ({getRateDisplay(rate)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="taxLabel">Tax Label</Label>
                <Input
                  id="taxLabel"
                  value={settings.taxLabel}
                  onChange={(e) => saveSettings({ ...settings, taxLabel: e.target.value })}
                  placeholder="e.g., GST, VAT, Tax"
                />
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={settings.currency} onValueChange={(value) => saveSettings({ ...settings, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">₹ INR</SelectItem>
                    <SelectItem value="USD">$ USD</SelectItem>
                    <SelectItem value="EUR">€ EUR</SelectItem>
                    <SelectItem value="GBP">£ GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Tax Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Active Tax Rates ({activeRates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeRates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tax Rate</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Applicable To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeRates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{rate.name}</div>
                        <div className="text-sm text-muted-foreground">{rate.description}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">{getRateDisplay(rate)}</TableCell>
                    <TableCell>
                      <Badge variant={rate.type === 'percentage' ? 'default' : 'secondary'}>
                        {rate.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                      </Badge>
                    </TableCell>
                    <TableCell>{getApplicableToBadge(rate.applicableTo)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rate.isActive}
                          onCheckedChange={() => toggleRateStatus(rate.id)}
                        />
                        <span className="text-sm text-green-600">Active</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(rate)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRate(rate.id)}
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
              <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active tax rates</p>
              <p className="text-sm">Add tax rates to start calculating taxes on invoices</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inactive Tax Rates */}
      {inactiveRates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Inactive Tax Rates ({inactiveRates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tax Rate</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Applicable To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inactiveRates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium opacity-50">{rate.name}</div>
                        <div className="text-sm text-muted-foreground">{rate.description}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold opacity-50">{getRateDisplay(rate)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="opacity-50">
                        {rate.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="opacity-50">
                        {rate.applicableTo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rate.isActive}
                          onCheckedChange={() => toggleRateStatus(rate.id)}
                        />
                        <span className="text-sm text-muted-foreground">Inactive</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(rate)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRate(rate.id)}
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
            <DialogTitle>Edit Tax Rate</DialogTitle>
          </DialogHeader>
          <TaxRateForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleEditRate}
            onCancel={() => {
              setIsEditDialogOpen(false)
              setEditingRate(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TaxRateForm({ formData, setFormData, onSubmit, onCancel }: {
  formData: {
    name: string
    rate: string
    type: 'percentage' | 'fixed'
    description: string
    applicableTo: 'all' | 'products' | 'services'
    isActive: boolean
  }
  setFormData: (data: {
    name: string
    rate: string
    type: 'percentage' | 'fixed'
    description: string
    applicableTo: 'all' | 'products' | 'services'
    isActive: boolean
  }) => void
  onSubmit: () => void
  onCancel: () => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Tax Rate Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., GST 18%, Standard Rate"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rate">Rate *</Label>
          <Input
            id="rate"
            type="number"
            step="0.01"
            value={formData.rate}
            onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
            placeholder="18"
          />
        </div>

        <div>
          <Label htmlFor="type">Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as 'percentage' | 'fixed' })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
            </SelectContent>
          </Select>
        </div>
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

      <div>
        <Label htmlFor="applicableTo">Applicable To</Label>
          <Select value={formData.applicableTo} onValueChange={(value) => setFormData({ ...formData, applicableTo: value as 'all' | 'products' | 'services' })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="products">Products Only</SelectItem>
            <SelectItem value="services">Services Only</SelectItem>
          </SelectContent>
        </Select>
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
          Save Tax Rate
        </Button>
      </div>
    </div>
  )
}
