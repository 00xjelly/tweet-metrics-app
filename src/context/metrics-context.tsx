"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import type { Tweet } from "@/types/api"

type MetricsContextType = {
  results: Tweet[]
  setResults: (results: Tweet[]) => void
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined)

export function MetricsProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<Tweet[]>([])

  return (
    <MetricsContext.Provider value={{ results, setResults }}>
      {children}
    </MetricsContext.Provider>
  )
}

export function useMetrics() {
  const context = useContext(MetricsContext)
  if (context === undefined) {
    throw new Error('useMetrics must be used within a MetricsProvider')
  }
  return context
}