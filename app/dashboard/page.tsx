import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DashboardSummaryCards } from "@/components/dashboard/dashboard-summary-cards"
import { InventoryChart } from "@/components/dashboard/inventory-chart"
import { RecentActivityTable } from "@/components/dashboard/recent-activity-table"
import { QuickScan } from "@/components/dashboard/quick-scan"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="w-full">
        <h1 className="text-3xl font-bold mb-4 text-white">Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <DashboardSummaryCards />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <InventoryChart />
          </div>
          <div className="col-span-3 space-y-4">
            <QuickScan />
            <RecentActivityTable />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
