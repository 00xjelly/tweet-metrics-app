"use client"

import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MetricCard } from '@/components/metric-card'
import { useMetrics } from '@/context/metrics-context'

export default function ResultsPage() {
  const { results } = useMetrics()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analysis Results</h1>
        <Link href="/">
          <Button variant="outline">Back to Search</Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading results...</div>}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results && results.length > 0 ? (
            results.map((post, index) => (
              <MetricCard
                key={index}
                url={post.url}
                author={post.author}
                text={post.text}
                metrics={{
                  likes: post.metrics.likes,
                  replies: post.metrics.replies,
                  retweets: post.metrics.retweets,
                  impressions: post.metrics.impressions,
                  bookmarks: post.metrics.bookmarks
                }}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-lg text-muted-foreground">
                No results found. Try searching again.
              </p>
            </div>
          )}
        </div>
      </Suspense>
    </div>
  )
}
