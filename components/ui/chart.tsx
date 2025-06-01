import type React from "react"
export const Chart = () => {
  return <div>Chart</div>
}

export const ChartArea = () => {
  return <div>ChartArea</div>
}

export const ChartAxisOptions = () => {
  return <div>ChartAxisOptions</div>
}

export const ChartContainer = ({ children, data }: { children: React.ReactNode; data: any[] }) => {
  return <div>{children}</div>
}

export const ChartLegend = () => {
  return <div>ChartLegend</div>
}

export const ChartTooltip = () => {
  return <div>ChartTooltip</div>
}

export const ChartTooltipContent = ({ items }: { items: any[] }) => {
  return <div>ChartTooltipContent</div>
}
