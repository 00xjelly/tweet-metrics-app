"use client"

import { useMetrics } from "@/context/metrics-context"
import { MetricRow } from "@/components/metric-row"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { Tweet } from "@/lib/api"

export default function ResultsPage() {
  const { results } = useMetrics()

  const handleDownload = () => {
    if (!results.length) return

    const csvContent = [
      // CSV headers
      ['URL', 'Author', 'Text', 'Is Reply', 'Is Quote', 'Likes', 'Replies', 'Retweets', 'Impressions'].join(','),
      // CSV rows
      ...results.map((tweet: Tweet) => [
        tweet.url,
        tweet.author,
        `"${tweet.text.replace(/"/g, '""')}"`, // Escape quotes for CSV
        tweet.isReply,
        tweet.isQuote,
        tweet.metrics.likes,
        tweet.metrics.replies,
        tweet.metrics.retweets,
        tweet.metrics.impressions
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'twitter_metrics.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
      
      <div className="space-y-1 bg-white rounded-lg shadow overflow-hidden divide-y">
        {results.map((tweet: Tweet, index: number) => (
          <MetricRow
            key={tweet.id || index}
            id={tweet.id}
            text={tweet.text}
            url={tweet.url}
            author={tweet.author}
            isReply={tweet.isReply}
            isQuote={tweet.isQuote}
            metrics={{
              likes: tweet.metrics.likes,
              replies: tweet.metrics.replies,
              retweets: tweet.metrics.retweets,
              impressions: tweet.metrics.impressions
            }}
          />
        ))}
      </div>
    </div>
  )
}