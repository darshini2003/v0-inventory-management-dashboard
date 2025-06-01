"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Box, CheckCircle } from "lucide-react"
import { auth } from "@/lib/auth"
import { AnimatedBackground } from "@/components/ui/animated-background"

export default function RegisterPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    try {
      await auth.signUp(email, password, fullName)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "An error occurred during registration")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AnimatedBackground className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="bg-black/40 border-gray-800 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-white">Check your email</CardTitle>
              <CardDescription className="text-gray-400">We've sent you a confirmation link at {email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-400">
                  Click the link in the email to verify your account and complete registration.
                </p>
                <Button asChild className="w-full">
                  <Link href="/auth/login">Back to login</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AnimatedBackground>
    )
  }

  return (
    <AnimatedBackground className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Box className="h-12 w-12 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">StockSync Cloud</h2>
          <p className="mt-2 text-sm text-gray-400">Create your account</p>
        </div>

        <Card className="bg-black/40 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Get started</CardTitle>
            <CardDescription className="text-gray-400">Create your account to start managing inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white">
                  Full name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Create a password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">
                  Confirm password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Confirm your password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <div className="text-sm text-gray-400">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500">
                  Sign in
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AnimatedBackground>
  )
}
