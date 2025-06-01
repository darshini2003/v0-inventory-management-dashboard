"use client"

import type React from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn("animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600", sizeClasses[size])}
      />
      <div
        className={cn(
          "absolute inset-0 animate-ping rounded-full border-2 border-indigo-300 opacity-20",
          sizeClasses[size],
        )}
      />
    </div>
  )
}

interface PulseDotsProps {
  className?: string
}

export function PulseDots({ className }: PulseDotsProps) {
  return (
    <div className={cn("flex justify-center space-x-1", className)}>
      <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  )
}

interface ShimmerSkeletonProps {
  className?: string
  children?: React.ReactNode
}

export function ShimmerSkeleton({ className, children }: ShimmerSkeletonProps) {
  return (
    <div
      className={cn(
        "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded",
        className,
      )}
    >
      {children}
    </div>
  )
}

interface TableLoadingProps {
  rows?: number
  columns?: number
}

export function TableLoading({ rows = 5, columns = 4 }: TableLoadingProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <ShimmerSkeleton key={i} className="h-4 w-full" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <ShimmerSkeleton key={colIndex} className="h-6 w-full" />
          ))}
        </div>
      ))}
    </div>
  )
}

interface CardLoadingProps {
  className?: string
}

export function CardLoading({ className }: CardLoadingProps) {
  return (
    <Card className={cn("animate-pulse", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <ShimmerSkeleton className="h-4 w-[100px]" />
        <ShimmerSkeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <ShimmerSkeleton className="h-8 w-[120px] mb-2" />
        <ShimmerSkeleton className="h-3 w-[80px]" />
      </CardContent>
    </Card>
  )
}

interface ProgressBarProps {
  progress: number
  className?: string
  showPercentage?: boolean
}

export function ProgressBar({ progress, className, showPercentage = true }: ProgressBarProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">Loading...</span>
        {showPercentage && <span className="text-sm text-gray-500">{Math.round(progress)}%</span>}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  message?: string
}

export function LoadingOverlay({ isLoading, children, message = "Loading..." }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground font-medium">{message}</p>
            <PulseDots />
          </div>
        </div>
      )}
    </div>
  )
}
