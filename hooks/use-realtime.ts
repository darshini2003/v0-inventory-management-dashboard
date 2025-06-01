"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export function useRealtimeSubscription<T>(table: string, filter?: string, initialData: T[] = []) {
  const [data, setData] = useState<T[]>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel

    const setupSubscription = async () => {
      try {
        // Initial data fetch
        let query = supabase.from(table).select("*")

        if (filter) {
          // Apply filter if provided
          query = query.filter(filter.split("=")[0], "eq", filter.split("=")[1])
        }

        const { data: initialData, error: fetchError } = await query

        if (fetchError) {
          throw fetchError
        }

        setData(initialData || [])
        setLoading(false)

        // Set up real-time subscription
        channel = supabase
          .channel(`${table}_changes`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: table,
            },
            (payload) => {
              console.log("Real-time update:", payload)

              if (payload.eventType === "INSERT") {
                setData((current) => [...current, payload.new as T])
              } else if (payload.eventType === "UPDATE") {
                setData((current) =>
                  current.map((item) => ((item as any).id === payload.new.id ? (payload.new as T) : item)),
                )
              } else if (payload.eventType === "DELETE") {
                setData((current) => current.filter((item) => (item as any).id !== payload.old.id))
              }
            },
          )
          .subscribe()
      } catch (err: any) {
        setError(err.message)
        setLoading(false)
      }
    }

    setupSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [table, filter])

  return { data, loading, error, setData }
}

export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activities",
        },
        (payload) => {
          // Create notification from activity
          const notification = {
            id: payload.new.id,
            title: `${payload.new.action} ${payload.new.item_type}`,
            description: `${payload.new.item_name} was ${payload.new.action}d by ${payload.new.user_name}`,
            time: "Just now",
            read: false,
          }

          setNotifications((current) => [notification, ...current.slice(0, 9)]) // Keep last 10
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { notifications, setNotifications }
}
