import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Package, ShoppingCart, Building } from "lucide-react"

// Simplify the data fetching to avoid complex Supabase calls in preview
export async function DashboardSummaryCards() {
  // Always use mock data for preview environment to avoid errors
  const totalItems = 1247
  const lowStockItems = Array(8).fill(null) // 8 low stock items
  const recentOrders = Array(23).fill(null) // 23 recent orders
  const activeSuppliers = Array(12).fill(null) // 12 active suppliers
  const totalValue = 284750
  const percentChange = 12.5

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
          <div className="flex items-center text-xs">
            <span className={percentChange >= 0 ? "text-emerald-500" : "text-rose-500"}>
              {percentChange >= 0 ? "↑" : "↓"} {Math.abs(percentChange).toFixed(1)}%
            </span>
            <span className="ml-1 text-muted-foreground">vs. last month</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{totalItems} items in stock</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{lowStockItems.length}</div>
          <p className="text-xs text-muted-foreground">Items below threshold</p>
          <div className="mt-2">
            <a href="/dashboard/inventory?filter=low-stock" className="text-xs text-indigo-600 hover:underline">
              View restock list →
            </a>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{recentOrders.length}</div>
          <p className="text-xs text-muted-foreground">In the last 7 days</p>
          <div className="mt-2">
            <a href="/dashboard/orders" className="text-xs text-indigo-600 hover:underline">
              View all orders →
            </a>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeSuppliers.length}</div>
          <p className="text-xs text-muted-foreground">Registered suppliers</p>
          <div className="mt-2">
            <a href="/dashboard/suppliers" className="text-xs text-indigo-600 hover:underline">
              Manage suppliers →
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
