"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

interface User {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

      if (data) setUsers(data)
      setLoading(false)
    }

    fetchUsers()
  }, [])

  const updateUserRole = async (userId: string, newRole: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId)

      if (error) throw error

      setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))

      toast({
        title: "Role updated",
        description: "User role has been successfully updated.",
      })
    } catch (error) {
      console.error("Error updating role:", error)
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500"
      case "manager":
        return "bg-blue-500"
      case "staff":
        return "bg-emerald-500"
      default:
        return "bg-slate-500"
    }
  }

  if (loading) return <div>Loading users...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage user roles and permissions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{user.full_name || "No name"}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRoleColor(user.role)} variant="secondary">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</TableCell>
                <TableCell className="text-right">
                  <Select value={user.role} onValueChange={(value) => updateUserRole(user.id, value)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
