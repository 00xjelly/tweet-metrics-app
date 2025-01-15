"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface MetricsState {
  results: any[] | null
  setResults: (results: any[] | null) => void
}

const MetricsContext = createContext<MetricsState | undefined>(undefined)

export function MetricsProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<any[] | null>(null)

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
