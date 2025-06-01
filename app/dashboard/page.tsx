import { Suspense } from "react"

import DashboardHeader from "@/components/dashboard/dashboard-header"
import DashboardShell from "@/components/dashboard/dashboard-shell"
import { DashboardSummaryCards } from "@/components/dashboard/dashboard-summary-cards"
import { InventoryChart } from "@/components/dashboard/inventory-chart"
import { RecentActivityTable } from "@/components/dashboard/recent-activity-table"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"

// Simplify the dashboard page to avoid complex async operations
export default async function DashboardPage() {
  // Use demo data for preview environment
  const userRole = "admin" // Default role for preview

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Overview of your inventory management system." />
      <div className="grid gap-6">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardSummaryCards />
        </Suspense>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-1 md:col-span-2 lg:col-span-5">
            <Suspense
              fallback={
                <div className="h-[350px] rounded-xl border border-dashed flex items-center justify-center">
                  Loading chart...
                </div>
              }
            >
              <InventoryChart />
            </Suspense>
          </div>
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <QuickActions userRole={userRole} />
          </div>
        </div>

        <Suspense
          fallback={
            <div className="h-[350px] rounded-xl border border-dashed flex items-center justify-center">
              Loading activity...
            </div>
          }
        >
          <RecentActivityTable />
        </Suspense>
      </div>
    </DashboardShell>
  )
}
