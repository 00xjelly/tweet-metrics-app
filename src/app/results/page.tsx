"use client"

import { useMetrics } from "@/context/metrics-context"
import { TweetCard } from "@/components/tweet-card"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { Tweet } from "@/lib/api"

export default function ResultsPage() {
  const { results } = useMetrics()
  const router = useRouter()

  if (!results?.length) {
    router.push('/')
    return null
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Analysis Results</h1>
        <Button
          onClick={() => {
            const csv = [
              ['Text', 'URL', 'Likes', 'Retweets', 'Replies', 'Impressions', 'Created At'].join(','),
              ...results.map(tweet => [
                `"${tweet.text}"`,
                tweet.url,
                tweet.metrics.likes,
                tweet.metrics.retweets,
                tweet.metrics.replies,
                tweet.metrics.impressions,
                tweet.createdAt
              ].join(','))
            ].join('\n')

            const blob = new Blob([csv], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'twitter-metrics.csv'
            a.click()
            window.URL.revokeObjectURL(url)
          }}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4">
        {results.map((tweet: Tweet) => (
          <TweetCard key={tweet.id} tweet={tweet} />
        ))}
      </div>
    </div>
  )
}