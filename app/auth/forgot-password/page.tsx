"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Box, Mail } from "lucide-react"
import { auth } from "@/lib/auth"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await auth.resetPassword(email)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "An error occurred while sending reset email")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <Mail className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <CardTitle>Check your email</CardTitle>
              <CardDescription>We've sent a password reset link to {email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Click the link in the email to reset your password. The link will expire in 1 hour.
                </p>
                <Button asChild className="w-full">
                  <Link href="/auth/login">Back to login</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Box className="h-12 w-12 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">StockSync Cloud</h2>
          <p className="mt-2 text-sm text-gray-600">Reset your password</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Forgot your password?</CardTitle>
            <CardDescription>Enter your email address and we'll send you a link to reset your password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send reset link
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/auth/login" className="text-sm text-indigo-600 hover:text-indigo-500">
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
