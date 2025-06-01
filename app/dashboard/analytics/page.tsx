import { Suspense } from "react"
import { createClient } from "@/utils/supabase/server"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import DashboardShell from "@/components/dashboard/dashboard-shell"
import { AnalyticsOverview } from "@/components/analytics/analytics-overview"
import { InventoryTrends } from "@/components/analytics/inventory-trends"
import { ProductPerformance } from "@/components/analytics/product-performance"
import { SalesAnalytics } from "@/components/analytics/sales-analytics"
import { SupplierAnalytics } from "@/components/analytics/supplier-analytics"
import { PredictiveAnalytics } from "@/components/analytics/predictive-analytics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/analytics/date-range-picker"
import { AnalyticsFilters } from "@/components/analytics/analytics-filters"

export default async function AnalyticsPage() {
  const supabase = createClient()

  // Get user session and role
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session?.user?.id).single()

    const userRole = profile?.role || "staff"

    return (
      <DashboardShell>
        <DashboardHeader
          heading="Analytics & Insights"
          text="Comprehensive analytics and insights for your inventory management."
        >
          <div className="flex items-center gap-4">
            <DateRangePicker />
            <AnalyticsFilters />
          </div>
        </DashboardHeader>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-black/20 backdrop-blur-sm border border-white/10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/10">
              Overview
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-white/10">
              Trends
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-white/10">
              Products
            </TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:bg-white/10">
              Sales
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="data-[state=active]:bg-white/10">
              Suppliers
            </TabsTrigger>
            <TabsTrigger value="forecasting" className="data-[state=active]:bg-white/10">
              Forecasting
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Suspense fallback={<div className="animate-pulse">Loading analytics overview...</div>}>
              <AnalyticsOverview />
            </Suspense>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Suspense fallback={<div className="animate-pulse">Loading inventory trends...</div>}>
              <InventoryTrends />
            </Suspense>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Suspense fallback={<div className="animate-pulse">Loading product performance...</div>}>
              <ProductPerformance />
            </Suspense>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <Suspense fallback={<div className="animate-pulse">Loading sales analytics...</div>}>
              <SalesAnalytics />
            </Suspense>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-6">
            <Suspense fallback={<div className="animate-pulse">Loading supplier analytics...</div>}>
              <SupplierAnalytics />
            </Suspense>
          </TabsContent>

          <TabsContent value="forecasting" className="space-y-6">
            <Suspense fallback={<div className="animate-pulse">Loading predictive analytics...</div>}>
              <PredictiveAnalytics />
            </Suspense>
          </TabsContent>
        </Tabs>
      </DashboardShell>
    )
  } catch (error) {
    // Fallback for preview mode
    return (
      <DashboardShell>
        <DashboardHeader
          heading="Analytics & Insights"
          text="Comprehensive analytics and insights for your inventory management."
        />
        <div className="text-center py-8">
          <p className="text-muted-foreground">Analytics dashboard (Preview Mode)</p>
        </div>
      </DashboardShell>
    )
  }
}
