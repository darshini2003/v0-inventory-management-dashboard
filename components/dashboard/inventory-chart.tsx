"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChartArea,
  ChartAxisOptions,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { createClient } from "@/utils/supabase/client"
import { useEffect } from "react"

// Define the data structure
interface StockData {
  month: string
  Electronics: number
  Food: number
  Clothing: number
  Office: number
}

export function InventoryChart() {
  const [data, setData] = useState<StockData[]>([])
  const [category, setCategory] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const supabase = createClient()

      // In a real app, you would fetch this data from Supabase
      // For now, we'll use mock data
      const mockData: StockData[] = [
        { month: "Jan", Electronics: 120, Food: 85, Clothing: 56, Office: 42 },
        { month: "Feb", Electronics: 132, Food: 79, Clothing: 62, Office: 46 },
        { month: "Mar", Electronics: 145, Food: 92, Clothing: 58, Office: 51 },
        { month: "Apr", Electronics: 138, Food: 102, Clothing: 65, Office: 48 },
        { month: "May", Electronics: 152, Food: 95, Clothing: 72, Office: 53 },
        { month: "Jun", Electronics: 165, Food: 88, Clothing: 78, Office: 57 },
      ]

      setData(mockData)
      setIsLoading(false)
    }

    fetchData()
  }, [])

  // Filter data based on selected category
  const filteredData = data.map((item) => {
    if (category === "all") {
      return item
    }

    // Create a new object with only the selected category
    return {
      month: item.month,
      [category]: item[category as keyof typeof item] as number,
    }
  })

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Inventory Levels</CardTitle>
          <CardDescription>Stock levels over the last 6 months</CardDescription>
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Electronics">Electronics</SelectItem>
            <SelectItem value="Food">Food</SelectItem>
            <SelectItem value="Clothing">Clothing</SelectItem>
            <SelectItem value="Office">Office Supplies</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="h-[350px] flex items-center justify-center">Loading chart data...</div>
        ) : (
          <div className="h-[350px]">
            <ChartContainer data={filteredData}>
              <ChartLegend />
              <ChartAxisOptions
                xAxis={{
                  dataKey: "month",
                  tickLine: false,
                  axisLine: false,
                  tick: { fill: "hsl(var(--muted-foreground))" },
                }}
                yAxis={{
                  tickLine: false,
                  axisLine: false,
                  tick: { fill: "hsl(var(--muted-foreground))" },
                }}
              />
              <ChartArea
                dataKey="Electronics"
                stroke="hsl(var(--indigo-600))"
                fill="hsl(var(--indigo-600))"
                fillOpacity={0.2}
                isAnimationActive
                activeDot
              />
              {category === "all" && (
                <>
                  <ChartArea
                    dataKey="Food"
                    stroke="hsl(var(--emerald-500))"
                    fill="hsl(var(--emerald-500))"
                    fillOpacity={0.2}
                    isAnimationActive
                    activeDot
                  />
                  <ChartArea
                    dataKey="Clothing"
                    stroke="hsl(var(--amber-500))"
                    fill="hsl(var(--amber-500))"
                    fillOpacity={0.2}
                    isAnimationActive
                    activeDot
                  />
                  <ChartArea
                    dataKey="Office"
                    stroke="hsl(var(--sky-500))"
                    fill="hsl(var(--sky-500))"
                    fillOpacity={0.2}
                    isAnimationActive
                    activeDot
                  />
                </>
              )}
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <ChartTooltipContent
                        className="border bg-background p-2 shadow-sm"
                        items={payload.map((entry) => ({
                          label: entry.dataKey as string,
                          value: entry.value as string,
                          color: entry.color as string,
                        }))}
                      />
                    )
                  }
                  return null
                }}
              />
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
