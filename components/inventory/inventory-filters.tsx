"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"

export function InventoryFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    const fetchFilters = async () => {
      const supabase = createClient()

      const [categoriesRes, suppliersRes] = await Promise.all([
        supabase.from("categories").select("id, name").order("name"),
        supabase.from("suppliers").select("id, name").order("name"),
      ])

      if (categoriesRes.data) setCategories(categoriesRes.data)
      if (suppliersRes.data) setSuppliers(suppliersRes.data)
    }

    fetchFilters()
  }, [])

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/dashboard/inventory?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch("")
    router.push("/dashboard/inventory")
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
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

        <Select
          value={searchParams.get("category") || "all-categories"}
          onValueChange={(value) => updateFilters("category", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-categories">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("supplier") || "all-suppliers"}
          onValueChange={(value) => updateFilters("supplier", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Supplier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-suppliers">All Suppliers</SelectItem>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.name}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("filter") || "all-items"}
          onValueChange={(value) => updateFilters("filter", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Stock Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-items">All Items</SelectItem>
            <SelectItem value="low-stock">Low Stock</SelectItem>
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
