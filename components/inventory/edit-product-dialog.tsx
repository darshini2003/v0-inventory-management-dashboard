"use client"

import type React from "react"

import { useState, useEffect } from "react"
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

interface Product {
  id: string
  name: string
  description?: string
  sku: string
  barcode?: string
  category_id?: string
  supplier_id?: string
  price: number
  cost?: number
  quantity: number
  threshold: number
  unit: string
}

interface EditProductDialogProps {
  children: React.ReactNode
  product: Product
}

export function EditProductDialog({ children, product }: EditProductDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string }>>([])
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      const [categoriesRes, suppliersRes] = await Promise.all([
        supabase.from("categories").select("id, name").order("name"),
        supabase.from("suppliers").select("id, name").order("name"),
      ])

      if (categoriesRes.data) setCategories(categoriesRes.data)
      if (suppliersRes.data) setSuppliers(suppliersRes.data)
    }

    if (open) {
      fetchData()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("products")
        .update({
          name: formData.get("name") as string,
          description: formData.get("description") as string,
          sku: formData.get("sku") as string,
          barcode: formData.get("barcode") as string,
          category_id: formData.get("category") as string,
          supplier_id: formData.get("supplier") as string,
          price: Number.parseFloat(formData.get("price") as string),
          cost: Number.parseFloat(formData.get("cost") as string),
          quantity: Number.parseInt(formData.get("quantity") as string),
          threshold: Number.parseInt(formData.get("threshold") as string),
          unit: formData.get("unit") as string,
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id)

      if (error) throw error

      // Log activity
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        await supabase.from("activities").insert({
          action: "update",
          item_type: "product",
          item_name: formData.get("name") as string,
          user_id: session.user.id,
          user_name: session.user.email || "Unknown",
        })
      }

      toast({
        title: "Product updated",
        description: "The product has been successfully updated.",
      })

      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update the product details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" name="name" defaultValue={product.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input id="sku" name="sku" defaultValue={product.sku} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={product.description || ""} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue={product.category_id || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Select name="supplier" defaultValue={product.supplier_id || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Selling Price *</Label>
                <Input id="price" name="price" type="number" step="0.01" defaultValue={product.price} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Cost Price</Label>
                <Input id="cost" name="cost" type="number" step="0.01" defaultValue={product.cost || ""} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input id="quantity" name="quantity" type="number" defaultValue={product.quantity} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold">Low Stock Threshold</Label>
                <Input id="threshold" name="threshold" type="number" defaultValue={product.threshold} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" name="unit" defaultValue={product.unit} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input id="barcode" name="barcode" defaultValue={product.barcode || ""} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? "Updating..." : "Update Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
