"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExportButton } from "@/components/analytics/export-button"
import { FileSpreadsheet, FileText, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Mock data for preview
const mockData = {
  inventory: {
    headers: ["ID", "Name", "SKU", "Category", "Supplier", "Price", "Cost", "Quantity", "Threshold", "Last Updated"],
    data: [
      {
        id: "1",
        name: "Wireless Headphones",
        sku: "WH-001",
        category: "Electronics",
        supplier: "TechCorp",
        price: 89.99,
        cost: 45.0,
        quantity: 120,
        threshold: 20,
        lastUpdated: "2024-05-28",
      },
      {
        id: "2",
        name: "Ergonomic Keyboard",
        sku: "KB-002",
        category: "Electronics",
        supplier: "TechCorp",
        price: 129.99,
        cost: 65.0,
        quantity: 85,
        threshold: 15,
        lastUpdated: "2024-05-27",
      },
      {
        id: "3",
        name: "Cotton T-Shirt",
        sku: "TS-001",
        category: "Clothing",
        supplier: "FashionPlus",
        price: 24.99,
        cost: 8.5,
        quantity: 250,
        threshold: 50,
        lastUpdated: "2024-05-25",
      },
      {
        id: "4",
        name: "Stainless Steel Water Bottle",
        sku: "WB-001",
        category: "Home & Garden",
        supplier: "HomeGoods Inc",
        price: 19.99,
        cost: 7.25,
        quantity: 180,
        threshold: 30,
        lastUpdated: "2024-05-26",
      },
      {
        id: "5",
        name: "Yoga Mat",
        sku: "YM-001",
        category: "Sports",
        supplier: "SportsPro",
        price: 34.99,
        cost: 12.75,
        quantity: 95,
        threshold: 20,
        lastUpdated: "2024-05-24",
      },
    ],
  },
  sales: {
    headers: ["Order ID", "Date", "Customer", "Status", "Items", "Total", "Payment Method"],
    data: [
      {
        id: "ORD-001",
        date: "2024-05-28",
        customer: "John Smith",
        status: "Completed",
        items: 3,
        total: 154.97,
        paymentMethod: "Credit Card",
      },
      {
        id: "ORD-002",
        date: "2024-05-27",
        customer: "Sarah Johnson",
        status: "Processing",
        items: 2,
        total: 219.98,
        paymentMethod: "PayPal",
      },
      {
        id: "ORD-003",
        date: "2024-05-27",
        customer: "Michael Brown",
        status: "Completed",
        items: 1,
        total: 89.99,
        paymentMethod: "Credit Card",
      },
      {
        id: "ORD-004",
        date: "2024-05-26",
        customer: "Emily Davis",
        status: "Shipped",
        items: 4,
        total: 104.96,
        paymentMethod: "Credit Card",
      },
      {
        id: "ORD-005",
        date: "2024-05-25",
        customer: "Robert Wilson",
        status: "Completed",
        items: 2,
        total: 59.98,
        paymentMethod: "PayPal",
      },
    ],
  },
  suppliers: {
    headers: ["ID", "Name", "Contact Person", "Email", "Phone", "Status", "Products", "Last Order"],
    data: [
      {
        id: "SUP-001",
        name: "TechCorp",
        contactPerson: "David Lee",
        email: "david@techcorp.com",
        phone: "555-123-4567",
        status: "Active",
        products: 45,
        lastOrder: "2024-05-20",
      },
      {
        id: "SUP-002",
        name: "FashionPlus",
        contactPerson: "Amanda Chen",
        email: "amanda@fashionplus.com",
        phone: "555-234-5678",
        status: "Active",
        products: 78,
        lastOrder: "2024-05-15",
      },
      {
        id: "SUP-003",
        name: "HomeGoods Inc",
        contactPerson: "James Wilson",
        email: "james@homegoods.com",
        phone: "555-345-6789",
        status: "Active",
        products: 32,
        lastOrder: "2024-05-22",
      },
      {
        id: "SUP-004",
        name: "SportsPro",
        contactPerson: "Lisa Rodriguez",
        email: "lisa@sportspro.com",
        phone: "555-456-7890",
        status: "Inactive",
        products: 24,
        lastOrder: "2024-04-30",
      },
      {
        id: "SUP-005",
        name: "BookWorld",
        contactPerson: "Michael Thompson",
        email: "michael@bookworld.com",
        phone: "555-567-8901",
        status: "Active",
        products: 56,
        lastOrder: "2024-05-18",
      },
    ],
  },
}

interface ExportDataTableProps {
  type: "inventory" | "sales" | "suppliers" | "all"
  description?: string
}

export function ExportDataTable({ type, description }: ExportDataTableProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Get the appropriate data based on type
  const getData = () => {
    switch (type) {
      case "inventory":
        return mockData.inventory
      case "sales":
        return mockData.sales
      case "suppliers":
        return mockData.suppliers
      case "all":
        return {
          headers: ["Type", "Count", "Last Updated"],
          data: [
            { type: "Products", count: 1250, lastUpdated: "2024-05-28" },
            { type: "Orders", count: 845, lastUpdated: "2024-05-28" },
            { type: "Suppliers", count: 32, lastUpdated: "2024-05-27" },
            { type: "Customers", count: 1520, lastUpdated: "2024-05-28" },
            { type: "Categories", count: 18, lastUpdated: "2024-05-20" },
          ],
        }
    }
  }

  const { headers, data } = getData()

  const getExportFilename = () => {
    switch (type) {
      case "inventory":
        return "inventory_data"
      case "sales":
        return "sales_data"
      case "suppliers":
        return "supplier_data"
      case "all":
        return "complete_export"
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  return (
    <div className="space-y-4">
      {description && <p className="text-white/70 text-sm mb-4">{description}</p>}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            {data.length} Records
          </Badge>
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
            {headers.length} Fields
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-black/40 backdrop-blur-sm border-white/10 hover:border-white/20 text-white hover:bg-white/10"
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>

          <ExportButton data={data} filename={getExportFilename()} headers={headers} label="Export Data" />
        </div>
      </div>

      <div className="rounded-md border border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow>
              {headers.map((header, index) => (
                <TableHead key={index} className="text-white font-medium">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-white/5 border-white/10">
                {Object.values(row).map((cell, cellIndex) => (
                  <TableCell key={cellIndex} className="text-white/80">
                    {cell?.toString()}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center mt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-green-400" />
            <span className="text-white/70 text-sm">CSV</span>
          </div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-blue-400" />
            <span className="text-white/70 text-sm">Excel</span>
          </div>
        </div>
      </div>
    </div>
  )
}
