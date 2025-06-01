"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

// Product actions
export async function updateProductQuantity(
  productId: string,
  quantity: number,
  operation: "add" | "remove",
  barcode?: string,
) {
  try {
    const supabase = await createClient()

    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { error: "Unauthorized" }
    }

    // Get current product
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("quantity, name")
      .eq("id", productId)
      .single()

    if (productError) {
      return { error: productError.message }
    }

    // Calculate new quantity
    const quantityChange = operation === "add" ? quantity : -quantity
    const newQuantity = Math.max(0, product.quantity + quantityChange)

    // Update product
    const { error: updateError } = await supabase
      .from("products")
      .update({
        quantity: newQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)

    if (updateError) {
      return { error: updateError.message }
    }

    // Log barcode scan if barcode provided
    if (barcode) {
      await supabase.from("barcode_scans").insert({
        barcode,
        product_id: productId,
        user_id: session.user.id,
        quantity_change: quantityChange,
        operation,
      })
    }

    // Log activity
    await supabase.from("activities").insert({
      action: "update",
      item_type: "product",
      item_id: productId,
      item_name: product.name,
      user_id: session.user.id,
      user_name: session.user.email,
      details: {
        quantity_change: quantityChange,
        operation,
        barcode,
        new_quantity: newQuantity,
      },
    })

    revalidatePath("/dashboard/inventory")
    return { success: true, newQuantity }
  } catch (error) {
    console.error("Error updating product quantity:", error)
    return { error: "Failed to update product quantity" }
  }
}

export async function getProductByBarcode(barcode: string) {
  try {
    const supabase = await createClient()

    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { error: "Unauthorized" }
    }

    // Look up product by barcode
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(id, name),
        supplier:suppliers(id, name)
      `)
      .eq("barcode", barcode)
      .single()

    if (error && error.code !== "PGRST116") {
      return { error: error.message }
    }

    // Log the scan attempt
    await supabase.from("barcode_scans").insert({
      barcode,
      product_id: data?.id,
      user_id: session.user.id,
      operation: "scan",
    })

    return { product: data }
  } catch (error) {
    console.error("Error getting product by barcode:", error)
    return { error: "Failed to get product" }
  }
}

// Dashboard stats actions
export async function getDashboardStats() {
  try {
    const supabase = await createClient()

    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { error: "Unauthorized" }
    }

    // Get total products
    const { count: totalProducts } = await supabase.from("products").select("*", { count: "exact", head: true })

    // Get low stock products
    const { data: lowStockProducts } = await supabase.from("products").select("id").lte("quantity", "threshold")

    // Get recent orders
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: recentOrders } = await supabase
      .from("orders")
      .select("total_amount")
      .gte("created_at", thirtyDaysAgo.toISOString())

    // Get inventory value
    const { data: inventoryItems } = await supabase.from("products").select("price, quantity")

    const totalInventoryValue = inventoryItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0
    const monthlyRevenue = recentOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0

    return {
      stats: {
        totalProducts: totalProducts || 0,
        lowStockCount: lowStockProducts?.length || 0,
        totalInventoryValue,
        monthlyRevenue,
      },
    }
  } catch (error) {
    console.error("Error getting dashboard stats:", error)
    return { error: "Failed to get dashboard stats" }
  }
}
