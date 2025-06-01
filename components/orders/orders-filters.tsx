"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { useState } from "react"

export function OrdersFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") || "")

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/dashboard/orders?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch("")
    router.push("/dashboard/orders")
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateFilters("search", search)
              }
            }}
            className="pl-9"
          />
        </div>

        <Select value={searchParams.get("status") || "all"} onValueChange={(value) => updateFilters("status", value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => updateFilters("search", search)} className="shrink-0">
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
        <Button variant="outline" onClick={clearFilters} className="shrink-0">
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  )
}
