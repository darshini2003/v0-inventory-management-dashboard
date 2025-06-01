"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface AddSupplierDialogProps {
  children: React.ReactNode
}

export function AddSupplierDialog({ children }: AddSupplierDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("suppliers").insert({
        name: formData.get("name") as string,
        contact_person: formData.get("contact_person") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        address: formData.get("address") as string,
        status: formData.get("status") as string,
      })

      if (error) throw error

      // Log activity
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        await supabase.from("activities").insert({
          action: "create",
          item_type: "supplier",
          item_name: formData.get("name") as string,
          user_id: session.user.id,
          user_name: session.user.email || "Unknown",
        })
      }

      toast({
        title: "Supplier added",
        description: "The supplier has been successfully added.",
      })

      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error adding supplier:", error)
      toast({
        title: "Error",
        description: "Failed to add supplier. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
          <DialogDescription>Enter the supplier details to add them to your system.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Supplier Name *</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input id="contact_person" name="contact_person" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="active">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? "Adding..." : "Add Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
