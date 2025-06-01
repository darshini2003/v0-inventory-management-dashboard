"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, FileText, Barcode } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface QuickActionsProps {
  userRole?: string
}

export function QuickActions({ userRole = "staff" }: QuickActionsProps) {
  const [openAddProduct, setOpenAddProduct] = useState(false)

  const canRestock = userRole === "admin" || userRole === "manager"

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and operations</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Dialog open={openAddProduct} onOpenChange={setOpenAddProduct}>
          <DialogTrigger asChild>
            <Button className="w-full justify-start bg-indigo-600 hover:bg-indigo-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Enter the details of the new product to add to inventory.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="office">Office Supplies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price
                </Label>
                <Input id="price" type="number" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Quantity
                </Label>
                <Input id="quantity" type="number" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                Save Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Generate Report
        </Button>

        <Button variant="outline">
          <Barcode className="mr-2 h-4 w-4" />
          Scan Barcode
        </Button>

        {canRestock && (
          <Button
            variant="outline"
            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-200"
          >
            Restock Low Inventory
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
