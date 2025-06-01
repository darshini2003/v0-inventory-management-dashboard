"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getInventoryAnalytics,
  getCategoryAnalytics,
  subscribeToInventoryUpdates,
  type InventoryAnalytics,
  type CategoryData,
} from "@/lib/inventory-analytics"

interface UseInventoryAnalyticsOptions {
  dateRange?: { from: Date; to: Date }
  category?: string
  realtime?: boolean
}

export function useInventoryAnalytics(options: UseInventoryAnalyticsOptions = {}) {
  const [data, setData] = useState<InventoryAnalytics[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [analyticsData, categoryAnalytics] = await Promise.all([
        getInventoryAnalytics(options.dateRange),
        getCategoryAnalytics(),
      ])

      setData(analyticsData)
      setCategoryData(categoryAnalytics)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Error fetching inventory analytics:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setIsLoading(false)
    }
  }, [options.dateRange])

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Real-time updates with error handling
  useEffect(() => {
    if (!options.realtime) {
      setIsRealtimeEnabled(false)
      return
    }

    try {
      const unsubscribe = subscribeToInventoryUpdates((payload) => {
        console.log("Real-time update received:", payload)
        setIsRealtimeEnabled(true)
        // Refresh data when inventory changes
        fetchData()
      })

      return () => {
        try {
          unsubscribe()
        } catch (error) {
          console.error("Error during unsubscribe:", error)
        }
      }
    } catch (error) {
      console.error("Error setting up real-time subscription:", error)
      setIsRealtimeEnabled(false)
    }
  }, [options.realtime, fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  const getFilteredData = useCallback(
    (selectedCategory: string) => {
      if (selectedCategory === "all") {
        return data
      }

      return data.map((item) => ({
        month: item.month,
        [selectedCategory]: item[selectedCategory] as number,
      }))
    },
    [data],
  )

  const getTotalsByCategory = useCallback(() => {
    return categoryData.reduce(
      (acc, category) => {
        acc[category.category] = category.total_quantity
        return acc
      },
      {} as Record<string, number>,
    )
  }, [categoryData])

  const getLowStockAlerts = useCallback(() => {
    return categoryData.filter((category) => category.low_stock_count > 0)
  }, [categoryData])

  return {
    data,
    categoryData,
    isLoading,
    error,
    lastUpdated,
    isRealtimeEnabled,
    refetch,
    getFilteredData,
    getTotalsByCategory,
    getLowStockAlerts,
  }
}
