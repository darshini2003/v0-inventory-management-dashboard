"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { exportAsCSV, exportAsExcel, formatDateForFilename, prepareDataForExport } from "@/lib/export-utils"
import { useToast } from "@/hooks/use-toast"

interface ExportButtonProps {
  data: any[]
  filename: string
  headers?: string[]
  label?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
}

export function ExportButton({ data, filename, headers, label = "Export", variant = "outline" }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()
  const formattedDate = formatDateForFilename()
  const fullFilename = `${filename}_${formattedDate}`

  const handleExport = async (format: "csv" | "excel") => {
    try {
      setIsExporting(true)

      // Prepare data for export
      const preparedData = prepareDataForExport(data)

      // Export based on format
      if (format === "csv") {
        exportAsCSV(preparedData, fullFilename, headers)
        toast({
          title: "Export successful",
          description: `Data exported as CSV: ${fullFilename}.csv`,
        })
      } else {
        exportAsExcel(preparedData, fullFilename, headers)
        toast({
          title: "Export successful",
          description: `Data exported as Excel: ${fullFilename}.xlsx`,
        })
      }
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          disabled={isExporting || !data || data.length === 0}
          className="bg-black/40 backdrop-blur-sm border-white/10 hover:border-white/20 text-white hover:bg-white/10"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              {label}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-black/90 backdrop-blur-sm border-white/10 text-white">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          onClick={() => handleExport("csv")}
          className="flex items-center cursor-pointer hover:bg-white/10"
        >
          <FileText className="mr-2 h-4 w-4 text-green-400" />
          <span>Export as CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("excel")}
          className="flex items-center cursor-pointer hover:bg-white/10"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4 text-blue-400" />
          <span>Export as Excel</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
