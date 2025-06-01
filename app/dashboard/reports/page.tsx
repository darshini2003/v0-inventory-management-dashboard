import { Suspense } from "react"
import { createClient } from "@/utils/supabase/server"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import DashboardShell from "@/components/dashboard/dashboard-shell"
import { ReportsOverview } from "@/components/reports/reports-overview"
import { InventoryReport } from "@/components/reports/inventory-report"
import { SalesReport } from "@/components/reports/sales-report"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function ReportsPage() {
  const supabase = createClient()

  // Get user session and role
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session?.user?.id).single()

  const userRole = profile?.role || "staff"

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Reports & Analytics"
        text="View detailed reports and analytics for your inventory system."
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Suspense fallback={<div>Loading overview...</div>}>
            <ReportsOverview />
          </Suspense>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Suspense fallback={<div>Loading inventory report...</div>}>
            <InventoryReport />
          </Suspense>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <Suspense fallback={<div>Loading sales report...</div>}>
            <SalesReport />
          </Suspense>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
