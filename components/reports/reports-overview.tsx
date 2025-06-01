import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, TrendingDown, Package, DollarSign } from "lucide-react"

export async function ReportsOverview() {
  const supabase = createClient()

  // Fetch key metrics
  const [{ count: totalProducts }, { data: lowStockProducts }, { data: recentOrders }, { data: inventoryValue }] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("products").select("id").lt("quantity", "threshold"),
      supabase
        .from("orders")
        .select("total_amount")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from("products").select("price, quantity"),
    ])

  const totalInventoryValue = inventoryValue?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0
  const monthlyRevenue = recentOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">{lowStockProducts?.length || 0} below threshold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalInventoryValue.toLocaleString()}</div>
            <p className="text-xs text-emerald-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-emerald-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Package className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts?.length || 0}</div>
            <p className="text-xs text-amber-600 flex items-center">
              <TrendingDown className="h-3 w-3 mr-1" />
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Generate and download reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Inventory Report
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Sales Report
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Low Stock Report
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Supplier Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
