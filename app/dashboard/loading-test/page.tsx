"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  LoadingSpinner,
  PulseDots,
  ShimmerSkeleton,
  TableLoading,
  CardLoading,
  ProgressBar,
  LoadingOverlay,
} from "@/components/ui/loading-states"
import { DashboardSummaryCards } from "@/components/dashboard/dashboard-summary-cards"
import { InventoryChart } from "@/components/dashboard/inventory-chart"
import { QuickScan } from "@/components/dashboard/quick-scan"

export default function LoadingTestPage() {
  const [progress, setProgress] = useState(0)
  const [showOverlay, setShowOverlay] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1))
    }, 50)

    return () => clearInterval(interval)
  }, [])

  const triggerOverlay = () => {
    setShowOverlay(true)
    setTimeout(() => setShowOverlay(false), 3000)
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Loading Animations Test</h1>
        <Button onClick={triggerOverlay}>Test Overlay</Button>
      </div>

      {/* Loading Spinners */}
      <Card>
        <CardHeader>
          <CardTitle>Loading Spinners</CardTitle>
          <CardDescription>Different sizes and styles of loading spinners</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-8">
          <div className="text-center space-y-2">
            <LoadingSpinner size="sm" />
            <p className="text-sm">Small</p>
          </div>
          <div className="text-center space-y-2">
            <LoadingSpinner size="md" />
            <p className="text-sm">Medium</p>
          </div>
          <div className="text-center space-y-2">
            <LoadingSpinner size="lg" />
            <p className="text-sm">Large</p>
          </div>
          <div className="text-center space-y-2">
            <PulseDots />
            <p className="text-sm">Pulse Dots</p>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Bar</CardTitle>
          <CardDescription>Animated progress indicator</CardDescription>
        </CardHeader>
        <CardContent>
          <ProgressBar progress={progress} />
        </CardContent>
      </Card>

      {/* Shimmer Skeletons */}
      <Card>
        <CardHeader>
          <CardTitle>Shimmer Skeletons</CardTitle>
          <CardDescription>Placeholder content with shimmer effect</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ShimmerSkeleton className="h-4 w-3/4" />
          <ShimmerSkeleton className="h-6 w-1/2" />
          <ShimmerSkeleton className="h-8 w-2/3" />
          <ShimmerSkeleton className="h-32 w-full" />
        </CardContent>
      </Card>

      {/* Table Loading */}
      <Card>
        <CardHeader>
          <CardTitle>Table Loading</CardTitle>
          <CardDescription>Loading state for data tables</CardDescription>
        </CardHeader>
        <CardContent>
          <TableLoading rows={3} columns={4} />
        </CardContent>
      </Card>

      {/* Card Loading */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CardLoading />
        <CardLoading />
        <CardLoading />
        <CardLoading />
      </div>

      {/* Dashboard Components with Loading */}
      <LoadingOverlay isLoading={showOverlay} message="Testing overlay loading...">
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardSummaryCards />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <InventoryChart />
            </div>
            <QuickScan />
          </div>
        </div>
      </LoadingOverlay>
    </div>
  )
}
