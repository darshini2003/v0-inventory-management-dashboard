import { saveAs } from "file-saver"
import * as XLSX from "xlsx"

// Function to convert data to CSV format
export function convertToCSV(data: any[], headers?: string[]) {
  if (!data || data.length === 0) return ""

  // Use provided headers or extract from first data item
  const columnHeaders = headers || Object.keys(data[0])

  // Create header row
  let csvContent = columnHeaders.join(",") + "\n"

  // Add data rows
  data.forEach((item) => {
    const row = columnHeaders
      .map((header) => {
        // Handle special characters and ensure proper CSV formatting
        const cell = item[header] !== undefined && item[header] !== null ? item[header].toString() : ""
        // Escape quotes and wrap in quotes if contains comma, newline or quote
        if (cell.includes(",") || cell.includes("\n") || cell.includes('"')) {
          return `"${cell.replace(/"/g, '""')}"`
        }
        return cell
      })
      .join(",")
    csvContent += row + "\n"
  })

  return csvContent
}

// Function to export data as CSV
export function exportAsCSV(data: any[], filename: string, headers?: string[]) {
  const csvContent = convertToCSV(data, headers)
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  saveAs(blob, `${filename}.csv`)
}

// Function to export data as Excel
export function exportAsExcel(data: any[], filename: string, headers?: string[]) {
  // Create a worksheet
  const worksheet = XLSX.utils.json_to_sheet(data)

  // If headers are provided, replace the headers in the worksheet
  if (headers) {
    const headerRow: any = {}
    headers.forEach((header, index) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: index })
      worksheet[cellRef] = { t: "s", v: header }
      headerRow[XLSX.utils.encode_col(index)] = header
    })
  }

  // Create a workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data")

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

// Function to format date for filenames
export function formatDateForFilename() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")

  return `${year}${month}${day}_${hours}${minutes}`
}

// Function to prepare data for export (flattening nested objects)
export function prepareDataForExport(data: any[]) {
  return data.map((item) => {
    const flatItem: any = {}

    // Recursive function to flatten nested objects
    const flatten = (obj: any, prefix = "") => {
      for (const key in obj) {
        if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
          flatten(obj[key], `${prefix}${key}_`)
        } else if (Array.isArray(obj[key])) {
          // For arrays, join the values with a separator
          flatItem[`${prefix}${key}`] = obj[key].join("; ")
        } else {
          flatItem[`${prefix}${key}`] = obj[key]
        }
      }
    }

    flatten(item)
    return flatItem
  })
}
