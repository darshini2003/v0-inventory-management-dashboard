"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import type { Product } from "@/lib/database-queries"

export function useInventoryUpdates(initialData: Product[] = []) {
  const [products, setProducts] = useState<Product[]>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialData.length > 0) {
      setProducts(initialData)
      setLoading(false)
    }
  }, [initialData])

  useEffect(() => {
    const supabase = createClient()
    
    // Set up real-time subscription
    const channel = supabase
      .channel("products_changes")
      .on(
        "postgres_changes",
        {
          event:\
