"use client"

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Download, FileText, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface CSVProduct {
  name: string
  description: string
  sku: string
  price: string
  cost: string
  category: string
  stock: string
  minStock: string
  maxStock: string
  status: string
}

interface ValidationError {
  row: number
  field: string
  message: string
}

export default function CSVUpload() {
  const [csvData, setCsvData] = useState<CSVProduct[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive"
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      parseCSV(text)
    }
    reader.readAsText(file)
  }, [])

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      toast({
        title: "Invalid CSV",
        description: "CSV file must have at least a header and one data row",
        variant: "destructive"
      })
      return
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const requiredHeaders = ['name', 'sku', 'price']
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))

    if (missingHeaders.length > 0) {
      toast({
        title: "Missing Headers",
        description: `CSV must include: ${missingHeaders.join(', ')}`,
        variant: "destructive"
      })
      return
    }

    const products: CSVProduct[] = []
    const errors: ValidationError[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const product: CSVProduct = {
        name: values[headers.indexOf('name')] || '',
        description: values[headers.indexOf('description')] || '',
        sku: values[headers.indexOf('sku')] || '',
        price: values[headers.indexOf('price')] || '0',
        cost: values[headers.indexOf('cost')] || '0',
        category: values[headers.indexOf('category')] || '',
        stock: values[headers.indexOf('stock')] || '0',
        minStock: values[headers.indexOf('minstock')] || '0',
        maxStock: values[headers.indexOf('maxstock')] || '0',
        status: values[headers.indexOf('status')] || 'active'
      }

      // Validate product data
      if (!product.name.trim()) {
        errors.push({ row: i + 1, field: 'name', message: 'Product name is required' })
      }
      if (!product.sku.trim()) {
        errors.push({ row: i + 1, field: 'sku', message: 'SKU is required' })
      }
      if (isNaN(parseFloat(product.price)) || parseFloat(product.price) < 0) {
        errors.push({ row: i + 1, field: 'price', message: 'Price must be a valid number' })
      }
      if (product.stock && (isNaN(parseInt(product.stock)) || parseInt(product.stock) < 0)) {
        errors.push({ row: i + 1, field: 'stock', message: 'Stock must be a valid number' })
      }

      products.push(product)
    }

    setCsvData(products)
    setValidationErrors(errors)

    if (errors.length > 0) {
      toast({
        title: "Validation Errors",
        description: `Found ${errors.length} errors in the CSV file`,
        variant: "destructive"
      })
    } else {
      toast({
        title: "CSV Parsed",
        description: `Successfully parsed ${products.length} products`
      })
    }
  }

  const handleImport = async () => {
    if (validationErrors.length > 0) {
      toast({
        title: "Cannot Import",
        description: "Please fix validation errors before importing",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Get existing products
      const existingProducts = JSON.parse(localStorage.getItem('inventory-products') || '[]')
      
      // Convert CSV products to inventory format
      const newProducts = csvData.map((product, index) => {
        setUploadProgress((index / csvData.length) * 100)
        
        return {
          id: Date.now().toString() + index,
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
          cost: parseFloat(product.cost) || 0,
          sku: product.sku,
          category: product.category,
          stock: parseInt(product.stock) || 0,
          minStock: parseInt(product.minStock) || 0,
          maxStock: parseInt(product.maxStock) || 0,
          status: product.status === 'active' ? 'active' : 'inactive',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })

      // Merge with existing products
      const updatedProducts = [...existingProducts, ...newProducts]
      localStorage.setItem('inventory-products', JSON.stringify(updatedProducts))

      setUploadProgress(100)
      
      toast({
        title: "Import Successful",
        description: `Successfully imported ${newProducts.length} products`
      })

      // Reset form
      setCsvData([])
      setValidationErrors([])
      
    } catch {
      toast({
        title: "Import Failed",
        description: "An error occurred during import",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const downloadTemplate = () => {
    const template = [
      'name,description,sku,price,cost,category,stock,minstock,maxstock,status',
      'Sample Product 1,Description for product 1,SKU001,99.99,50.00,Electronics,100,10,500,active',
      'Sample Product 2,Description for product 2,SKU002,199.99,100.00,Clothing,50,5,200,active'
    ].join('\n')

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inventory-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Template Downloaded",
      description: "CSV template has been downloaded"
    })
  }

  const clearData = () => {
    setCsvData([])
    setValidationErrors([])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">CSV Import</h2>
          <p className="text-muted-foreground">Bulk import products from CSV file</p>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload CSV File
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csvFile">Select CSV File</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="cursor-pointer"
            />
            <p className="text-sm text-muted-foreground">
              Upload a CSV file with product data. Download the template for the correct format.
            </p>
          </div>

          {csvData.length > 0 && (
            <div className="flex gap-2">
              <Button onClick={handleImport} disabled={isUploading || validationErrors.length > 0}>
                {isUploading ? 'Importing...' : 'Import Products'}
              </Button>
              <Button variant="outline" onClick={clearData}>
                Clear Data
              </Button>
            </div>
          )}

          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Importing products...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Validation Errors ({validationErrors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {validationErrors.map((error, index) => (
                <Alert key={index} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Row {error.row}, {error.field}: {error.message}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Data */}
      {csvData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Preview Data ({csvData.length} products)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.slice(0, 10).map((product, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell>₹{parseFloat(product.price).toFixed(2)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                          {product.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {csvData.length > 10 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Showing first 10 products of {csvData.length} total
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>CSV Format Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Required Columns:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><strong>name</strong> - Product name (required)</li>
              <li><strong>sku</strong> - Product SKU (required)</li>
              <li><strong>price</strong> - Product price (required)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Optional Columns:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><strong>description</strong> - Product description</li>
              <li><strong>cost</strong> - Product cost</li>
              <li><strong>category</strong> - Product category</li>
              <li><strong>stock</strong> - Current stock quantity</li>
              <li><strong>minstock</strong> - Minimum stock level</li>
              <li><strong>maxstock</strong> - Maximum stock level</li>
              <li><strong>status</strong> - Product status (active/inactive)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Tips:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Use the template to ensure correct format</li>
              <li>All prices should be numbers (no currency symbols)</li>
              <li>SKUs should be unique</li>
              <li>Status should be either &quot;active&quot; or &quot;inactive&quot;</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
