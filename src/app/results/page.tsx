"use client"

import { useMetrics } from "@/context/metrics-context"
import { MetricRow } from "@/components/metric-row"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default function ResultsPage() {
  const { results } = useMetrics()

  const handleDownload = () => {
    // Existing download functionality
  }

  if (!results || results.length === 0) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>No results available</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Results</h1>
        <Button onClick={handleDownload} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download CSV
        </Button>
      </div>
      
      <div className="space-y-1 bg-white rounded-lg shadow overflow-hidden">
        {results.map((result: any) => (
          <MetricRow
            key={result.id}
            id={result.id}
            text={result.text}
            url={result.url}
            author={result.author}
            isReply={result.isReply}
            isQuote={result.isQuote}
            metrics={{
              likes: result.metrics.likes,
              replies: result.metrics.replies,
              retweets: result.metrics.retweets,
              impressions: result.metrics.impressions
            }}
          />
        ))}
      </div>
    </div>
  )
}
