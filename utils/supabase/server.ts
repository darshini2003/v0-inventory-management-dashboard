import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Add better error handling for server-side
export async function createClient() {
  // Use environment variables with fallbacks for preview
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"

  // Don't create actual client in preview mode
  if (supabaseUrl === "https://placeholder.supabase.co") {
    return {
      auth: {
        getSession: () =>
          Promise.resolve({
            data: {
              session: {
                user: {
                  id: "demo-user-id",
                  email: "demo@stocksync.com",
                },
              },
            },
            error: null,
          }),
        getUser: () =>
          Promise.resolve({
            data: {
              user: {
                id: "demo-user-id",
                email: "demo@stocksync.com",
              },
            },
            error: null,
          }),
      },
      from: (table: string) => ({
        select: (columns?: string) => ({
          eq: (column: string, value: any) => ({
            single: () =>
              Promise.resolve({
                data:
                  table === "profiles"
                    ? {
                        id: "demo-user-id",
                        role: "admin",
                        email: "demo@stocksync.com",
                        full_name: "Demo User",
                      }
                    : null,
                error: null,
              }),
          }),
          order: (column: string) => Promise.resolve({ data: [], error: null }),
          limit: (count: number) => Promise.resolve({ data: [], error: null }),
          count: "exact",
          head: true,
        }),
        insert: (data: any) => Promise.resolve({ data: null, error: null }),
        update: (data: any) => ({
          eq: (column: string, value: any) => Promise.resolve({ error: null }),
        }),
        delete: () => ({
          eq: (column: string, value: any) => Promise.resolve({ error: null }),
        }),
      }),
    } as any
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // Handle cookie setting errors in preview environment
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // Handle cookie removal errors in preview environment
        }
      },
    },
  })
}
