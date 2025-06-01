"use client"

import { useState } from "react"
import { Bell, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRealtimeNotifications } from "@/hooks/use-realtime"

export function NotificationBell() {
  const { notifications, markAsRead, clearAll } = useRealtimeNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAsRead = (id: string) => {
    markAsRead(id)
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return timestamp.toLocaleDateString()
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="h-auto p-1 text-xs">
              Clear all
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">No notifications yet</div>
        ) : (
          <ScrollArea className="h-[300px]">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-3 cursor-pointer ${
                  !notification.read ? "bg-blue-50 dark:bg-blue-950/20" : ""
                }`}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{notification.title}</p>
                      {!notification.read && <div className="h-2 w-2 bg-blue-500 rounded-full" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatTime(notification.timestamp)}</p>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkAsRead(notification.id)
                      }}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
