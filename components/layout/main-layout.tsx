import type { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="stocksync-theme">
      <div className="min-h-screen bg-background">
        {children}
        <Toaster />
      </div>
    </ThemeProvider>
  )
}
