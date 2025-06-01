"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, AlertTriangle, Wifi, WifiOff, RefreshCw } from "lucide-react"
import { EditProductDialog } from "./edit-product-dialog"
import { DeleteProductDialog } from "./delete-product-dialog"
import { useRealtimeInventory } from "@/hooks/use-realtime"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  sku: string
  category: { name: string }
  supplier: { name: string }
  price: number
  quantity: number
  threshold: number
  unit: string
  updated_at: string
}

interface InventoryTableProps {
  searchParams: {
    search?: string
    category?: string
    supplier?: string
    filter?: string
    page?: string
  }
  canManage: boolean
}

export function InventoryTable({ searchParams, canManage }: InventoryTableProps) {
  const { toast } = useToast()
  const { products, loading, error, isConnected, lastUpdate, refetch } = useRealtimeInventory(searchParams)

  const getStockStatus = (quantity: number, threshold: number) => {
    if (quantity === 0) return { label: "Out of Stock", color: "bg-red-500" }
    if (quantity <= threshold) return { label: "Low Stock", color: "bg-amber-500" }
    return { label: "In Stock", color: "bg-emerald-500" }
  }

  const handleRefresh = async () => {
    try {
      await refetch()
      toast({
        title: "Data Refreshed",
        description: "Inventory data has been updated",
      })
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh inventory data",
        variant: "destructive",
      })
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading inventory: {error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Products ({products?.length || 0})
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" title="Real-time connected" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" title="Real-time disconnected" />
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastUpdate && (
              <span className="text-xs text-muted-foreground">Last updated: {lastUpdate.toLocaleTimeString()}</span>
            )}
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                {canManage && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((product: Product) => {
                const stockStatus = getStockStatus(product.quantity, product.threshold)
                return (
                  <TableRow key={product.id} className="group">
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>{product.category?.name}</TableCell>
                    <TableCell>{product.supplier?.name}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {product.quantity <= product.threshold && (
                          <AlertTriangle className="h-4 w-4 text-amber-500 animate-pulse" />
                        )}
                        <span className={product.quantity <= product.threshold ? "font-semibold text-amber-600" : ""}>
                          {product.quantity} {product.unit}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={stockStatus.color} variant="secondary">
                        {stockStatus.label}
                      </Badge>
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <EditProductDialog product={product}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </EditProductDialog>
                          <DeleteProductDialog productId={product.id} productName={product.name}>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DeleteProductDialog>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
              {products?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={canManage ? 8 : 7} className="text-center py-8 text-muted-foreground">
                    No products found matching your criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
