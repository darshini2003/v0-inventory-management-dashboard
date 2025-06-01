import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

export async function SalesReport() {
  const supabase = createClient()

  // Get recent orders with items
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      order_items(
        *,
        product:products(name)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(20)

  // Calculate totals
  const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
  const totalOrders = orders?.length || 0
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500"
      case "processing":
        return "bg-blue-500"
      case "shipped":
        return "bg-indigo-500"
      case "delivered":
        return "bg-emerald-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-slate-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${averageOrderValue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono">{order.order_number}</TableCell>
                  <TableCell>
                    <div className="font-medium">{order.customer_name}</div>
                    <div className="text-sm text-muted-foreground">{order.customer_email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{order.order_items?.length || 0} items</div>
                  </TableCell>
                  <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)} variant="secondary">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
