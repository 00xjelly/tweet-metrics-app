"use client"

import { MetricCard } from "@/components/metric-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart2, Heart, MessageCircle, Repeat2 } from 'lucide-react'
import { useAnalysisStore } from "@/lib/store"

export default function ResultsPage() {
  const results = useAnalysisStore((state) => state.results)

  if (!results) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">No analysis results available</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Likes"
              value={results.metrics.likes.toLocaleString()}
              icon={Heart}
            />
            <MetricCard
              title="Replies"
              value={results.metrics.replies.toLocaleString()}
              icon={MessageCircle}
            />
            <MetricCard
              title="Retweets"
              value={results.metrics.retweets.toLocaleString()}
              icon={Repeat2}
            />
            <MetricCard
              title="Impressions"
              value={results.metrics.impressions.toLocaleString()}
              icon={BarChart2}
            />
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            <p>Post URL: <a href={results.url} target="_blank" rel="noopener noreferrer" className="underline">{results.url}</a></p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
