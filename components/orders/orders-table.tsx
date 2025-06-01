import { createClient } from "@/utils/supabase/server"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  status: string
  total_amount: number
  created_at: string
  created_by: string
}

interface OrdersTableProps {
  searchParams: {
    search?: string
    status?: string
    page?: string
  }
  userRole: string
}

export async function OrdersTable({ searchParams, userRole }: OrdersTableProps) {
  const supabase = createClient()

  let query = supabase.from("orders").select("*")

  // Apply filters
  if (searchParams.search) {
    query = query.or(`order_number.ilike.%${searchParams.search}%,customer_name.ilike.%${searchParams.search}%`)
  }

  if (searchParams.status) {
    query = query.eq("status", searchParams.status)
  }

  const { data: orders, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
    return <div>Error loading orders</div>
  }

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

  const canManageOrders = userRole === "admin" || userRole === "manager"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders ({orders?.length || 0})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order: Order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono">{order.order_number}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{order.customer_name}</div>
                    <div className="text-sm text-muted-foreground">{order.customer_email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(order.status)} variant="secondary">
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                <TableCell>{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canManageOrders && (
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
