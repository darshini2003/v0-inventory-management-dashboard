"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function SystemSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Configure general system settings and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input id="company_name" defaultValue="StockSync Cloud" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="default_currency">Default Currency</Label>
            <Input id="default_currency" defaultValue="USD" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Low Stock Notifications</Label>
              <p className="text-sm text-muted-foreground">Send notifications when products are low in stock</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Send email notifications for important events</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Button className="bg-indigo-600 hover:bg-indigo-700">Save Settings</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Manage your data and system maintenance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Export Data</h4>
              <p className="text-sm text-muted-foreground">Download a complete backup of your data</p>
            </div>
            <Button variant="outline">Export</Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Clear Activity Logs</h4>
              <p className="text-sm text-muted-foreground">Remove old activity logs (older than 90 days)</p>
            </div>
            <Button variant="outline">Clear Logs</Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-red-600">Reset System</h4>
              <p className="text-sm text-muted-foreground">This will delete all data and cannot be undone</p>
            </div>
            <Button variant="destructive">Reset</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
