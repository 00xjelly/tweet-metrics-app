"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface PostMetrics {
  likes: number
  replies: number
  retweets: number
  impressions: number
}

interface AnalysisResult {
  url: string
  metrics: PostMetrics
}

interface AnalysisContextType {
  results: AnalysisResult | null
  setResults: (results: AnalysisResult) => void
  clearResults: () => void
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined)

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<AnalysisResult | null>(null)

  const clearResults = () => setResults(null)

  return (
    <AnalysisContext.Provider
      value={{
        results,
        setResults,
        clearResults,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  )
}

export function useAnalysis() {
  const context = useContext(AnalysisContext)
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider')
  }
  return context
}
