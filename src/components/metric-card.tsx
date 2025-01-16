"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type MetricCardProps = {
  url: string
  author: string
  text: string
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
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg font-bold">{author}</CardTitle>
        <CardDescription>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            View Tweet
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">{text}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Likes</p>
            <p className="text-xl font-bold">{metrics.likes.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Replies</p>
            <p className="text-xl font-bold">{metrics.replies.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Retweets</p>
            <p className="text-xl font-bold">{metrics.retweets.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Impressions</p>
            <p className="text-xl font-bold">{metrics.impressions.toLocaleString()}</p>
          </div>
          {metrics.bookmarks > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Bookmarks</p>
              <p className="text-xl font-bold">{metrics.bookmarks.toLocaleString()}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
