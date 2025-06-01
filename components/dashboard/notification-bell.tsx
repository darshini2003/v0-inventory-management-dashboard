"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: string
  title: string
  description: string
  time: string
  read: boolean
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Low Stock Alert",
      description: "Wireless Headphones are below threshold (5 remaining)",
      time: "10 minutes ago",
      read: false,
    },
    {
      id: "2",
      title: "New Order Received",
      description: "Order #1234 has been placed",
      time: "1 hour ago",
      read: false,
    },
    {
      id: "3",
      title: "Supplier Update",
      description: "Tech Solutions Inc. has updated their catalog",
      time: "3 hours ago",
      read: true,
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
              Mark all as read
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-80">
          {notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex flex-col gap-1 p-4 ${!notification.read ? "bg-muted/50" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">{notification.title}</h5>
                    {!notification.read && (
                      <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.description}</p>
                  <p className="text-xs text-muted-foreground">{notification.time}</p>
                  <Separator className="mt-2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-4">
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          )}
        </ScrollArea>
        <div className="p-4">
          <Button variant="outline" size="sm" className="w-full">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
