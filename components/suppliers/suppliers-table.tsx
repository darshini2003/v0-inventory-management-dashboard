import { createClient } from "@/utils/supabase/server"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Mail, Phone } from "lucide-react"
import { EditSupplierDialog } from "./edit-supplier-dialog"
import { DeleteSupplierDialog } from "./delete-supplier-dialog"

interface Supplier {
  id: string
  name: string
  contact_person: string
  email: string
  phone: string
  address: string
  status: string
  created_at: string
}

interface SuppliersTableProps {
  searchParams: {
    search?: string
    status?: string
    page?: string
  }
  canManage: boolean
}

export async function SuppliersTable({ searchParams, canManage }: SuppliersTableProps) {
  const supabase = createClient()

  let query = supabase.from("suppliers").select("*")

  // Apply filters
  if (searchParams.search) {
    query = query.or(`name.ilike.%${searchParams.search}%,contact_person.ilike.%${searchParams.search}%`)
  }

  if (searchParams.status) {
    query = query.eq("status", searchParams.status)
  }

  const { data: suppliers, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching suppliers:", error)
    return <div>Error loading suppliers</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500"
      case "inactive":
        return "bg-slate-500"
      case "suspended":
        return "bg-red-500"
      default:
        return "bg-slate-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suppliers ({suppliers?.length || 0})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              {canManage && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers?.map((supplier: Supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>
                  <div className="font-medium">{supplier.name}</div>
                </TableCell>
                <TableCell>{supplier.contact_person}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {supplier.email && (
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {supplier.email}
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {supplier.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate">{supplier.address}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(supplier.status)} variant="secondary">
                    {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                  </Badge>
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <EditSupplierDialog supplier={supplier}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </EditSupplierDialog>
                      <DeleteSupplierDialog supplierId={supplier.id} supplierName={supplier.name}>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DeleteSupplierDialog>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
