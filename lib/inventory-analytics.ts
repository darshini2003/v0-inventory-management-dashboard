import { createClient } from "@/utils/supabase/client"
import { createClient as createServerClient } from "@/utils/supabase/server"

export interface InventoryAnalytics {
  month: string
  Electronics: number
  Food: number
  Clothing: number
  Office: number
  [key: string]: string | number
}

export interface CategoryData {
  category: string
  total_quantity: number
  total_value: number
  low_stock_count: number
}

export interface MonthlyTrend {
  month: string
  year: number
  category: string
  total_quantity: number
  total_value: number
  products_added: number
  products_sold: number
}

// Client-side data fetching
export async function getInventoryAnalytics(dateRange?: { from: Date; to: Date }): Promise<InventoryAnalytics[]> {
  const supabase = createClient()

  try {
    // Get current date range (last 6 months if not specified)
    const endDate = dateRange?.to || new Date()
    const startDate = dateRange?.from || new Date(endDate.getFullYear(), endDate.getMonth() - 5, 1)

    // Query inventory data grouped by category and month
    const { data: inventoryData, error } = await supabase
      .from("products")
      .select(`
        category,
        quantity,
        price,
        created_at,
        updated_at
      `)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching inventory data:", error)
      return getFallbackData()
    }

    if (!inventoryData || inventoryData.length === 0) {
      return getFallbackData()
    }

    // Process data into monthly analytics
    const monthlyData = processInventoryData(inventoryData, startDate, endDate)
    return monthlyData
  } catch (error) {
    console.error("Error in getInventoryAnalytics:", error)
    return getFallbackData()
  }
}

// Server-side data fetching
export async function getInventoryAnalyticsServer(dateRange?: { from: Date; to: Date }): Promise<InventoryAnalytics[]> {
  const supabase = await createServerClient()

  try {
    const endDate = dateRange?.to || new Date()
    const startDate = dateRange?.from || new Date(endDate.getFullYear(), endDate.getMonth() - 5, 1)

    const { data: inventoryData, error } = await supabase
      .from("products")
      .select(`
        category,
        quantity,
        price,
        created_at,
        updated_at
      `)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching inventory data:", error)
      return getFallbackData()
    }

    if (!inventoryData || inventoryData.length === 0) {
      return getFallbackData()
    }

    return processInventoryData(inventoryData, startDate, endDate)
  } catch (error) {
    console.error("Error in getInventoryAnalyticsServer:", error)
    return getFallbackData()
  }
}

// Get category-specific analytics
export async function getCategoryAnalytics(): Promise<CategoryData[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("products").select(`
        category,
        quantity,
        price,
        low_stock_threshold
      `)

    if (error) {
      console.error("Error fetching category analytics:", error)
      return getFallbackCategoryData()
    }

    if (!data || data.length === 0) {
      return getFallbackCategoryData()
    }

    // Group by category and calculate analytics
    const categoryMap = new Map<string, CategoryData>()

    data.forEach((product) => {
      const category = product.category || "Uncategorized"
      const existing = categoryMap.get(category) || {
        category,
        total_quantity: 0,
        total_value: 0,
        low_stock_count: 0,
      }

      existing.total_quantity += product.quantity || 0
      existing.total_value += (product.quantity || 0) * (product.price || 0)

      if ((product.quantity || 0) <= (product.low_stock_threshold || 10)) {
        existing.low_stock_count += 1
      }

      categoryMap.set(category, existing)
    })

    return Array.from(categoryMap.values())
  } catch (error) {
    console.error("Error in getCategoryAnalytics:", error)
    return getFallbackCategoryData()
  }
}

// Get real-time inventory updates with proper error handling
export function subscribeToInventoryUpdates(callback: (data: any) => void) {
  const supabase = createClient()

  try {
    // Check if channel method exists (real Supabase client)
    if (!supabase.channel || typeof supabase.channel !== "function") {
      console.log("Real-time subscriptions not available in preview mode")
      return () => {
        console.log("Mock unsubscribe called")
      }
    }

    const subscription = supabase
      .channel("inventory-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        (payload) => {
          console.log("Inventory update received:", payload)
          callback(payload)
        },
      )
      .subscribe()

    return () => {
      try {
        subscription.unsubscribe()
      } catch (error) {
        console.error("Error unsubscribing:", error)
      }
    }
  } catch (error) {
    console.error("Error setting up real-time subscription:", error)
    return () => {
      console.log("Mock unsubscribe called")
    }
  }
}

// Process raw inventory data into monthly analytics
function processInventoryData(data: any[], startDate: Date, endDate: Date): InventoryAnalytics[] {
  const monthlyMap = new Map<string, InventoryAnalytics>()

  // Initialize months
  const current = new Date(startDate)
  while (current <= endDate) {
    const monthKey = current.toLocaleDateString("en-US", { month: "short" })
    monthlyMap.set(monthKey, {
      month: monthKey,
      Electronics: 0,
      Food: 0,
      Clothing: 0,
      Office: 0,
    })
    current.setMonth(current.getMonth() + 1)
  }

  // Process data
  data.forEach((product) => {
    const date = new Date(product.created_at)
    const monthKey = date.toLocaleDateString("en-US", { month: "short" })
    const category = product.category || "Office"

    const monthData = monthlyMap.get(monthKey)
    if (monthData && category in monthData) {
      monthData[category] = (monthData[category] as number) + (product.quantity || 0)
    }
  })

  return Array.from(monthlyMap.values())
}

// Fallback data when no real data is available
function getFallbackData(): InventoryAnalytics[] {
  return [
    { month: "Jan", Electronics: 120, Food: 85, Clothing: 56, Office: 42 },
    { month: "Feb", Electronics: 132, Food: 79, Clothing: 62, Office: 46 },
    { month: "Mar", Electronics: 145, Food: 92, Clothing: 58, Office: 51 },
    { month: "Apr", Electronics: 138, Food: 102, Clothing: 65, Office: 48 },
    { month: "May", Electronics: 152, Food: 95, Clothing: 72, Office: 53 },
    { month: "Jun", Electronics: 165, Food: 88, Clothing: 78, Office: 57 },
  ]
}

// Fallback category data
function getFallbackCategoryData(): CategoryData[] {
  return [
    { category: "Electronics", total_quantity: 152, total_value: 45600, low_stock_count: 3 },
    { category: "Food", total_quantity: 88, total_value: 12400, low_stock_count: 1 },
    { category: "Clothing", total_quantity: 78, total_value: 23400, low_stock_count: 2 },
    { category: "Office", total_quantity: 57, total_value: 8550, low_stock_count: 0 },
  ]
}

// Get inventory trends for predictive analytics
export async function getInventoryTrends(category?: string): Promise<MonthlyTrend[]> {
  const supabase = createClient()

  try {
    let query = supabase
      .from("products")
      .select(`
        category,
        quantity,
        price,
        created_at
      `)
      .order("created_at", { ascending: true })

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching inventory trends:", error)
      return []
    }

    if (!data) return []

    // Process into monthly trends
    const trendsMap = new Map<string, MonthlyTrend>()

    data.forEach((product) => {
      const date = new Date(product.created_at)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      const month = date.toLocaleDateString("en-US", { month: "short" })
      const year = date.getFullYear()

      const existing = trendsMap.get(monthKey) || {
        month,
        year,
        category: product.category || "All",
        total_quantity: 0,
        total_value: 0,
        products_added: 0,
        products_sold: 0,
      }

      existing.total_quantity += product.quantity || 0
      existing.total_value += (product.quantity || 0) * (product.price || 0)
      existing.products_added += 1

      trendsMap.set(monthKey, existing)
    })

    return Array.from(trendsMap.values()).slice(-12) // Last 12 months
  } catch (error) {
    console.error("Error in getInventoryTrends:", error)
    return []
  }
}
