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

  const handleExport = () => {
    // Clean and format text by replacing newlines and quotes
    const cleanText = (text: string) => text.replace(/[\r\n]+/g, ' ').replace(/"/g, '""')

    const csvContent = [
      ['Text', 'URL', 'Likes', 'Retweets', 'Replies', 'Impressions', 'Created At', 'Author', 'Is Reply', 'Is Quote'].join(','),
      ...results.map(tweet => [
        `"${cleanText(tweet.text)}"`,
        tweet.url,
        tweet.metrics.likes,
        tweet.metrics.retweets,
        tweet.metrics.replies,
        tweet.metrics.impressions,
        tweet.createdAt,
        tweet.author,
        tweet.isReply,
        tweet.isQuote
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'twitter-metrics.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Analysis Results</h1>
        <Button
          onClick={handleExport}
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