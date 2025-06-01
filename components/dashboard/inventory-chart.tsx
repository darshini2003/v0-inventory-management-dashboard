"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { BarChart3, RefreshCw, AlertTriangle } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { useInventoryAnalytics } from "@/hooks/use-inventory-analytics"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

const chartConfig = {
  Electronics: {
    label: "Electronics",
    color: "hsl(var(--chart-1))",
  },
  Food: {
    label: "Food & Beverages",
    color: "hsl(var(--chart-2))",
  },
  Clothing: {
    label: "Clothing",
    color: "hsl(var(--chart-3))",
  },
  Office: {
    label: "Office Supplies",
    color: "hsl(var(--chart-4))",
  },
}

export function InventoryChart() {
  const [category, setCategory] = useState<string>("all")
  const [dateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1),
    to: new Date(),
  })

  const {
    data,
    categoryData,
    isLoading,
    error,
    lastUpdated,
    refetch,
    getFilteredData,
    getTotalsByCategory,
    getLowStockAlerts,
  } = useInventoryAnalytics({
    dateRange,
    realtime: true,
  })

  const filteredData = getFilteredData(category)
  const totals = getTotalsByCategory()
  const lowStockAlerts = getLowStockAlerts()

  const getMaxValue = () => {
    if (category === "all") {
      return Math.max(
        ...data.map(
          (item) =>
            (item.Electronics as number) + (item.Food as number) + (item.Clothing as number) + (item.Office as number),
        ),
      )
    }
    return Math.max(...data.map((item) => (item[category] as number) || 0))
  }

  const renderBarChart = () => {
    if (!filteredData.length) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-2">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">No inventory data available</p>
            <Button onClick={refetch} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>
      )
    }

    return (
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }} />
            <Legend />
            {category === "all" ? (
              <>
                <Bar dataKey="Electronics" fill="var(--color-Electronics)" radius={[2, 2, 0, 0]} name="Electronics" />
                <Bar dataKey="Food" fill="var(--color-Food)" radius={[2, 2, 0, 0]} name="Food & Beverages" />
                <Bar dataKey="Clothing" fill="var(--color-Clothing)" radius={[2, 2, 0, 0]} name="Clothing" />
                <Bar dataKey="Office" fill="var(--color-Office)" radius={[2, 2, 0, 0]} name="Office Supplies" />
              </>
            ) : (
              <Bar
                dataKey={category}
                fill={`var(--color-${category})`}
                radius={[4, 4, 0, 0]}
                name={chartConfig[category as keyof typeof chartConfig]?.label || category}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    )
  }

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Inventory Levels
            {lowStockAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {lowStockAlerts.length} Low Stock
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            Stock levels over the last 6 months
            <span className="text-xs text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={refetch} variant="outline" size="sm" disabled={isLoading} className="h-8">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Electronics">Electronics {totals.Electronics && `(${totals.Electronics})`}</SelectItem>
              <SelectItem value="Food">Food & Beverages {totals.Food && `(${totals.Food})`}</SelectItem>
              <SelectItem value="Clothing">Clothing {totals.Clothing && `(${totals.Clothing})`}</SelectItem>
              <SelectItem value="Office">Office Supplies {totals.Office && `(${totals.Office})`}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button onClick={refetch} variant="outline" size="sm" className="ml-2">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {lowStockAlerts.length > 0 && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Low Stock Alert:</strong> {lowStockAlerts.length} categories have products running low on stock.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="h-[350px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 mx-auto" />
                <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border-4 border-indigo-300 opacity-20 mx-auto" />
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground font-medium">Loading inventory data...</p>
                <div className="flex justify-center space-x-1">
                  <div
                    className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[350px] animate-fade-in">{renderBarChart()}</div>
        )}

        {/* Category Summary */}
        {!isLoading && categoryData.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Category Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {categoryData.map((cat) => (
                <div key={cat.category} className="text-center p-2 bg-muted/50 rounded">
                  <div className="text-xs text-muted-foreground">{cat.category}</div>
                  <div className="font-medium">{cat.total_quantity}</div>
                  <div className="text-xs text-green-600">${cat.total_value.toFixed(0)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
