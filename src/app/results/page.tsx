"use client"

import { MetricCard } from "@/components/metric-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart2, Heart, MessageCircle, Repeat2 } from 'lucide-react'
import { useAnalysis } from "@/context/analysis-context"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function ResultsPage() {
  const { results } = useAnalysis()
  const router = useRouter()

  if (!results) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">No analysis results available</p>
              <Button onClick={() => router.push('/')} variant="outline">
                Back to Search
              </Button>
            </div>
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

          <div className="mt-6 flex justify-end">
            <Button onClick={() => router.push('/')} variant="outline">
              Back to Search
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
