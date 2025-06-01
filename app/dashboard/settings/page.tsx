import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import DashboardShell from "@/components/dashboard/dashboard-shell"
import { SettingsTabs } from "@/components/settings/settings-tabs"

export default async function SettingsPage() {
  const supabase = createClient()

  // Get user session and role
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // Only admin can access settings
  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Settings" text="Manage your application settings and preferences." />
      <SettingsTabs />
    </DashboardShell>
  )
}
