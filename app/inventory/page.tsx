import { Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProductCatalog from "@/components/inventory/product-catalog"
import StockTracking from "@/components/inventory/stock-tracking"
import LowStockAlerts from "@/components/inventory/low-stock-alerts"
import StockLogs from "@/components/inventory/stock-logs"
import InventorySettings from "@/components/inventory/inventory-settings"
import CSVUpload from "@/components/inventory/csv-upload"
import { Package, TrendingUp, AlertTriangle, History, Settings, Upload } from "lucide-react"

export default function InventoryPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your products, track stock levels, and monitor inventory health</p>
        </div>
      </div>

      <Tabs defaultValue="catalog" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="catalog" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Product Catalog
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Stock Tracking
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Low Stock Alerts
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Stock Logs
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            CSV Upload
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-6">
          <Suspense fallback={<div>Loading product catalog...</div>}>
            <ProductCatalog />
          </Suspense>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <Suspense fallback={<div>Loading stock tracking...</div>}>
            <StockTracking />
          </Suspense>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Suspense fallback={<div>Loading alerts...</div>}>
            <LowStockAlerts />
          </Suspense>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Suspense fallback={<div>Loading stock logs...</div>}>
            <StockLogs />
          </Suspense>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Suspense fallback={<div>Loading CSV upload...</div>}>
            <CSVUpload />
          </Suspense>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Suspense fallback={<div>Loading settings...</div>}>
            <InventorySettings />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
