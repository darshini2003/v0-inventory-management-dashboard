import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"

export async function InventoryReport() {
  const supabase = createClient()

  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(name),
      supplier:suppliers(name)
    `)
    .order("quantity", { ascending: true })

  const lowStockProducts = products?.filter((p) => p.quantity <= p.threshold) || []
  const outOfStockProducts = products?.filter((p) => p.quantity === 0) || []

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{products?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-amber-600">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{lowStockProducts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-red-600">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{outOfStockProducts.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Low Stock Items</CardTitle>
          <CardDescription>Products that need restocking</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">{product.sku}</div>
                  </TableCell>
                  <TableCell>{product.category?.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {product.quantity === 0 && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      {product.quantity} {product.unit}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.threshold} {product.unit}
                  </TableCell>
                  <TableCell>
                    <Badge className={product.quantity === 0 ? "bg-red-500" : "bg-amber-500"} variant="secondary">
                      {product.quantity === 0 ? "Out of Stock" : "Low Stock"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
