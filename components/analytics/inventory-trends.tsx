import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, TrendingDown, Package, AlertCircle } from "lucide-react"

export function InventoryTrends() {
  // Mock data for inventory trends
  const stockLevelData = [
    { date: "2024-01-01", totalStock: 1250, lowStock: 45, outOfStock: 8 },
    { date: "2024-01-15", totalStock: 1180, lowStock: 52, outOfStock: 12 },
    { date: "2024-02-01", totalStock: 1320, lowStock: 38, outOfStock: 5 },
    { date: "2024-02-15", totalStock: 1280, lowStock: 41, outOfStock: 7 },
    { date: "2024-03-01", totalStock: 1450, lowStock: 35, outOfStock: 3 },
    { date: "2024-03-15", totalStock: 1380, lowStock: 42, outOfStock: 6 },
  ]

  const turnoverData = [
    { category: "Electronics", turnover: 8.5, avgDays: 42 },
    { category: "Clothing", turnover: 12.2, avgDays: 30 },
    { category: "Home & Garden", turnover: 6.8, avgDays: 54 },
    { category: "Sports", turnover: 9.1, avgDays: 40 },
    { category: "Books", turnover: 4.2, avgDays: 87 },
  ]

  const forecastData = [
    { month: "Apr", predicted: 1420, actual: 1380, confidence: 85 },
    { month: "May", predicted: 1480, actual: null, confidence: 78 },
    { month: "Jun", predicted: 1520, actual: null, confidence: 72 },
    { month: "Jul", predicted: 1450, actual: null, confidence: 68 },
  ]

  return (
    <div className="space-y-6">
      {/* Stock Level Trends */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="group hover:scale-[1.02] transition-all duration-300 bg-black/40 backdrop-blur-sm border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/10">
          <CardHeader>
            <CardTitle className="text-white">Stock Level Trends</CardTitle>
            <CardDescription className="text-white/60">Track inventory levels over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                totalStock: {
                  label: "Total Stock",
                  color: "#3b82f6",
                },
                lowStock: {
                  label: "Low Stock",
                  color: "#f59e0b",
                },
                outOfStock: {
                  label: "Out of Stock",
                  color: "#ef4444",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stockLevelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="date" stroke="#ffffff60" />
                  <YAxis stroke="#ffffff60" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="totalStock"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="lowStock"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="outOfStock"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Inventory Turnover */}
        <Card className="group hover:scale-[1.02] transition-all duration-300 bg-black/40 backdrop-blur-sm border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-green-500/10">
          <CardHeader>
            <CardTitle className="text-white">Inventory Turnover</CardTitle>
            <CardDescription className="text-white/60">Turnover rates by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                turnover: {
                  label: "Turnover Rate",
                  color: "#10b981",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={turnoverData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis type="number" stroke="#ffffff60" />
                  <YAxis dataKey="category" type="category" stroke="#ffffff60" width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="turnover" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Forecast */}
      <Card className="group hover:scale-[1.01] transition-all duration-300 bg-black/40 backdrop-blur-sm border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/10">
        <CardHeader>
          <CardTitle className="text-white">Inventory Forecast</CardTitle>
          <CardDescription className="text-white/60">Predicted inventory levels for upcoming months</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              predicted: {
                label: "Predicted",
                color: "#8b5cf6",
              },
              actual: {
                label: "Actual",
                color: "#3b82f6",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <defs>
                  <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="month" stroke="#ffffff60" />
                <YAxis stroke="#ffffff60" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="group hover:scale-105 transition-all duration-300 bg-black/40 backdrop-blur-sm border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Average Turnover</CardTitle>
            <Package className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">8.2x</div>
            <div className="flex items-center text-xs">
              <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
              <span className="text-green-400">+15.3%</span>
              <span className="text-white/60 ml-1">vs last quarter</span>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:scale-105 transition-all duration-300 bg-black/40 backdrop-blur-sm border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Days to Stockout</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">45 days</div>
            <div className="flex items-center text-xs">
              <TrendingDown className="h-3 w-3 text-red-400 mr-1" />
              <span className="text-red-400">-8 days</span>
              <span className="text-white/60 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:scale-105 transition-all duration-300 bg-black/40 backdrop-blur-sm border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Forecast Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">87%</div>
            <div className="flex items-center text-xs">
              <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
              <span className="text-green-400">+5.2%</span>
              <span className="text-white/60 ml-1">improvement</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
