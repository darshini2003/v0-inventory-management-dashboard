import { createClient } from "@/utils/supabase/server"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, AlertTriangle } from "lucide-react"
import { EditProductDialog } from "./edit-product-dialog"
import { DeleteProductDialog } from "./delete-product-dialog"

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

export async function InventoryTable({ searchParams, canManage }: InventoryTableProps) {
  const supabase = createClient()

  let query = supabase.from("products").select(`
      *,
      category:categories(name),
      supplier:suppliers(name)
    `)

  // Apply filters
  if (searchParams.search) {
    query = query.or(`name.ilike.%${searchParams.search}%,sku.ilike.%${searchParams.search}%`)
  }

  if (searchParams.category) {
    query = query.eq("category.name", searchParams.category)
  }

  if (searchParams.supplier) {
    query = query.eq("supplier.name", searchParams.supplier)
  }

  if (searchParams.filter === "low-stock") {
    query = query.lt("quantity", "threshold")
  }

  const { data: products, error } = await query.order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    return <div>Error loading products</div>
  }

  const getStockStatus = (quantity: number, threshold: number) => {
    if (quantity === 0) return { label: "Out of Stock", color: "bg-red-500" }
    if (quantity <= threshold) return { label: "Low Stock", color: "bg-amber-500" }
    return { label: "In Stock", color: "bg-emerald-500" }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products ({products?.length || 0})</CardTitle>
      </CardHeader>
      <CardContent>
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
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell>{product.category?.name}</TableCell>
                  <TableCell>{product.supplier?.name}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {product.quantity <= product.threshold && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                      {product.quantity} {product.unit}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={stockStatus.color} variant="secondary">
                      {stockStatus.label}
                    </Badge>
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
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
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
