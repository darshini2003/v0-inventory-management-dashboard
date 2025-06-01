import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface Activity {
  id: string
  action: "create" | "update" | "delete"
  item_type: string
  item_name: string
  user_name: string
  created_at: string
}

// Simplify to always use mock data in preview
export async function RecentActivityTable() {
  // Always use mock data for preview environment
  const activities: Activity[] = [
    {
      id: "1",
      action: "create",
      item_type: "product",
      item_name: "Wireless Headphones",
      user_name: "John Doe",
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: "2",
      action: "update",
      item_type: "product",
      item_name: "Smart Watch",
      user_name: "Jane Smith",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: "3",
      action: "delete",
      item_type: "product",
      item_name: "USB Cable",
      user_name: "Mike Johnson",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: "4",
      action: "update",
      item_type: "order",
      item_name: "Order #1234",
      user_name: "Sarah Williams",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    },
    {
      id: "5",
      action: "create",
      item_type: "supplier",
      item_name: "Tech Solutions Inc.",
      user_name: "John Doe",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    },
  ]

  const getActionColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-emerald-500"
      case "update":
        return "bg-indigo-600"
      case "delete":
        return "bg-rose-500"
      default:
        return "bg-slate-500"
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case "create":
        return "Added"
      case "update":
        return "Updated"
      case "delete":
        return "Deleted"
      default:
        return action
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  <Badge className={getActionColor(activity.action)} variant="secondary">
                    {getActionLabel(activity.action)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{activity.item_name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{activity.item_type}</div>
                </TableCell>
                <TableCell>{activity.user_name}</TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
