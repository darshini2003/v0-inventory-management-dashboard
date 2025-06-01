"use client"

import type React from "react"
import { useEffect, useRef, useCallback, useState } from "react"

interface Dot {
  x: number
  y: number
  baseOpacity: number
  currentOpacity: number
  opacitySpeed: number
  baseRadius: number
  currentRadius: number
  targetOpacity: number
}

interface AnimatedBackgroundProps {
  className?: string
  dotSpacing?: number
  interactionRadius?: number
  baseOpacity?: number
  children?: React.ReactNode
  intensity?: "low" | "medium" | "high"
}

export function AnimatedBackground({
  className = "",
  dotSpacing = 30,
  interactionRadius = 120,
  baseOpacity = 0.6,
  children,
  intensity = "medium",
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number | null>(null)
  const dotsRef = useRef<Dot[]>([])
  const gridRef = useRef<Record<string, number[]>>({})
  const mousePositionRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null })
  const [isInitialized, setIsInitialized] = useState(false)

  const GRID_CELL_SIZE = Math.max(50, Math.floor(interactionRadius / 2))
  const intensityMultiplier = intensity === "low" ? 0.5 : intensity === "high" ? 1.5 : 1

  const createDots = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const { width, height } = canvas
    if (width === 0 || height === 0) return

    const newDots: Dot[] = []
    const newGrid: Record<string, number[]> = {}
    const cols = Math.ceil(width / dotSpacing)
    const rows = Math.ceil(height / dotSpacing)

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * dotSpacing + dotSpacing / 2
        const y = j * dotSpacing + dotSpacing / 2

        // Skip if outside canvas bounds
        if (x < 0 || x > width || y < 0 || y > height) continue

        const cellX = Math.floor(x / GRID_CELL_SIZE)
        const cellY = Math.floor(y / GRID_CELL_SIZE)
        const cellKey = `${cellX}_${cellY}`

        if (!newGrid[cellKey]) {
          newGrid[cellKey] = []
        }

        const dotIndex = newDots.length
        newGrid[cellKey].push(dotIndex)

        const targetOpacity = (Math.random() * 0.4 + 0.3) * baseOpacity * intensityMultiplier
        newDots.push({
          x,
          y,
          baseOpacity: targetOpacity,
          currentOpacity: targetOpacity,
          opacitySpeed: (Math.random() * 0.008 + 0.002) * intensityMultiplier,
          baseRadius: 1.2,
          currentRadius: 1.2,
          targetOpacity,
        })
      }
    }

    dotsRef.current = newDots
    gridRef.current = newGrid
    setIsInitialized(true)
  }, [dotSpacing, baseOpacity, GRID_CELL_SIZE, intensityMultiplier])

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const container = canvas.parentElement
    if (!container) return

    const rect = container.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    // Set canvas size with device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.scale(dpr, dpr)
    }

    createDots()
  }, [createDots])

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    mousePositionRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    mousePositionRef.current = { x: null, y: null }
  }, [])

  const animateDots = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    const dots = dotsRef.current
    const grid = gridRef.current
    const { x: mouseX, y: mouseY } = mousePositionRef.current

    if (!ctx || !canvas || !dots.length) {
      animationFrameId.current = requestAnimationFrame(animateDots)
      return
    }

    const { width, height } = canvas.getBoundingClientRect()
    ctx.clearRect(0, 0, width, height)

    // Get active dots near mouse
    const activeDotIndices = new Set<number>()
    if (mouseX !== null && mouseY !== null) {
      const mouseCellX = Math.floor(mouseX / GRID_CELL_SIZE)
      const mouseCellY = Math.floor(mouseY / GRID_CELL_SIZE)
      const searchRadius = Math.ceil(interactionRadius / GRID_CELL_SIZE)

      for (let i = -searchRadius; i <= searchRadius; i++) {
        for (let j = -searchRadius; j <= searchRadius; j++) {
          const cellKey = `${mouseCellX + i}_${mouseCellY + j}`
          if (grid[cellKey]) {
            grid[cellKey].forEach((dotIndex) => activeDotIndices.add(dotIndex))
          }
        }
      }
    }

    dots.forEach((dot, index) => {
      // Animate base opacity
      dot.currentOpacity += dot.opacitySpeed
      if (dot.currentOpacity >= dot.targetOpacity + 0.2 || dot.currentOpacity <= dot.targetOpacity - 0.2) {
        dot.opacitySpeed = -dot.opacitySpeed
        dot.currentOpacity = Math.max(0.1, Math.min(dot.currentOpacity, dot.targetOpacity + 0.2))
      }

      let finalOpacity = dot.currentOpacity
      let finalRadius = dot.baseRadius

      // Mouse interaction
      if (mouseX !== null && mouseY !== null && activeDotIndices.has(index)) {
        const dx = dot.x - mouseX
        const dy = dot.y - mouseY
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < interactionRadius) {
          const interactionFactor = Math.max(0, 1 - distance / interactionRadius)
          const smoothFactor = interactionFactor * interactionFactor
          finalOpacity = Math.min(1, dot.currentOpacity + smoothFactor * 0.8)
          finalRadius = dot.baseRadius + smoothFactor * 2.5
        }
      }

      // Draw dot with enhanced visibility
      ctx.beginPath()
      ctx.fillStyle = `rgba(87, 220, 205, ${finalOpacity})`
      ctx.arc(dot.x, dot.y, finalRadius, 0, Math.PI * 2)
      ctx.fill()

      // Add subtle glow effect for better visibility
      if (finalOpacity > 0.5) {
        ctx.beginPath()
        ctx.fillStyle = `rgba(87, 220, 205, ${finalOpacity * 0.3})`
        ctx.arc(dot.x, dot.y, finalRadius * 2, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    // Draw connections between nearby dots
    dots.forEach((dot, i) => {
      dots.slice(i + 1).forEach((otherDot) => {
        const dx = dot.x - otherDot.x
        const dy = dot.y - otherDot.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < dotSpacing * 1.8 && distance > 0) {
          const opacity = Math.max(0, (dotSpacing * 1.8 - distance) / (dotSpacing * 1.8)) * 0.15 * intensityMultiplier
          if (opacity > 0.02) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(87, 220, 205, ${opacity})`
            ctx.lineWidth = 0.8
            ctx.moveTo(dot.x, dot.y)
            ctx.lineTo(otherDot.x, otherDot.y)
            ctx.stroke()
          }
        }
      })
    })

    animationFrameId.current = requestAnimationFrame(animateDots)
  }, [interactionRadius, dotSpacing, GRID_CELL_SIZE, intensityMultiplier])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(canvas.parentElement!)

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    document.addEventListener("mouseleave", handleMouseLeave)

    // Initial setup
    handleResize()

    // Start animation after a short delay to ensure canvas is ready
    const timeoutId = setTimeout(() => {
      animationFrameId.current = requestAnimationFrame(animateDots)
    }, 100)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
      clearTimeout(timeoutId)
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [handleResize, handleMouseMove, handleMouseLeave, animateDots])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Fallback gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />

      {/* Canvas for dot matrix */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }} />

      {/* Content overlay */}
      <div className="relative z-10">{children}</div>

      {/* Loading indicator */}
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
