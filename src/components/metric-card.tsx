"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface MetricCardProps {
  url: string
  author?: string
  text?: string
  metrics: {
    likes: number
    replies: number
    retweets: number
    impressions: number
    bookmarks: number
  }
}

export function MetricCard({ url, author, text, metrics }: MetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="truncate">{author || 'Tweet Analysis'}</CardTitle>
        <CardDescription className="truncate">
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            {url}
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {text && (
          <p className="mb-4 text-sm text-muted-foreground">
            {text}
          </p>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Likes</p>
            <p className="text-2xl font-bold">{metrics.likes.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Replies</p>
            <p className="text-2xl font-bold">{metrics.replies.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Retweets</p>
            <p className="text-2xl font-bold">{metrics.retweets.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Impressions</p>
            <p className="text-2xl font-bold">{metrics.impressions.toLocaleString()}</p>
          </div>
          {metrics.bookmarks > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Bookmarks</p>
              <p className="text-2xl font-bold">{metrics.bookmarks.toLocaleString()}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
