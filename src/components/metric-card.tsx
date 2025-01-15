"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

type BaseMetricCardProps = {
  className?: string
}

type TweetMetricCardProps = BaseMetricCardProps & {
  type: 'tweet'
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

type DashboardMetricCardProps = BaseMetricCardProps & {
  type: 'dashboard'
  title: string
  value: string
  description: string
  icon: LucideIcon
}

type MetricCardProps = TweetMetricCardProps | DashboardMetricCardProps

export function MetricCard(props: MetricCardProps) {
  if (props.type === 'tweet') {
    const { url, author, text, metrics } = props
    return (
      <Card className={props.className}>
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

  // Dashboard metric card
  const { title, value, description, icon: Icon } = props
  return (
    <Card className={props.className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
