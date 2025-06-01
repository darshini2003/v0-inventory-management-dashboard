import { Suspense } from "react"
import { createClient } from "@/utils/supabase/server"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import DashboardShell from "@/components/dashboard/dashboard-shell"
import { SuppliersTable } from "@/components/suppliers/suppliers-table"
import { SuppliersFilters } from "@/components/suppliers/suppliers-filters"
import { AddSupplierDialog } from "@/components/suppliers/add-supplier-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface SearchParams {
  search?: string
  status?: string
  page?: string
}

export default async function SuppliersPage({
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
  const canManageSuppliers = userRole === "admin" || userRole === "manager"

  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <DashboardHeader heading="Suppliers Management" text="Manage your suppliers and vendor relationships." />
        {canManageSuppliers && (
          <AddSupplierDialog>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </AddSupplierDialog>
        )}
      </div>

      <div className="space-y-6">
        <SuppliersFilters />
        <Suspense fallback={<div>Loading suppliers...</div>}>
          <SuppliersTable searchParams={searchParams} canManage={canManageSuppliers} />
        </Suspense>
      </div>
    </DashboardShell>
  )
}
