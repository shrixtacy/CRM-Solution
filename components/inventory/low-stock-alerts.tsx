"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, Bell, Settings, CheckCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { db } from "@/db/supabase-direct"

interface Product {
  id: string
  name: string
  sku: string
  stock: number
  minStock: number
  price: number
  category: string
}

interface AlertSettings {
  enabled: boolean
  emailNotifications: boolean
  lowStockThreshold: number
  emailAddress: string
  alertFrequency: 'immediate' | 'daily' | 'weekly'
}

interface AlertLog {
  id: string
  productId: string
  productName: string
  alertType: 'low_stock' | 'out_of_stock'
  message: string
  timestamp: string
  resolved: boolean
}

export default function LowStockAlerts() {
  const [products, setProducts] = useState<Product[]>([])
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    enabled: true,
    emailNotifications: true,
    lowStockThreshold: 10,
    emailAddress: '',
    alertFrequency: 'immediate'
  })
  const [alertLogs, setAlertLogs] = useState<AlertLog[]>([])
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        const productsData = await db.getProducts()
        setProducts(productsData)
        
        // Load alert settings from localStorage (these are user preferences)
        const savedSettings = localStorage.getItem('inventory-alert-settings')
        if (savedSettings) {
          setAlertSettings(JSON.parse(savedSettings))
        }
        
        // Generate alerts based on current products
        generateAlerts(productsData)
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

  const generateAlerts = (productsData: Product[]) => {
    const newAlerts: AlertLog[] = []
    
    productsData.forEach(product => {
      if (product.stock === 0) {
        newAlerts.push({
          id: `alert-${product.id}-${Date.now()}`,
          productId: product.id,
          productName: product.name,
          alertType: 'out_of_stock',
          message: `${product.name} is out of stock`,
          timestamp: new Date().toISOString(),
          resolved: false
        })
      } else if (product.stock <= product.minStock) {
        newAlerts.push({
          id: `alert-${product.id}-${Date.now()}`,
          productId: product.id,
          productName: product.name,
          alertType: 'low_stock',
          message: `${product.name} is running low (${product.stock} remaining)`,
          timestamp: new Date().toISOString(),
          resolved: false
        })
      }
    })
    
    setAlertLogs(newAlerts)
  }

  const saveAlertSettings = (newSettings: AlertSettings) => {
    setAlertSettings(newSettings)
    localStorage.setItem('inventory-alert-settings', JSON.stringify(newSettings))
  }

  const saveAlertLogs = (newLogs: AlertLog[]) => {
    setAlertLogs(newLogs)
    localStorage.setItem('inventory-alert-logs', JSON.stringify(newLogs))
  }

  const getLowStockProducts = () => {
    return products.filter(product => 
      product.stock <= product.minStock && product.stock > 0
    )
  }

  const getOutOfStockProducts = () => {
    return products.filter(product => product.stock === 0)
  }

  const createAlert = (product: Product, alertType: 'low_stock' | 'out_of_stock') => {
    const message = alertType === 'out_of_stock' 
      ? `${product.name} is out of stock!`
      : `${product.name} is running low on stock (${product.stock} remaining)`

    const newAlert: AlertLog = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      alertType,
      message,
      timestamp: new Date().toISOString(),
      resolved: false
    }

    const updatedLogs = [...alertLogs, newAlert]
    saveAlertLogs(updatedLogs)

    // Show toast notification
    toast({
      title: "Stock Alert",
      description: message,
      variant: alertType === 'out_of_stock' ? 'destructive' : 'default'
    })

    return newAlert
  }

  const resolveAlert = (alertId: string) => {
    const updatedLogs = alertLogs.map(alert =>
      alert.id === alertId ? { ...alert, resolved: true } : alert
    )
    saveAlertLogs(updatedLogs)
    toast({
      title: "Alert Resolved",
      description: "Alert has been marked as resolved"
    })
  }

  const testAlert = () => {
    if (products.length === 0) {
      toast({
        title: "No Products",
        description: "Add some products to test alerts",
        variant: "destructive"
      })
      return
    }

    const testProduct = products[0]
    createAlert(testProduct, 'low_stock')
  }

  const lowStockProducts = getLowStockProducts()
  const outOfStockProducts = getOutOfStockProducts()
  const activeAlerts = alertLogs.filter(alert => !alert.resolved)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Low Stock Alerts</h2>
          <p className="text-muted-foreground">Monitor and manage stock level alerts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" onClick={testAlert}>
            <Bell className="h-4 w-4 mr-2" />
            Test Alert
          </Button>
        </div>
      </div>

      {/* Alert Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold">{outOfStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">{activeAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Low Stock Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Min Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell className="font-bold text-yellow-600">{product.stock}</TableCell>
                  <TableCell>{product.minStock}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">Low Stock</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => createAlert(product, 'low_stock')}
                    >
                      <Bell className="h-4 w-4 mr-1" />
                      Alert
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Out of Stock Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Out of Stock Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Min Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {outOfStockProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell className="font-bold text-red-600">{product.stock}</TableCell>
                  <TableCell>{product.minStock}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">Out of Stock</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => createAlert(product, 'out_of_stock')}
                    >
                      <Bell className="h-4 w-4 mr-1" />
                      Alert
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alert History */}
      <Card>
        <CardHeader>
          <CardTitle>Alert History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Alert Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alertLogs.slice(-10).reverse().map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">{alert.productName}</TableCell>
                  <TableCell>
                    <Badge variant={alert.alertType === 'out_of_stock' ? 'destructive' : 'default'}>
                      {alert.alertType.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{alert.message}</TableCell>
                  <TableCell>
                    {new Date(alert.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={alert.resolved ? 'default' : 'destructive'}>
                      {alert.resolved ? 'Resolved' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {!alert.resolved && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      {isSettingsOpen && (
        <AlertSettingsDialog
          settings={alertSettings}
          onSave={saveAlertSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  )
}

function AlertSettingsDialog({ 
  settings, 
  onSave, 
  onClose 
}: {
  settings: AlertSettings
  onSave: (settings: AlertSettings) => void
  onClose: () => void
}) {
  const [localSettings, setLocalSettings] = useState(settings)

  const handleSave = () => {
    onSave(localSettings)
    onClose()
    toast({
      title: "Settings Saved",
      description: "Alert settings have been updated"
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Alert Settings</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">Enable Alerts</Label>
            <Switch
              id="enabled"
              checked={localSettings.enabled}
              onCheckedChange={(checked) => 
                setLocalSettings({ ...localSettings, enabled: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="email">Email Notifications</Label>
            <Switch
              id="email"
              checked={localSettings.emailNotifications}
              onCheckedChange={(checked) => 
                setLocalSettings({ ...localSettings, emailNotifications: checked })
              }
            />
          </div>

          {localSettings.emailNotifications && (
            <div>
              <Label htmlFor="emailAddress">Email Address</Label>
              <Input
                id="emailAddress"
                type="email"
                value={localSettings.emailAddress}
                onChange={(e) => 
                  setLocalSettings({ ...localSettings, emailAddress: e.target.value })
                }
                placeholder="Enter email address"
              />
            </div>
          )}

          <div>
            <Label htmlFor="threshold">Low Stock Threshold</Label>
            <Input
              id="threshold"
              type="number"
              value={localSettings.lowStockThreshold}
              onChange={(e) => 
                setLocalSettings({ 
                  ...localSettings, 
                  lowStockThreshold: parseInt(e.target.value) || 0 
                })
              }
              placeholder="Enter threshold"
            />
          </div>

          <div>
            <Label htmlFor="frequency">Alert Frequency</Label>
            <select
              id="frequency"
              value={localSettings.alertFrequency}
              onChange={(e) => 
                setLocalSettings({ 
                  ...localSettings, 
                  alertFrequency: e.target.value as 'immediate' | 'daily' | 'weekly'
                })
              }
              className="w-full p-2 border rounded-md"
            >
              <option value="immediate">Immediate</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
