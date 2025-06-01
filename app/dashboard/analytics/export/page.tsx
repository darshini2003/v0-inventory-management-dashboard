import { Suspense } from "react"
import { createClient } from "@/utils/supabase/server"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import DashboardShell from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExportDataTable } from "@/components/analytics/export-data-table"
import { DateRangePicker } from "@/components/analytics/date-range-picker"
import { AnalyticsFilters } from "@/components/analytics/analytics-filters"
import { FileSpreadsheet, Package, ShoppingCart, Users } from "lucide-react"

export default async function AnalyticsExportPage() {
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
          heading="Export Analytics Data"
          text="Export inventory, sales, and supplier data in various formats."
        >
          <div className="flex items-center gap-4">
            <DateRangePicker />
            <AnalyticsFilters />
          </div>
        </DashboardHeader>

        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/20 backdrop-blur-sm border border-white/10">
            <TabsTrigger value="inventory" className="data-[state=active]:bg-white/10">
              <Package className="mr-2 h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:bg-white/10">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Sales
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="data-[state=active]:bg-white/10">
              <Users className="mr-2 h-4 w-4" />
              Suppliers
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-white/10">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              All Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Package className="mr-2 h-5 w-5 text-blue-400" />
                  Inventory Data Export
                </CardTitle>
                <CardDescription className="text-white/60">
                  Export detailed inventory data including stock levels, categories, and product information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="animate-pulse">Loading inventory data...</div>}>
                  <ExportDataTable
                    type="inventory"
                    description="This export includes all product data, stock levels, categories, and inventory metrics."
                  />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5 text-green-400" />
                  Sales Data Export
                </CardTitle>
                <CardDescription className="text-white/60">
                  Export sales data including orders, revenue, and customer information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="animate-pulse">Loading sales data...</div>}>
                  <ExportDataTable
                    type="sales"
                    description="This export includes all order data, sales metrics, revenue, and customer information."
                  />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="mr-2 h-5 w-5 text-purple-400" />
                  Supplier Data Export
                </CardTitle>
                <CardDescription className="text-white/60">
                  Export supplier data including contact information and performance metrics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="animate-pulse">Loading supplier data...</div>}>
                  <ExportDataTable
                    type="suppliers"
                    description="This export includes all supplier data, contact information, and performance metrics."
                  />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileSpreadsheet className="mr-2 h-5 w-5 text-amber-400" />
                  Complete Data Export
                </CardTitle>
                <CardDescription className="text-white/60">
                  Export all data including inventory, sales, suppliers, and analytics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="animate-pulse">Loading all data...</div>}>
                  <ExportDataTable
                    type="all"
                    description="This export includes all system data in a comprehensive format. The export may take longer to generate due to the large amount of data."
                  />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardShell>
    )
  } catch (error) {
    // Fallback for preview mode
    return (
      <DashboardShell>
        <DashboardHeader
          heading="Export Analytics Data"
          text="Export inventory, sales, and supplier data in various formats."
        />
        <div className="text-center py-8">
          <p className="text-muted-foreground">Export functionality (Preview Mode)</p>
        </div>
      </DashboardShell>
    )
  }
}
