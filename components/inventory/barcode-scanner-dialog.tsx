"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useBarcodeScanner } from "@/hooks/use-barcode-scanner"
import { useRouter } from "next/navigation"
import { Camera, CameraOff, RotateCcw, Search, Package, Wifi, WifiOff } from "lucide-react"

interface BarcodeScannerDialogProps {
  children: React.ReactNode
}

interface Product {
  id: string
  name: string
  sku: string
  barcode?: string
  quantity: number
  unit: string
  price: number
  threshold: number
  category?: { name: string }
  supplier?: { name: string }
}

export function BarcodeScannerDialog({ children }: BarcodeScannerDialogProps) {
  const [open, setOpen] = useState(false)
  const [manualBarcode, setManualBarcode] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [operation, setOperation] = useState<"add" | "remove">("add")
  const [recentScans, setRecentScans] = useState<any[]>([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const { toast } = useToast()
  const router = useRouter()

  // Handle barcode scan
  const handleScan = async (barcode: string, product: any) => {
    // Product is already set in the hook
  }

  const {
    isScanning,
    hasPermission,
    devices,
    selectedDeviceId,
    lastScan,
    product,
    isProcessing,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    switchCamera,
    requestPermission,
    updateQuantity,
    lookupBarcode,
    getRecentScans,
  } = useBarcodeScanner({
    onScan: handleScan,
    onError: (error) => {
      console.error("Scanner error:", error)
      toast({
        title: "Scanner Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Handle manual barcode entry
  const handleManualEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (manualBarcode.trim()) {
      await lookupBarcode(manualBarcode.trim())
    }
  }

  // Update product quantity
  const handleUpdateQuantity = async () => {
    if (!product) return

    try {
      const result = await updateQuantity(
        product.id,
        quantity,
        operation,
        product.barcode
      )

      if (result.success) {
        // Reset and close
        resetDialog()
        router.refresh()
      }
    } catch (error) {
      console.error("Error updating quantity:", error)
    }
  }

  // Reset dialog state
  const resetDialog = () => {
    setManualBarcode("")
    setQuantity(1)
    setOperation("add")
    stopCamera()
    setOpen(false)
  }

  // Load recent scans
  const loadRecentScans = async () => {
    const scans = await getRecentScans(5)
    setRecentScans(scans || [])
  }

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Handle dialog open
  useEffect(() => {
    if (open) {
      loadRecentScans()
    }
  }, [open])

  // Handle dialog close
  useEffect(() => {
    if (!open) {
      resetDialog()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Barcode Scanner
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500 ml-2" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500 ml-2" />
            )}
          </DialogTitle>
          <DialogDescription>Scan a product barcode or enter manually to quickly update inventory.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!product ? (
            <div className="space-y-4">
              {/* Camera Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Camera Scanner</h3>
                  <div className="flex gap-2">
                    {devices.length > 1 && (
                      <Select value={selectedDeviceId} onValueChange={switchCamera}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select camera" />
                        </SelectTrigger>
                        <SelectContent>
                          {devices.map((device) => (
                            <SelectItem key={device.deviceId} value={device.deviceId}>
                              {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                {hasPermission === null ? (
                  <div className="text-center py-8">
                    <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">Camera permission required for scanning</p>
                    <Button onClick={requestPermission}>Request Camera Access</Button>
                  </div>
                ) : hasPermission === false ? (
                  <div className="text-center py-8">
                    <CameraOff className="h-12 w-12 mx-auto text-destructive mb-4" />
                    <p className="text-destructive mb-4">Camera access denied</p>
                    <Button variant="outline" onClick={requestPermission}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {isScanning ? (
                      <div className="relative">
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-black">
                          <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
                          <canvas ref={canvasRef} className="absolute inset-0 hidden" />

                          {/* Scanning overlay */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                              <div className="h-48 w-64 border-2 border-dashed border-white/70 rounded-lg"></div>
                              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent animate-pulse"></div>
                            </div>
                          </div>

                          {/* Status indicator */}
                          <div className="absolute top-4 right-4">
                            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                              Scanning...
                            </Badge>
                          </div>

                          {/* Processing indicator */}
                          {isProcessing && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="bg-background p-4 rounded-lg shadow-lg">
                                <p className="text-center">Processing barcode...</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <Button variant="outline" onClick={stopCamera} className="w-full">
                          <CameraOff className="mr-2 h-4 w-4" />
                          Stop Scanning
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <Button 
                          onClick={startCamera} 
                          className="bg-indigo-600 hover:bg-indigo-700"
                          disabled={!isOnline}
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Start Camera Scan
                        </Button>
                        {!isOnline && (
                          <p className="text-destructive text-sm mt-2">
                            Camera scanning requires an internet connection
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Manual Entry Section */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or enter manually</span>
                </div>
              </div>

              <form onSubmit={handleManualEntry} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="barcode"
                      value={manualBarcode}
                      onChange={(e) => setManualBarcode(e.target.value)}
                      placeholder="Enter barcode number"
                      className="font-mono"
                    />
                    <Button 
                      type="submit" 
                      disabled={!manualBarcode.trim() || isProcessing || !isOnline}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      {isProcessing ? "Searching..." : "Search"}
                    </Button>
                  </div>
                </div>
              </form>

              {/* Recent Scans */}
              {recentScans
