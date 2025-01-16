"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { MetricsProvider } from "@/context/metrics-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <MetricsProvider>
        {children}
      </MetricsProvider>
    </ThemeProvider>
  )
}
