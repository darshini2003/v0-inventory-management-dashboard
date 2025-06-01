"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { Loader2, Box } from "lucide-react"
import { auth } from "@/lib/auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await auth.signIn(email, password)
      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatedBackground className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <div className="flex justify-center">
            <Box className="h-12 w-12 text-emerald-500" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">StockSync</h2>
          <p className="mt-2 text-sm text-gray-400">Sign in to your account</p>
        </div>

        <Card className="bg-black/40 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Welcome back</CardTitle>
            <CardDescription className="text-gray-400">Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-800">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter your email"
                  className="bg-black/40 border-gray-700 text-white placeholder-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter your password"
                  className="bg-black/40 border-gray-700 text-white placeholder-gray-500"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <Link href="/auth/forgot-password" className="text-sm text-emerald-400 hover:text-emerald-300">
                Forgot your password?
              </Link>
              <div className="text-sm text-gray-400">
                Don't have an account?{" "}
                <Link href="/auth/register" className="text-emerald-400 hover:text-emerald-300">
                  Sign up
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatedBackground>
  )
}
