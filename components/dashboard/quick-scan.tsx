"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Scan, Search, Package, AlertTriangle, CheckCircle } from "lucide-react"

interface ScannedProduct {
  id: string
  name: string
  sku: string
  quantity: number
  status: "in-stock" | "low-stock" | "out-of-stock"
  location: string
}

export function QuickScan() {
  const [scanInput, setScanInput] = useState("")
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  const mockProducts: Record<string, ScannedProduct> = {
    "123456789": {
      id: "1",
      name: "Wireless Bluetooth Headphones",
      sku: "WBH-001",
      quantity: 45,
      status: "in-stock",
      location: "A1-B2",
    },
    "987654321": {
      id: "2",
      name: "USB-C Cable 2m",
      sku: "USB-C-2M",
      quantity: 8,
      status: "low-stock",
      location: "C3-D1",
    },
    "456789123": {
      id: "3",
      name: "Smartphone Case",
      sku: "SC-PRO-001",
      quantity: 0,
      status: "out-of-stock",
      location: "B2-A3",
    },
  }

  const handleScan = () => {
    if (!scanInput.trim()) return

    setIsScanning(true)

    // Simulate scanning delay
    setTimeout(() => {
      const product = mockProducts[scanInput.trim()]
      setScannedProduct(product || null)
      setIsScanning(false)
    }, 1000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-stock":
        return "bg-green-100 text-green-800 border-green-200"
      case "low-stock":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "out-of-stock":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in-stock":
        return <CheckCircle className="h-4 w-4" />
      case "low-stock":
        return <AlertTriangle className="h-4 w-4" />
      case "out-of-stock":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Quick Scan
        </CardTitle>
        <CardDescription>Scan or enter a barcode to check inventory</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter barcode (try: 123456789)"
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleScan()}
          />
          <Button
            onClick={handleScan}
            disabled={isScanning || !scanInput.trim()}
            size="icon"
            className="relative overflow-hidden"
          >
            {isScanning ? (
              <div className="relative">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <div className="absolute inset-0 h-4 w-4 animate-pulse rounded-full border border-current opacity-30" />
              </div>
            ) : (
              <Search className="h-4 w-4 transition-transform group-hover:scale-110" />
            )}
            {isScanning && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            )}
          </Button>
        </div>

        {scannedProduct && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">{scannedProduct.name}</h4>
                <p className="text-sm text-muted-foreground">SKU: {scannedProduct.sku}</p>
              </div>
              <Badge className={getStatusColor(scannedProduct.status)}>
                {getStatusIcon(scannedProduct.status)}
                <span className="ml-1 capitalize">{scannedProduct.status.replace("-", " ")}</span>
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Quantity:</span>
                <span className="ml-2 font-medium">{scannedProduct.quantity}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Location:</span>
                <span className="ml-2 font-medium">{scannedProduct.location}</span>
              </div>
            </div>
          </div>
        )}

        {scanInput && !scannedProduct && !isScanning && (
          <div className="text-center py-4 text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Product not found</p>
            <p className="text-xs">Try: 123456789, 987654321, or 456789123</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
