"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface DeleteSupplierDialogProps {
  children: React.ReactNode
  supplierId: string
  supplierName: string
}

export function DeleteSupplierDialog({ children, supplierId, supplierName }: DeleteSupplierDialogProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("suppliers").delete().eq("id", supplierId)

      if (error) throw error

      // Log activity
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        await supabase.from("activities").insert({
          action: "delete",
          item_type: "supplier",
          item_name: supplierName,
          user_id: session.user.id,
          user_name: session.user.email || "Unknown",
        })
      }

      toast({
        title: "Supplier deleted",
        description: "The supplier has been successfully deleted.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error deleting supplier:", error)
      toast({
        title: "Error",
        description: "Failed to delete supplier. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the supplier "{supplierName}" from your system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-red-600 hover:bg-red-700">
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
