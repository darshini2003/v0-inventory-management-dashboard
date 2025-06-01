"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Filter, X } from "lucide-react"
import { useState } from "react"

export function AnalyticsFilters() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])

  const categories = ["Electronics", "Clothing", "Home & Garden", "Sports", "Books"]
  const suppliers = ["TechCorp", "FashionPlus", "HomeGoods Inc", "SportsPro", "BookWorld"]

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const toggleSupplier = (supplier: string) => {
    setSelectedSuppliers((prev) => (prev.includes(supplier) ? prev.filter((s) => s !== supplier) : [...prev, supplier]))
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedSuppliers([])
  }

  const hasFilters = selectedCategories.length > 0 || selectedSuppliers.length > 0

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="bg-black/40 backdrop-blur-sm border-white/10 hover:border-white/20 text-white hover:bg-white/10"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {hasFilters && (
              <Badge variant="secondary" className="ml-2 bg-blue-500/20 text-blue-400 border-blue-500/30">
                {selectedCategories.length + selectedSuppliers.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-black/90 backdrop-blur-sm border-white/10 text-white" align="end">
          <DropdownMenuLabel>Categories</DropdownMenuLabel>
          {categories.map((category) => (
            <DropdownMenuCheckboxItem
              key={category}
              checked={selectedCategories.includes(category)}
              onCheckedChange={() => toggleCategory(category)}
              className="hover:bg-white/10"
            >
              {category}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator className="bg-white/10" />

          <DropdownMenuLabel>Suppliers</DropdownMenuLabel>
          {suppliers.map((supplier) => (
            <DropdownMenuCheckboxItem
              key={supplier}
              checked={selectedSuppliers.includes(supplier)}
              onCheckedChange={() => toggleSupplier(supplier)}
              className="hover:bg-white/10"
            >
              {supplier}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-white/60 hover:text-white hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
