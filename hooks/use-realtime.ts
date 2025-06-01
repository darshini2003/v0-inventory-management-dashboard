"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import { useToast } from "@/hooks/use-toast"

// Define types for better type safety
export type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE" | "*"

interface RealtimeSubscriptionOptions<T> {
  table: string
  schema?: string
  event?: RealtimeEvent
  filter?: string
  initialData?: T[]
  selectQuery?: string
  onDataChange?: (data: T[]) => void
  onError?: (error: Error) => void
  onConnectionChange?: (isConnected: boolean) => void
}

export function useRealtimeSubscription<T>({
  table,
  schema = "public",
  event = "*",
  filter,
  initialData = [],
  selectQuery = "*",
  onDataChange,
  onError,
  onConnectionChange,
}: RealtimeSubscriptionOptions<T>) {
  const [data, setData] = useState<T[]>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabaseRef = useRef(createClient())

  // Function to fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = supabaseRef.current

      let query = supabase.from(table).select(selectQuery)

      if (filter) {
        const [column, operator, value] = filter.split(":")
        query = query.filter(column, operator, value)
      }

      const { data: initialData, error: fetchError } = await query

      if (fetchError) {
        throw fetchError
      }

      setData(initialData || [])
      if (onDataChange) onDataChange(initialData || [])
      setLastUpdate(new Date())
    } catch (err: any) {
      console.error(`Error fetching ${table} data:`, err)
      setError(err.message)
      if (onError) onError(err)
    } finally {
      setLoading(false)
    }
  }, [table, filter, selectQuery, onDataChange, onError])

  // Function to handle real-time changes
  const handleRealtimeChange = useCallback(
    (payload: RealtimePostgresChangesPayload<T>) => {
      setData((currentData) => {
        let newData = [...currentData]

        if (payload.eventType === "INSERT") {
          // Add new record to the beginning of the array
          newData = [payload.new as T, ...newData]
        } else if (payload.eventType === "UPDATE") {
          // Update existing record
          newData = newData.map((item) => ((item as any).id === (payload.new as any).id ? (payload.new as T) : item))
        } else if (payload.eventType === "DELETE") {
          // Remove deleted record
          newData = newData.filter((item) => (item as any).id !== (payload.old as any).id)
        }

        if (onDataChange) onDataChange(newData)
        setLastUpdate(new Date())
        return newData
      })
    },
    [onDataChange],
  )

  // Set up real-time subscription
  useEffect(() => {
    const supabase = supabaseRef.current

    // Fetch initial data
    fetchData()

    // Set up real-time subscription
    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        "postgres_changes",
        {
          event,
          schema,
          table,
        },
        handleRealtimeChange,
      )
      .subscribe((status) => {
        const isConnected = status === "SUBSCRIBED"
        setIsConnected(isConnected)
        if (onConnectionChange) onConnectionChange(isConnected)

        if (status === "CHANNEL_ERROR") {
          setError("Failed to connect to real-time updates")
          if (onError) onError(new Error("Failed to connect to real-time updates"))
        }
      })

    channelRef.current = channel

    // Cleanup function
    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, schema, event, fetchData, handleRealtimeChange, onConnectionChange, onError])

  // Function to manually refetch data
  const refetch = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    isConnected,
    lastUpdate,
    refetch,
    setData,
  }
}

export function useRealtimeInventory(searchParams?: {
  search?: string
  category?: string
  supplier?: string
  filter?: string
}) {
  const { toast } = useToast()
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [lastNotification, setLastNotification] = useState<Date | null>(null)

  const selectQuery = `
    *,
    category:categories(id, name),
    supplier:suppliers(id, name)
  `

  // Subscribe to product changes
  const {
    data: products,
    loading,
    error,
    isConnected,
    lastUpdate,
    refetch,
  } = useRealtimeSubscription({
    table: "products",
    selectQuery,
    onDataChange: (newData) => {
      // Apply client-side filtering
      filterProducts(newData)
    },
    onError: (error) => {
      console.error("Realtime subscription error:", error)
      toast({
        title: "Connection Error",
        description: "Failed to connect to real-time updates. Some data may be outdated.",
        variant: "destructive",
      })
    },
  })

  // Filter products based on search params
  const filterProducts = useCallback(
    (productsToFilter: any[]) => {
      if (!searchParams) {
        setFilteredProducts(productsToFilter)
        return
      }

      const filtered = productsToFilter.filter((product: any) => {
        if (searchParams.search) {
          const searchLower = searchParams.search.toLowerCase()
          const nameMatch = product.name?.toLowerCase().includes(searchLower)
          const skuMatch = product.sku?.toLowerCase().includes(searchLower)
          const barcodeMatch = product.barcode?.toLowerCase().includes(searchLower)

          if (!nameMatch && !skuMatch && !barcodeMatch) {
            return false
          }
        }

        if (searchParams.category && product.category?.name !== searchParams.category) {
          return false
        }

        if (searchParams.supplier && product.supplier?.name !== searchParams.supplier) {
          return false
        }

        if (searchParams.filter === "low-stock" && product.quantity > product.threshold) {
          return false
        }

        return true
      })

      setFilteredProducts(filtered)
    },
    [searchParams],
  )

  // Apply filtering when products or search params change
  useEffect(() => {
    filterProducts(products)
  }, [products, searchParams, filterProducts])

  // Set up notifications for inventory changes
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("inventory_notifications")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "products",
        },
        (payload) => {
          setLastNotification(new Date())

          // Only show notifications if the quantity changed
          if (payload.old?.quantity !== payload.new?.quantity) {
            const oldQuantity = payload.old?.quantity || 0
            const newQuantity = payload.new?.quantity || 0
            const change = newQuantity - oldQuantity
            const changeText = change > 0 ? `+${change}` : `${change}`

            toast({
              title: "Stock Updated",
              description: `${payload.new.name}: ${changeText} ${payload.new.unit}`,
            })

            // Check for low stock alert
            if (newQuantity <= payload.new.threshold && newQuantity > 0) {
              toast({
                title: "Low Stock Alert",
                description: `${payload.new.name} is running low (${newQuantity} ${payload.new.unit} remaining)`,
                variant: "destructive",
              })
            } else if (newQuantity === 0) {
              toast({
                title: "Out of Stock",
                description: `${payload.new.name} is now out of stock`,
                variant: "destructive",
              })
            }
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [toast])

  return {
    products: filteredProducts,
    allProducts: products,
    loading,
    error,
    isConnected,
    lastUpdate,
    lastNotification,
    refetch,
  }
}

export function useRealtimeDashboardStats() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    totalInventoryValue: 0,
    monthlyRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Function to calculate stats from products data
  const calculateStats = useCallback(async () => {
    try {
      const supabase = createClient()

      // Get all products for calculations
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, price, quantity, threshold")

      if (productsError) throw productsError

      // Get recent orders for revenue calculation
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: recentOrders, error: ordersError } = await supabase
        .from("orders")
        .select("total_amount")
        .gte("created_at", thirtyDaysAgo.toISOString())

      if (ordersError) throw ordersError

      if (products) {
        const totalProducts = products.length
        const lowStockCount = products.filter((p) => p.quantity <= p.threshold).length
        const totalInventoryValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0)
        const monthlyRevenue = recentOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0

        setStats({
          totalProducts,
          lowStockCount,
          totalInventoryValue,
          monthlyRevenue,
        })
      }

      setLastUpdate(new Date())
      setLoading(false)
      setError(null)
    } catch (err: any) {
      console.error("Error calculating stats:", err)
      setError(err.message)
      setLoading(false)
    }
  }, [])

  // Initial calculation and subscription setup
  useEffect(() => {
    calculateStats()

    const supabase = createClient()

    // Subscribe to product changes to recalculate stats
    const productChannel = supabase
      .channel("dashboard_stats_products")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        () => {
          calculateStats()
        },
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED")
      })

    // Subscribe to order changes for revenue updates
    const orderChannel = supabase
      .channel("dashboard_stats_orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          calculateStats()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(productChannel)
      supabase.removeChannel(orderChannel)
    }
  }, [calculateStats])

  return { stats, loading, error, lastUpdate, isConnected, refetch: calculateStats }
}

export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const supabase = createClient()

    // Fetch initial notifications
    const fetchInitialNotifications = async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error fetching notifications:", error)
        return
      }

      if (data) {
        const formattedNotifications = data.map((activity) => ({
          id: activity.id,
          title: `${activity.action} ${activity.item_type}`,
          description: `${activity.item_name} was ${activity.action}d by ${activity.user_name}`,
          time: "Just now",
          read: false,
          timestamp: new Date(activity.created_at),
          details: activity.details,
        }))

        setNotifications(formattedNotifications)
      }
    }

    fetchInitialNotifications()

    // Subscribe to new activities
    const channel = supabase
      .channel("activities_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activities",
        },
        (payload) => {
          // Create notification from activity
          const notification = {
            id: payload.new.id,
            title: `${payload.new.action} ${payload.new.item_type}`,
            description: `${payload.new.item_name} was ${payload.new.action}d by ${payload.new.user_name}`,
            time: "Just now",
            read: false,
            timestamp: new Date(payload.new.created_at),
            details: payload.new.details,
          }

          setNotifications((current) => [notification, ...current.slice(0, 9)]) // Keep last 10

          // Show toast for important activities
          if (
            payload.new.action === "create" ||
            (payload.new.action === "update" &&
              payload.new.details?.quantity_change &&
              Math.abs(payload.new.details.quantity_change) >= 10)
          ) {
            toast({
              title: notification.title,
              description: notification.description,
            })
          }
        },
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED")
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [toast])

  const markAsRead = useCallback((id: string) => {
    setNotifications((current) => current.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((current) => current.map((notif) => ({ ...notif, read: true })))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    markAsRead,
    markAllAsRead,
    clearAll,
    isConnected,
  }
}

export function useBarcodeScanHistory() {
  const {
    data: scanHistory,
    loading,
    error,
    isConnected,
    lastUpdate,
    refetch,
  } = useRealtimeSubscription({
    table: "barcode_scans",
    selectQuery: `
      *,
      product:products(id, name, sku, quantity, unit)
    `,
  })

  return {
    scanHistory,
    loading,
    error,
    isConnected,
    lastUpdate,
    refetch,
  }
}
