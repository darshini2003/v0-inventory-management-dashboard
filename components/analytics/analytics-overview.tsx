import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Package, DollarSign, ShoppingCart, AlertTriangle, Target, Zap } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export async function AnalyticsOverview() {
  const supabase = createClient()

  // Mock data for preview mode
  const mockData = {
    kpis: {
      totalRevenue: 125000,
      revenueGrowth: 12.5,
      totalOrders: 1250,
      ordersGrowth: 8.2,
      inventoryValue: 85000,
      inventoryGrowth: -2.1,
      lowStockItems: 15,
      stockGrowth: -25.0,
    },
    revenueData: [
      { month: "Jan", revenue: 8500, orders: 85 },
      { month: "Feb", revenue: 9200, orders: 92 },
      { month: "Mar", revenue: 10100, orders: 101 },
      { month: "Apr", revenue: 11500, orders: 115 },
      { month: "May", revenue: 12800, orders: 128 },
      { month: "Jun", revenue: 14200, orders: 142 },
    ],
    categoryData: [
      { name: "Electronics", value: 35, color: "#3b82f6" },
      { name: "Clothing", value: 25, color: "#10b981" },
      { name: "Home & Garden", value: 20, color: "#f59e0b" },
      { name: "Sports", value: 12, color: "#ef4444" },
      { name: "Books", value: 8, color: "#8b5cf6" },
    ],
    insights: [
      {
        title: "Revenue Growth",
        description: "Monthly revenue increased by 12.5% compared to last month",
        type: "positive",
        action: "Continue current sales strategy",
      },
      {
        title: "Low Stock Alert",
        description: "15 products are below their reorder threshold",
        type: "warning",
        action: "Review and reorder critical items",
      },
      {
        title: "Top Category",
        description: "Electronics category shows strongest performance",
        type: "info",
        action: "Consider expanding electronics inventory",
      },
    ],
  }

  try {
    // In a real implementation, fetch actual data from Supabase
    const data = mockData

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="group hover:scale-105 transition-all duration-300 bg-black/40 backdrop-blur-sm border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${data.kpis.totalRevenue.toLocaleString()}</div>
              <div className="flex items-center text-xs">
                <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
                <span className="text-green-400">+{data.kpis.revenueGrowth}%</span>
                <span className="text-white/60 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:scale-105 transition-all duration-300 bg-black/40 backdrop-blur-sm border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-purple-400 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{data.kpis.totalOrders.toLocaleString()}</div>
              <div className="flex items-center text-xs">
                <TrendingUp className="h-3 w-3 text-purple-400 mr-1" />
                <span className="text-purple-400">+{data.kpis.ordersGrowth}%</span>
                <span className="text-white/60 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:scale-105 transition-all duration-300 bg-black/40 backdrop-blur-sm border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Inventory Value</CardTitle>
              <Package className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${data.kpis.inventoryValue.toLocaleString()}</div>
              <div className="flex items-center text-xs">
                <TrendingDown className="h-3 w-3 text-red-400 mr-1" />
                <span className="text-red-400">{data.kpis.inventoryGrowth}%</span>
                <span className="text-white/60 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:scale-105 transition-all duration-300 bg-black/40 backdrop-blur-sm border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-amber-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{data.kpis.lowStockItems}</div>
              <div className="flex items-center text-xs">
                <TrendingDown className="h-3 w-3 text-green-400 mr-1" />
                <span className="text-green-400">{Math.abs(data.kpis.stockGrowth)}%</span>
                <span className="text-white/60 ml-1">improvement</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Trend Chart */}
          <Card className="group hover:scale-[1.02] transition-all duration-300 bg-black/40 backdrop-blur-sm border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/10">
            <CardHeader>
              <CardTitle className="text-white">Revenue Trend</CardTitle>
              <CardDescription className="text-white/60">Monthly revenue and order trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue",
                    color: "#3b82f6",
                  },
                  orders: {
                    label: "Orders",
                    color: "#10b981",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="month" stroke="#ffffff60" />
                    <YAxis stroke="#ffffff60" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#revenueGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="group hover:scale-[1.02] transition-all duration-300 bg-black/40 backdrop-blur-sm border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/10">
            <CardHeader>
              <CardTitle className="text-white">Category Distribution</CardTitle>
              <CardDescription className="text-white/60">Sales distribution by product category</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: {
                    label: "Percentage",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-4 space-y-2">
                {data.categoryData.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                      <span className="text-sm text-white/80">{category.name}</span>
                    </div>
                    <span className="text-sm font-medium text-white">{category.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights Section */}
        <Card className="group hover:scale-[1.01] transition-all duration-300 bg-black/40 backdrop-blur-sm border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-green-500/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              AI-Powered Insights
            </CardTitle>
            <CardDescription className="text-white/60">
              Automated insights and recommendations based on your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.insights.map((insight, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-white">{insight.title}</h4>
                        <Badge
                          variant="secondary"
                          className={`
                            ${insight.type === "positive" ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}
                            ${insight.type === "warning" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : ""}
                            ${insight.type === "info" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : ""}
                          `}
                        >
                          {insight.type === "positive" && <TrendingUp className="h-3 w-3 mr-1" />}
                          {insight.type === "warning" && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {insight.type === "info" && <Target className="h-3 w-3 mr-1" />}
                          {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-white/70 mb-2">{insight.description}</p>
                      <p className="text-xs text-white/50">Recommended action: {insight.action}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    return (
      <div className="text-center py-8">
        <p className="text-white/60">Unable to load analytics data</p>
      </div>
    )
  }
}
