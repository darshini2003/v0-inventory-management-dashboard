import { Suspense } from "react"
import { createClient } from "@/utils/supabase/server"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import DashboardShell from "@/components/dashboard/dashboard-shell"
import { OrdersTable } from "@/components/orders/orders-table"
import { OrdersFilters } from "@/components/orders/orders-filters"
import { CreateOrderDialog } from "@/components/orders/create-order-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface SearchParams {
  search?: string
  status?: string
  page?: string
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createClient()

  // Get user session and role
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session?.user?.id).single()

  const userRole = profile?.role || "staff"

  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <DashboardHeader heading="Orders Management" text="Manage customer orders and track order status." />
        <CreateOrderDialog>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Order
          </Button>
        </CreateOrderDialog>
      </div>

      <div className="space-y-6">
        <OrdersFilters />
        <Suspense fallback={<div>Loading orders...</div>}>
          <OrdersTable searchParams={searchParams} userRole={userRole} />
        </Suspense>
      </div>
    </DashboardShell>
  )
}
