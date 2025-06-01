"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

export default function VerifyPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const verifyUser = async () => {
      const supabase = createClient()

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: searchParams.get("token_hash") || "",
          type: "email",
        })

        if (error) {
          throw error
        }

        setSuccess(true)

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push("/dashboard")
        }, 3000)
      } catch (err: any) {
        setError(err.message || "Verification failed")
      } finally {
        setLoading(false)
      }
    }

    if (searchParams.get("token_hash")) {
      verifyUser()
    } else {
      setError("Invalid verification link")
      setLoading(false)
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            {loading && <Loader2 className="h-12 w-12 text-indigo-600 mx-auto mb-4 animate-spin" />}
            {success && <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />}
            {error && <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />}

            <CardTitle>
              {loading && "Verifying your email..."}
              {success && "Email verified!"}
              {error && "Verification failed"}
            </CardTitle>

            <CardDescription>
              {loading && "Please wait while we verify your email address."}
              {success && "Your email has been successfully verified. Redirecting to dashboard..."}
              {error && "There was a problem verifying your email address."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="text-center space-y-4">
              {success && (
                <p className="text-sm text-gray-600">You will be redirected automatically, or you can click below.</p>
              )}

              <Button asChild className="w-full">
                <Link href={success ? "/dashboard" : "/auth/login"}>
                  {success ? "Go to Dashboard" : "Back to Login"}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
