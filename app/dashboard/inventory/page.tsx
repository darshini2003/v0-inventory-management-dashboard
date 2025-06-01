import { Suspense } from "react"
import { createClient } from "@/utils/supabase/server"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import DashboardShell from "@/components/dashboard/dashboard-shell"
import { InventoryTable } from "@/components/inventory/inventory-table"
import { InventoryFilters } from "@/components/inventory/inventory-filters"
import { AddProductDialog } from "@/components/inventory/add-product-dialog"
import { BarcodeScannerDialog } from "@/components/inventory/barcode-scanner-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Scan } from "lucide-react"

interface SearchParams {
  search?: string
  category?: string
  supplier?: string
  filter?: string
  page?: string
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  let userRole = "staff"
  let canManageInventory = false

  try {
    const supabase = await createClient()

    // Get user session and role
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.user?.id) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

      userRole = profile?.role || "staff"
      canManageInventory = userRole === "admin" || userRole === "manager"
    }
  } catch (error) {
    // In preview mode or if there's an error, default to demo data
    userRole = "admin"
    canManageInventory = true
  }

  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <DashboardHeader
          heading="Inventory Management"
          text="Manage your products, stock levels, and inventory data."
        />
        <div className="flex gap-2">
          <BarcodeScannerDialog>
            <Button
              variant="outline"
              className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200"
            >
              <Scan className="mr-2 h-4 w-4" />
              Scan Barcode
            </Button>
          </BarcodeScannerDialog>

          {canManageInventory && (
            <AddProductDialog>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </AddProductDialog>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <InventoryFilters />
        <Suspense fallback={<div>Loading inventory...</div>}>
          <InventoryTable searchParams={searchParams} canManage={canManageInventory} />
        </Suspense>
      </div>
    </DashboardShell>
  )
}
