"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function ProfileSettings() {
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        setProfile(data)
      }
    }

    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: formData.get("full_name") as string,
            updated_at: new Date().toISOString(),
          })
          .eq("id", session.user.id)

        if (error) throw error

        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!profile) return <div>Loading...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal information and account settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" name="full_name" defaultValue={profile.full_name || ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile.email} disabled className="bg-muted" />
            <p className="text-sm text-muted-foreground">Email cannot be changed from this interface.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={profile.role} disabled className="bg-muted capitalize" />
          </div>

          <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
            {loading ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
