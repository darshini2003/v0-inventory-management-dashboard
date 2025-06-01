"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, AlertTriangle, DollarSign, TrendingUp, Wifi } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useEffect } from "react"

interface DashboardStats {
  totalProducts: number
  lowStockCount: number
  totalInventoryValue: number
  monthlyRevenue: number
}

export function DashboardSummaryCards() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockCount: 0,
    totalInventoryValue: 0,
    monthlyRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    // Simulate loading and then set mock data
    const timer = setTimeout(() => {
      setStats({
        totalProducts: 1247,
        lowStockCount: 23,
        totalInventoryValue: 156780.5,
        monthlyRevenue: 89432.25,
      })
      setLastUpdate(new Date())
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
              <Skeleton className="h-4 w-4 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[120px] mb-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
              <Skeleton className="h-3 w-[80px] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <>
      <Card className="relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.totalProducts)}</div>
          <p className="text-xs text-muted-foreground">{lastUpdate && `Updated ${lastUpdate.toLocaleTimeString()}`}</p>
        </CardContent>
        {lastUpdate && (
          <div className="absolute top-2 right-2">
            <Wifi className="h-3 w-3 text-green-500" />
          </div>
        )}
      </Card>

      <Card className="relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats.lowStockCount > 0 ? "text-amber-600" : "text-green-600"}`}>
            {formatNumber(stats.lowStockCount)}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.lowStockCount > 0 ? "Items need attention" : "All items in stock"}
          </p>
        </CardContent>
        {stats.lowStockCount > 0 && (
          <div className="absolute top-2 right-2">
            <AlertTriangle className="h-3 w-3 text-amber-500 animate-pulse" />
          </div>
        )}
      </Card>

      <Card className="relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalInventoryValue)}</div>
          <p className="text-xs text-muted-foreground">Total value of all products</p>
        </CardContent>
      </Card>

      <Card className="relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </CardContent>
      </Card>
    </>
  )
}
