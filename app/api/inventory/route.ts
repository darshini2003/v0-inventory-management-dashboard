import { createClient } from "@/utils/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const barcode = searchParams.get("barcode")

    if (barcode) {
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

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ product: data })
    } else {
      // Get all products with filters
      const category = searchParams.get("category")
      const supplier = searchParams.get("supplier")
      const search = searchParams.get("search")
      const lowStock = searchParams.get("lowStock") === "true"

      let query = supabase.from("products").select(`
        *,
        category:categories(id, name),
        supplier:suppliers(id, name)
      `)

      if (search) {
        query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,barcode.ilike.%${search}%`)
      }

      if (category) {
        query = query.eq("category_id", category)
      }

      if (supplier) {
        query = query.eq("supplier_id", supplier)
      }

      if (lowStock) {
        query = query.lte("quantity", "threshold")
      }

      const { data, error } = await query.order("updated_at", { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ products: data })
    }
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile for role check
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Check if user has permission to update inventory
    const canUpdateInventory = profile?.role === "admin" || profile?.role === "manager" || profile?.role === "staff"
    if (!canUpdateInventory) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { action, barcode, productId, quantity, operation } = body

    if (action === "scan") {
      // Log the barcode scan
      const { error: scanError } = await supabase.from("barcode_scans").insert({
        barcode,
        product_id: productId,
        user_id: session.user.id,
        quantity_change: quantity,
        operation,
        scan_location: body.location || "unknown",
        device_info: body.deviceInfo || {},
      })

      if (scanError) {
        return NextResponse.json({ error: scanError.message }, { status: 500 })
      }

      // Update product quantity if needed
      if (productId && quantity) {
        // Get current product
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("quantity, name")
          .eq("id", productId)
          .single()

        if (productError) {
          return NextResponse.json({ error: productError.message }, { status: 500 })
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
          return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        // Log activity
        const { error: activityError } = await supabase.from("activities").insert({
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

        if (activityError) {
          console.error("Error logging activity:", activityError)
        }
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
