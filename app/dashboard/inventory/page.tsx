import { Suspense } from "react"
import { createClient } from "@/utils/supabase/server"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import DashboardShell from "@/components/dashboard/dashboard-shell"
import { InventoryTable } from "@/components/inventory/inventory-table"
import { InventoryFilters } from "@/components/inventory/inventory-filters"
import { AddProductDialog } from "@/components/inventory/add-product-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

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
  const supabase = createClient()

  // Get user session and role
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session?.user?.id).single()

  const userRole = profile?.role || "staff"
  const canManageInventory = userRole === "admin" || userRole === "manager"

  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <DashboardHeader
          heading="Inventory Management"
          text="Manage your products, stock levels, and inventory data."
        />
        {canManageInventory && (
          <AddProductDialog>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </AddProductDialog>
        )}
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
