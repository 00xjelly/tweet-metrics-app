import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

interface AnalysisStore {
  results: AnalysisResult | null
  setResults: (results: AnalysisResult) => void
  clearResults: () => void
}

export const useAnalysisStore = create<AnalysisStore>(
  persist(
    (set) => ({
      results: null,
      setResults: (results) => set({ results }),
      clearResults: () => set({ results: null }),
    }),
    {
      name: 'analysis-store',
    }
  )
)
