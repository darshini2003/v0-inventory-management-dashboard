import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    throw new Error("createClient should only be called on the client side")
  }

  // Use environment variables with fallbacks for preview
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"

  // Don't create actual client in preview mode
  if (supabaseUrl === "https://placeholder.supabase.co") {
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
          order: () => Promise.resolve({ data: [], error: null }),
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
        delete: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
      }),
    } as any
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
