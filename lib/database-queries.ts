import { createClient } from "@/utils/supabase/server"

// Types
export interface Product {
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
  image_url?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
}

export interface Supplier {
  id: string
  name: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  status: string
}

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email?: string
  customer_phone?: string
  status: string
  total_amount: number
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface Activity {
  id: string
  action: string
  item_type: string
  item_id?: string
  item_name: string
  user_id?: string
  user_name: string
  details?: any
  created_at: string
}

// Product Queries
export async function getProducts(filters?: {
  search?: string
  category?: string
  supplier?: string
  lowStock?: boolean
  page?: number
  limit?: number
}) {
  const supabase = createClient()

  let query = supabase.from("products").select(`
    *,
    category:categories(id, name),
    supplier:suppliers(id, name)
  `)

  // Apply filters
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,barcode.ilike.%${filters.search}%`)
  }

  if (filters?.category) {
    query = query.eq("category_id", filters.category)
  }

  if (filters?.supplier) {
    query = query.eq("supplier_id", filters.supplier)
  }

  if (filters?.lowStock) {
    query = query.lte("quantity", supabase.rpc("get_threshold"))
  }

  // Pagination
  const page = filters?.page || 1
  const limit = filters?.limit || 20
  const from = (page - 1) * limit
  const to = from + limit - 1

  query = query.range(from, to).order("updated_at", { ascending: false })

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Error fetching products: ${error.message}`)
  }

  return { data, count }
}

export async function getProductById(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(id, name),
      supplier:suppliers(id, name)
    `)
    .eq("id", id)
    .single()

  if (error) {
    throw new Error(`Error fetching product: ${error.message}`)
  }

  return data
}

export async function getProductByBarcode(barcode: string) {
  const supabase = createClient()

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
    // PGRST116 is "no rows returned"
    throw new Error(`Error fetching product: ${error.message}`)
  }

  return data
}

export async function createProduct(product: Omit<Product, "id" | "created_at" | "updated_at">) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("products")
    .insert({
      ...product,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Error creating product: ${error.message}`)
  }

  // Log activity
  await logActivity({
    action: "create",
    item_type: "product",
    item_id: data.id,
    item_name: data.name,
    user_name: "Current User", // Replace with actual user
    details: { product },
  })

  return data
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("products")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating product: ${error.message}`)
  }

  // Log activity
  await logActivity({
    action: "update",
    item_type: "product",
    item_id: data.id,
    item_name: data.name,
    user_name: "Current User", // Replace with actual user
    details: { updates },
  })

  return data
}

export async function deleteProduct(id: string, productName: string) {
  const supabase = createClient()

  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    throw new Error(`Error deleting product: ${error.message}`)
  }

  // Log activity
  await logActivity({
    action: "delete",
    item_type: "product",
    item_id: id,
    item_name: productName,
    user_name: "Current User", // Replace with actual user
  })

  return true
}

// Order Queries
export async function getOrders(filters?: {
  search?: string
  status?: string
  page?: number
  limit?: number
}) {
  const supabase = createClient()

  let query = supabase.from("orders").select(`
    *,
    order_items(
      id,
      product_id,
      quantity,
      unit_price,
      total_price,
      product:products(name)
    )
  `)

  // Apply filters
  if (filters?.search) {
    query = query.or(
      `order_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`,
    )
  }

  if (filters?.status) {
    query = query.eq("status", filters.status)
  }

  // Pagination
  const page = filters?.page || 1
  const limit = filters?.limit || 20
  const from = (page - 1) * limit
  const to = from + limit - 1

  query = query.range(from, to).order("created_at", { ascending: false })

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Error fetching orders: ${error.message}`)
  }

  return { data, count }
}

export async function getOrderById(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items(
        id,
        product_id,
        quantity,
        unit_price,
        total_price,
        product:products(id, name, sku)
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    throw new Error(`Error fetching order: ${error.message}`)
  }

  return data
}

export async function createOrder(
  order: Omit<Order, "id" | "created_at" | "updated_at">,
  orderItems: Array<Omit<OrderItem, "id" | "order_id">>,
) {
  const supabase = createClient()

  // Start a transaction
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      ...order,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (orderError) {
    throw new Error(`Error creating order: ${orderError.message}`)
  }

  // Insert order items
  const orderItemsWithOrderId = orderItems.map((item) => ({
    ...item,
    order_id: orderData.id,
  }))

  const { error: itemsError } = await supabase.from("order_items").insert(orderItemsWithOrderId)

  if (itemsError) {
    throw new Error(`Error creating order items: ${itemsError.message}`)
  }

  // Log activity
  await logActivity({
    action: "create",
    item_type: "order",
    item_id: orderData.id,
    item_name: orderData.order_number,
    user_name: "Current User", // Replace with actual user
    details: { order, items: orderItems },
  })

  return orderData
}

export async function updateOrderStatus(id: string, status: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating order status: ${error.message}`)
  }

  // Log activity
  await logActivity({
    action: "update",
    item_type: "order",
    item_id: data.id,
    item_name: data.order_number,
    user_name: "Current User", // Replace with actual user
    details: { status },
  })

  return data
}

// Supplier Queries
export async function getSuppliers(filters?: {
  search?: string
  status?: string
  page?: number
  limit?: number
}) {
  const supabase = createClient()

  let query = supabase.from("suppliers").select("*")

  // Apply filters
  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%,email.ilike.%${filters.search}%`,
    )
  }

  if (filters?.status) {
    query = query.eq("status", filters.status)
  }

  // Pagination
  const page = filters?.page || 1
  const limit = filters?.limit || 20
  const from = (page - 1) * limit
  const to = from + limit - 1

  query = query.range(from, to).order("name")

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Error fetching suppliers: ${error.message}`)
  }

  return { data, count }
}

// Category Queries
export async function getCategories() {
  const supabase = createClient()

  const { data, error } = await supabase.from("categories").select("*").order("name")

  if (error) {
    throw new Error(`Error fetching categories: ${error.message}`)
  }

  return data
}

// Activity Logging
export async function logActivity(activity: Omit<Activity, "id" | "created_at">) {
  const supabase = createClient()

  const { error } = await supabase.from("activities").insert({
    ...activity,
    created_at: new Date().toISOString(),
  })

  if (error) {
    console.error(`Error logging activity: ${error.message}`)
  }

  return true
}

// Dashboard Analytics
export async function getDashboardStats() {
  const supabase = createClient()

  // Get total products
  const { count: totalProducts } = await supabase.from("products").select("*", { count: "exact", head: true })

  // Get low stock products
  const { data: lowStockProducts } = await supabase
    .from("products")
    .select("id")
    .lt("quantity", supabase.rpc("get_threshold"))

  // Get recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("total_amount")
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  // Get inventory value
  const { data: inventoryItems } = await supabase.from("products").select("price, quantity")

  const totalInventoryValue = inventoryItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0
  const monthlyRevenue = recentOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0

  return {
    totalProducts: totalProducts || 0,
    lowStockCount: lowStockProducts?.length || 0,
    totalInventoryValue,
    monthlyRevenue,
  }
}

// Barcode Scanning
export async function scanBarcode(barcode: string) {
  return getProductByBarcode(barcode)
}

export async function updateProductQuantityByBarcode(barcode: string, quantityChange: number) {
  const product = await getProductByBarcode(barcode)

  if (!product) {
    throw new Error("Product not found")
  }

  return updateProduct(product.id, {
    quantity: product.quantity + quantityChange,
  })
}
