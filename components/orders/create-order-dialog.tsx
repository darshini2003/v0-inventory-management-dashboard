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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2 } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  quantity: number
}

interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface CreateOrderDialogProps {
  children: React.ReactNode
}

export function CreateOrderDialog({ children }: CreateOrderDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("products")
        .select("id, name, price, quantity")
        .gt("quantity", 0)
        .order("name")

      if (data) setProducts(data)
    }

    if (open) {
      fetchProducts()
    }
  }, [open])

  const addOrderItem = () => {
    setOrderItems([
      ...orderItems,
      {
        product_id: "",
        product_name: "",
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      },
    ])
  }

  const updateOrderItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...orderItems]
    newItems[index] = { ...newItems[index], [field]: value }

    if (field === "product_id") {
      const product = products.find((p) => p.id === value)
      if (product) {
        newItems[index].product_name = product.name
        newItems[index].unit_price = product.price
        newItems[index].total_price = product.price * newItems[index].quantity
      }
    }

    if (field === "quantity" || field === "unit_price") {
      newItems[index].total_price = newItems[index].unit_price * newItems[index].quantity
    }

    setOrderItems(newItems)
  }

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const getTotalAmount = () => {
    return orderItems.reduce((sum, item) => sum + item.total_price, 0)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}`
      const totalAmount = getTotalAmount()

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_name: formData.get("customer_name") as string,
          customer_email: formData.get("customer_email") as string,
          customer_phone: formData.get("customer_phone") as string,
          total_amount: totalAmount,
          notes: formData.get("notes") as string,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItemsData = orderItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItemsData)

      if (itemsError) throw itemsError

      // Log activity
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        await supabase.from("activities").insert({
          action: "create",
          item_type: "order",
          item_name: orderNumber,
          user_id: session.user.id,
          user_name: session.user.email || "Unknown",
        })
      }

      toast({
        title: "Order created",
        description: `Order ${orderNumber} has been successfully created.`,
      })

      setOpen(false)
      setOrderItems([])
      router.refresh()
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>Enter customer details and add products to create a new order.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Customer Name *</Label>
                  <Input id="customer_name" name="customer_name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_email">Email</Label>
                  <Input id="customer_email" name="customer_email" type="email" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_phone">Phone</Label>
                <Input id="customer_phone" name="customer_phone" />
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Order Items</h3>
                <Button type="button" onClick={addOrderItem} variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {orderItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <Label>Product</Label>
                    <Select
                      value={item.product_id}
                      onValueChange={(value) => updateOrderItem(index, "product_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} (${product.price})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateOrderItem(index, "quantity", Number.parseInt(e.target.value))}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateOrderItem(index, "unit_price", Number.parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="col-span-3">
                    <Label>Total</Label>
                    <Input value={`$${item.total_price.toFixed(2)}`} disabled />
                  </div>
                  <div className="col-span-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeOrderItem(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {orderItems.length > 0 && (
                <div className="flex justify-end">
                  <div className="text-lg font-medium">Total: ${getTotalAmount().toFixed(2)}</div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" name="notes" placeholder="Optional order notes" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || orderItems.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? "Creating..." : "Create Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
