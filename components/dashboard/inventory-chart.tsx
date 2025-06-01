"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react"

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

      // Mock data for demonstration
      const mockData: StockData[] = [
        { month: "Jan", Electronics: 120, Food: 85, Clothing: 56, Office: 42 },
        { month: "Feb", Electronics: 132, Food: 79, Clothing: 62, Office: 46 },
        { month: "Mar", Electronics: 145, Food: 92, Clothing: 58, Office: 51 },
        { month: "Apr", Electronics: 138, Food: 102, Clothing: 65, Office: 48 },
        { month: "May", Electronics: 152, Food: 95, Clothing: 72, Office: 53 },
        { month: "Jun", Electronics: 165, Food: 88, Clothing: 78, Office: 57 },
      ]

      setTimeout(() => {
        setData(mockData)
        setIsLoading(false)
      }, 500)
    }

    fetchData()
  }, [])

  const getMaxValue = () => {
    if (category === "all") {
      return Math.max(...data.map((item) => item.Electronics + item.Food + item.Clothing + item.Office))
    }
    return Math.max(...data.map((item) => item[category as keyof StockData] as number))
  }

  const renderSimpleChart = () => {
    const maxValue = getMaxValue()

    return (
      <div className="space-y-4">
        {data.map((item, index) => {
          const value =
            category === "all"
              ? item.Electronics + item.Food + item.Clothing + item.Office
              : (item[category as keyof StockData] as number)

          const percentage = (value / maxValue) * 100

          return (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-8 text-sm font-medium">{item.month}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                  style={{ width: `${percentage}%` }}
                >
                  <span className="text-white text-xs font-medium">{value}</span>
                </div>
              </div>
              <div className="w-12 text-right">
                {index > 0 && data[index - 1] && (
                  <div className="flex items-center">
                    {value > ((data[index - 1][category as keyof StockData] as number) || 0) ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Inventory Levels
          </CardTitle>
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
          <div className="h-[350px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 mx-auto" />
                <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border-4 border-indigo-300 opacity-20 mx-auto" />
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground font-medium">Loading chart data...</p>
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
          <div className="h-[350px] flex flex-col justify-center animate-fade-in">{renderSimpleChart()}</div>
        )}
      </CardContent>
    </Card>
  )
}
