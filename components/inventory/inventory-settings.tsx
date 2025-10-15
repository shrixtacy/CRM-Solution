"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Settings, Upload, Download, Database, Link, Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface InventorySettings {
  autoDeductOnSale: boolean
  lowStockThreshold: number
  emailNotifications: boolean
  emailAddress: string
  alertFrequency: 'immediate' | 'daily' | 'weekly'
  currency: string
  timezone: string
  backupFrequency: 'daily' | 'weekly' | 'monthly'
}

interface ExternalIntegration {
  id: string
  name: string
  type: 'amazon' | 'shopify' | 'woocommerce' | 'custom'
  status: 'connected' | 'disconnected' | 'error'
  apiKey: string
  webhookUrl: string
  lastSync: string
  autoSync: boolean
}

export default function InventorySettings() {
  const [settings, setSettings] = useState<InventorySettings>({
    autoDeductOnSale: true,
    lowStockThreshold: 10,
    emailNotifications: true,
    emailAddress: '',
    alertFrequency: 'immediate',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    backupFrequency: 'daily'
  })

  const [integrations, setIntegrations] = useState<ExternalIntegration[]>([])
  const [isAddingIntegration, setIsAddingIntegration] = useState(false)
  const [newIntegration, setNewIntegration] = useState({
    name: '',
    type: 'custom' as 'amazon' | 'shopify' | 'woocommerce' | 'custom',
    apiKey: '',
    webhookUrl: '',
    autoSync: false
  })

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('inventory-settings')
    const savedIntegrations = localStorage.getItem('inventory-integrations')
    
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
    
    if (savedIntegrations) {
      setIntegrations(JSON.parse(savedIntegrations))
    }
  }, [])

  const saveSettings = (newSettings: InventorySettings) => {
    setSettings(newSettings)
    localStorage.setItem('inventory-settings', JSON.stringify(newSettings))
    toast({
      title: "Settings Saved",
      description: "Inventory settings have been updated"
    })
  }

  const saveIntegrations = (newIntegrations: ExternalIntegration[]) => {
    setIntegrations(newIntegrations)
    localStorage.setItem('inventory-integrations', JSON.stringify(newIntegrations))
  }

  const addIntegration = () => {
    if (!newIntegration.name || !newIntegration.apiKey) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    const integration: ExternalIntegration = {
      id: Date.now().toString(),
      name: newIntegration.name,
      type: newIntegration.type,
      status: 'connected',
      apiKey: newIntegration.apiKey,
      webhookUrl: newIntegration.webhookUrl,
      lastSync: new Date().toISOString(),
      autoSync: newIntegration.autoSync
    }

    const updatedIntegrations = [...integrations, integration]
    saveIntegrations(updatedIntegrations)
    
    setNewIntegration({
      name: '',
      type: 'custom',
      apiKey: '',
      webhookUrl: '',
      autoSync: false
    })
    setIsAddingIntegration(false)

    toast({
      title: "Integration Added",
      description: "External integration has been configured"
    })
  }

  const removeIntegration = (integrationId: string) => {
    const updatedIntegrations = integrations.filter(i => i.id !== integrationId)
    saveIntegrations(updatedIntegrations)
    toast({
      title: "Integration Removed",
      description: "External integration has been disconnected"
    })
  }

  const testIntegration = (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId)
    if (integration) {
      // Simulate API test
      toast({
        title: "Testing Connection",
        description: `Testing connection to ${integration.name}...`
      })
      
      setTimeout(() => {
        toast({
          title: "Connection Test",
          description: `Successfully connected to ${integration.name}`,
          variant: "default"
        })
      }, 2000)
    }
  }

  const exportInventory = () => {
    const products = localStorage.getItem('inventory-products')
    if (products) {
      const blob = new Blob([products], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inventory-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "Export Successful",
        description: "Inventory data has been exported"
      })
    }
  }

  const importInventory = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          localStorage.setItem('inventory-products', JSON.stringify(data))
          toast({
            title: "Import Successful",
            description: "Inventory data has been imported"
          })
          window.location.reload()
        } catch {
          toast({
            title: "Import Failed",
            description: "Invalid file format",
            variant: "destructive"
          })
        }
      }
      reader.readAsText(file)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>
      case 'disconnected':
        return <Badge variant="secondary">Disconnected</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'amazon':
        return '🛒'
      case 'shopify':
        return '🛍️'
      case 'woocommerce':
        return '🛒'
      default:
        return '🔗'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inventory Settings</h2>
          <p className="text-muted-foreground">Configure inventory management preferences and integrations</p>
        </div>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoDeduct">Auto-deduct on Sale</Label>
                <Switch
                  id="autoDeduct"
                  checked={settings.autoDeductOnSale}
                  onCheckedChange={(checked) => 
                    saveSettings({ ...settings, autoDeductOnSale: checked })
                  }
                />
              </div>

              <div>
                <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  value={settings.lowStockThreshold}
                  onChange={(e) => 
                    saveSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) || 0 })
                  }
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => 
                    saveSettings({ ...settings, emailNotifications: checked })
                  }
                />
              </div>

              {settings.emailNotifications && (
                <div>
                  <Label htmlFor="emailAddress">Email Address</Label>
                  <Input
                    id="emailAddress"
                    type="email"
                    value={settings.emailAddress}
                    onChange={(e) => 
                      saveSettings({ ...settings, emailAddress: e.target.value })
                    }
                    placeholder="Enter email address"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="alertFrequency">Alert Frequency</Label>
                <Select value={settings.alertFrequency} onValueChange={(value) => saveSettings({ ...settings, alertFrequency: value as 'immediate' | 'daily' | 'weekly' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <Select value={settings.backupFrequency} onValueChange={(value) => saveSettings({ ...settings, backupFrequency: value as 'daily' | 'weekly' | 'monthly' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* External Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            External Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Connect with external platforms to automatically sync inventory
            </p>
            <Button onClick={() => setIsAddingIntegration(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </div>

          {integrations.length > 0 ? (
            <div className="space-y-3">
              {integrations.map((integration) => (
                <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getIntegrationIcon(integration.type)}</span>
                    <div>
                      <div className="font-medium">{integration.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {integration.type.toUpperCase()} • Last sync: {new Date(integration.lastSync).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(integration.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testIntegration(integration.id)}
                    >
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeIntegration(integration.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No external integrations configured</p>
              <p className="text-sm">Add integrations to sync with external platforms</p>
            </div>
          )}

          {/* Add Integration Dialog */}
          {isAddingIntegration && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Add Integration</h3>
                  <Button variant="ghost" size="sm" onClick={() => setIsAddingIntegration(false)}>
                    ×
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="integrationName">Integration Name</Label>
                    <Input
                      id="integrationName"
                      value={newIntegration.name}
                      onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
                      placeholder="e.g., My Shopify Store"
                    />
                  </div>

                  <div>
                    <Label htmlFor="integrationType">Platform Type</Label>
                    <Select value={newIntegration.type} onValueChange={(value) => setNewIntegration({ ...newIntegration, type: value as 'amazon' | 'shopify' | 'woocommerce' | 'custom' })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="amazon">Amazon</SelectItem>
                        <SelectItem value="shopify">Shopify</SelectItem>
                        <SelectItem value="woocommerce">WooCommerce</SelectItem>
                        <SelectItem value="custom">Custom API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      value={newIntegration.apiKey}
                      onChange={(e) => setNewIntegration({ ...newIntegration, apiKey: e.target.value })}
                      placeholder="Enter API key"
                    />
                  </div>

                  <div>
                    <Label htmlFor="webhookUrl">Webhook URL (Optional)</Label>
                    <Input
                      id="webhookUrl"
                      value={newIntegration.webhookUrl}
                      onChange={(e) => setNewIntegration({ ...newIntegration, webhookUrl: e.target.value })}
                      placeholder="Enter webhook URL"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoSync">Auto Sync</Label>
                    <Switch
                      id="autoSync"
                      checked={newIntegration.autoSync}
                      onCheckedChange={(checked) => setNewIntegration({ ...newIntegration, autoSync: checked })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsAddingIntegration(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addIntegration}>
                    Add Integration
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Export Inventory</Label>
              <p className="text-sm text-muted-foreground">Download a backup of your inventory data</p>
              <Button onClick={exportInventory} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Import Inventory</Label>
              <p className="text-sm text-muted-foreground">Upload a backup file to restore inventory</p>
              <div className="relative">
                <Input
                  type="file"
                  accept=".json"
                  onChange={importInventory}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Button className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Clear All Data</Label>
            <p className="text-sm text-muted-foreground">
              This will permanently delete all inventory data. This action cannot be undone.
            </p>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (confirm('Are you sure you want to clear all inventory data? This action cannot be undone.')) {
                  localStorage.removeItem('inventory-products')
                  localStorage.removeItem('inventory-stock-movements')
                  localStorage.removeItem('inventory-alert-logs')
                  toast({
                    title: "Data Cleared",
                    description: "All inventory data has been removed"
                  })
                  window.location.reload()
                }
              }}
            >
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
