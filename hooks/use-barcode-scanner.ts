"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/utils/supabase/client"
import { getProductByBarcode, updateProductQuantity } from "@/lib/actions"

interface BarcodeScannerConfig {
  onScan?: (barcode: string, product?: any) => void
  onError?: (error: Error) => void
  formats?: string[]
  facingMode?: "user" | "environment"
}

interface ScanResult {
  text: string
  format: string
  timestamp: number
}

export function useBarcodeScanner({
  onScan,
  onError,
  formats = ["code_128", "code_39", "ean_13", "ean_8", "upc_a", "upc_e"],
  facingMode = "environment",
}: BarcodeScannerConfig = {}) {
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("")
  const [lastScan, setLastScan] = useState<ScanResult | null>(null)
  const [product, setProduct] = useState<any | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number>()
  const workerRef = useRef<Worker>()
  const { toast } = useToast()

  // Initialize barcode detection worker
  useEffect(() => {
    // Create a web worker for barcode detection to avoid blocking the main thread
    const workerCode = `
      // Simple barcode detection simulation
      // In a real implementation, you'd use a library like @zxing/library
      self.onmessage = function(e) {
        const { imageData, width, height } = e.data;
        
        // Simulate barcode detection with a delay
        setTimeout(() => {
          // Mock barcode detection - in reality this would analyze the image
          const mockBarcodes = [
            "1234567890123", "9780201379624", "0123456789012",
            "4901234567890", "8901234567890", "7890123456789"
          ];
          
          // Simulate finding a barcode 30% of the time
          if (Math.random() > 0.7) {
            const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
            self.postMessage({
              success: true,
              barcode: {
                text: randomBarcode,
                format: "EAN_13",
                timestamp: Date.now()
              }
            });
          } else {
            self.postMessage({ success: false });
          }
        }, 100);
      };
    `

    const blob = new Blob([workerCode], { type: "application/javascript" })
    workerRef.current = new Worker(URL.createObjectURL(blob))

    workerRef.current.onmessage = async (e) => {
      const { success, barcode } = e.data
      if (success && barcode) {
        // Avoid processing the same barcode multiple times in quick succession
        if (lastScan && lastScan.text === barcode.text && Date.now() - lastScan.timestamp < 2000) {
          return
        }

        setLastScan(barcode)
        setIsProcessing(true)

        try {
          // Look up product in Supabase
          const result = await getProductByBarcode(barcode.text)

          if (result.error) {
            throw new Error(result.error)
          }

          if (result.product) {
            setProduct(result.product)
            toast({
              title: "Product Found",
              description: `Found: ${result.product.name}`,
            })

            if (onScan) {
              onScan(barcode.text, result.product)
            }
          } else {
            toast({
              title: "Product Not Found",
              description: `No product found with barcode: ${barcode.text}`,
              variant: "destructive",
            })

            if (onScan) {
              onScan(barcode.text)
            }
          }
        } catch (error) {
          console.error("Error processing barcode:", error)
          toast({
            title: "Lookup Error",
            description: "Error looking up product",
            variant: "destructive",
          })

          if (onError) {
            onError(error as Error)
          }
        } finally {
          setIsProcessing(false)
        }
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
      }
    }
  }, [lastScan, onScan, onError, toast])

  // Get available camera devices
  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((device) => device.kind === "videoinput")
      setDevices(videoDevices)

      // Select back camera by default
      const backCamera = videoDevices.find(
        (device) =>
          device.label.toLowerCase().includes("back") ||
          device.label.toLowerCase().includes("rear") ||
          device.label.toLowerCase().includes("environment"),
      )

      if (backCamera) {
        setSelectedDeviceId(backCamera.deviceId)
      } else if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId)
      }
    } catch (error) {
      console.error("Error getting devices:", error)
      if (onError) onError(error as Error)
    }
  }, [onError])

  // Request camera permission
  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
      })
      stream.getTracks().forEach((track) => track.stop()) // Stop immediately, just checking permission
      setHasPermission(true)
      await getDevices()
    } catch (error) {
      setHasPermission(false)
      if (onError) onError(error as Error)
      toast({
        title: "Camera Permission Denied",
        description: "Please allow camera access to scan barcodes.",
        variant: "destructive",
      })
    }
  }, [facingMode, getDevices, onError, toast])

  // Start camera stream
  const startCamera = useCallback(async () => {
    if (!hasPermission) {
      await requestPermission()
      return
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          ...(selectedDeviceId && { deviceId: selectedDeviceId }),
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setIsScanning(true)
        startDetection()
      }
    } catch (error) {
      console.error("Error starting camera:", error)
      if (onError) onError(error as Error)
      toast({
        title: "Camera Error",
        description: "Failed to start camera. Please check your device.",
        variant: "destructive",
      })
    }
  }, [hasPermission, requestPermission, facingMode, selectedDeviceId, onError, toast])

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    setIsScanning(false)
  }, [])

  // Start barcode detection
  const startDetection = useCallback(() => {
    const detectBarcode = () => {
      if (!videoRef.current || !canvasRef.current || !isScanning || isProcessing) {
        animationRef.current = requestAnimationFrame(detectBarcode)
        return
      }

      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Get image data for barcode detection
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

        // Send to worker for processing
        if (workerRef.current) {
          workerRef.current.postMessage({
            imageData: imageData.data,
            width: canvas.width,
            height: canvas.height,
          })
        }
      }

      animationRef.current = requestAnimationFrame(detectBarcode)
    }

    detectBarcode()
  }, [isScanning, isProcessing])

  // Switch camera device
  const switchCamera = useCallback(
    (deviceId: string) => {
      setSelectedDeviceId(deviceId)
      if (isScanning) {
        stopCamera()
        setTimeout(() => startCamera(), 100)
      }
    },
    [isScanning, stopCamera, startCamera],
  )

  // Update product quantity
  const updateQuantity = useCallback(
    async (productId: string, quantity: number, operation: "add" | "remove", barcode?: string) => {
      setIsProcessing(true)

      try {
        const result = await updateProductQuantity(productId, quantity, operation, barcode)

        if (result.error) {
          throw new Error(result.error)
        }

        toast({
          title: "Quantity Updated",
          description: `${operation === "add" ? "Added" : "Removed"} ${quantity} units ${operation === "add" ? "to" : "from"} inventory`,
        })

        return { success: true, newQuantity: result.newQuantity }
      } catch (error) {
        console.error("Error updating quantity:", error)
        toast({
          title: "Update Error",
          description: "Failed to update product quantity",
          variant: "destructive",
        })
        return { success: false, error }
      } finally {
        setIsProcessing(false)
      }
    },
    [toast],
  )

  // Manual barcode lookup
  const lookupBarcode = useCallback(
    async (barcode: string) => {
      if (!barcode.trim()) return { success: false }

      setIsProcessing(true)

      try {
        const result = await getProductByBarcode(barcode)

        if (result.error) {
          throw new Error(result.error)
        }

        if (result.product) {
          setProduct(result.product)
          setLastScan({
            text: barcode,
            format: "MANUAL",
            timestamp: Date.now(),
          })

          toast({
            title: "Product Found",
            description: `Found: ${result.product.name}`,
          })

          if (onScan) {
            onScan(barcode, result.product)
          }

          return { success: true, product: result.product }
        } else {
          toast({
            title: "Product Not Found",
            description: `No product found with barcode: ${barcode}`,
            variant: "destructive",
          })

          return { success: false, notFound: true }
        }
      } catch (error) {
        console.error("Error looking up barcode:", error)
        toast({
          title: "Lookup Error",
          description: "Error looking up product",
          variant: "destructive",
        })

        if (onError) {
          onError(error as Error)
        }

        return { success: false, error }
      } finally {
        setIsProcessing(false)
      }
    },
    [onScan, onError, toast],
  )

  // Get recent scans
  const getRecentScans = useCallback(async (limit = 5) => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("barcode_scans")
        .select(`
          barcode,
          product:products(id, name)
        `)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error

      return data
    } catch (error) {
      console.error("Error fetching recent scans:", error)
      return []
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return {
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
  }
}
