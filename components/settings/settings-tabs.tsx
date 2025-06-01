"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileSettings } from "./profile-settings"
import { UserManagement } from "./user-management"
import { SystemSettings } from "./system-settings"

export function SettingsTabs() {
  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="users">User Management</TabsTrigger>
        <TabsTrigger value="system">System</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileSettings />
      </TabsContent>

      <TabsContent value="users">
        <UserManagement />
      </TabsContent>

      <TabsContent value="system">
        <SystemSettings />
      </TabsContent>
    </Tabs>
  )
}
