import { createClient } from "@/utils/supabase/client"
import { createClient as createServerClient } from "@/utils/supabase/server"

export interface User {
  id: string
  email: string
  full_name?: string
  role: "admin" | "manager" | "staff"
  avatar_url?: string
}

export interface AuthError {
  message: string
  status?: number
}

// Client-side auth functions
export const auth = {
  // Sign up new user
  async signUp(email: string, password: string, fullName?: string) {
    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      throw new AuthError(error.message)
    }

    return data
  },

  // Sign in user
  async signIn(email: string, password: string) {
    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new AuthError(error.message)
    }

    return data
  },

  // Sign out user
  async signOut() {
    const supabase = createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new AuthError(error.message)
    }
  },

  // Reset password
  async resetPassword(email: string) {
    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      throw new AuthError(error.message)
    }
  },

  // Update password
  async updatePassword(password: string) {
    const supabase = createClient()

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      throw new AuthError(error.message)
    }
  },

  // Get current session
  async getSession() {
    const supabase = createClient()

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      throw new AuthError(error.message)
    }

    return session
  },

  // Get current user with profile
  async getCurrentUser(): Promise<User | null> {
    const supabase = createClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return null
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    if (!profile) {
      return null
    }

    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      avatar_url: profile.avatar_url,
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback: (user: User | null) => void) {
    const supabase = createClient()

    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser()
        callback(user)
      } else {
        callback(null)
      }
    })
  },
}

// Server-side auth functions
export const serverAuth = {
  // Get current user on server
  async getCurrentUser(): Promise<User | null> {
    const supabase = await createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return null
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    if (!profile) {
      return null
    }

    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      avatar_url: profile.avatar_url,
    }
  },

  // Check if user has required role
  async hasRole(requiredRoles: string[]): Promise<boolean> {
    const user = await this.getCurrentUser()

    if (!user) {
      return false
    }

    return requiredRoles.includes(user.role)
  },
}

// Custom error class
class AuthError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = "AuthError"
    this.status = status
  }
}
