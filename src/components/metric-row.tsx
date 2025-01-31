"use client"

import { MessageCircle, Repeat2, Heart, BarChart2, ArrowUpRight } from 'lucide-react'

type MetricRowProps = {
  id: string
  text: string
  url: string
  author: string
  isReply: boolean
  isQuote: boolean
  metrics: {
    likes: number
    replies: number
    retweets: number
    impressions: number
  }
}

const formatNumber = (num: number): string => {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M'
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function MetricRow({ id, text, url, author, isReply, isQuote, metrics }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between py-2 px-4 hover:bg-muted/50">
      <div className="flex-1 min-w-0 space-y-1 mr-4">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{author}</span>
          <div className="flex gap-1">
            {isReply && (
              <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                Reply
              </span>
            )}
            {isQuote && (
              <span className="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                Quote
              </span>
            )}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground truncate max-w-[500px]">{text}</p>
        
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs text-blue-500 hover:underline flex items-center gap-1"
        >
          View on X
          <ArrowUpRight className="h-3 w-3" />
        </a>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1" title={`${metrics.likes.toLocaleString()} likes`}>
          <Heart className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm tabular-nums">{formatNumber(metrics.likes)}</span>
        </div>
        
        <div className="flex items-center gap-1" title={`${metrics.replies.toLocaleString()} replies`}>
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm tabular-nums">{formatNumber(metrics.replies)}</span>
        </div>
        
        <div className="flex items-center gap-1" title={`${metrics.retweets.toLocaleString()} retweets`}>
          <Repeat2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm tabular-nums">{formatNumber(metrics.retweets)}</span>
        </div>
        
        <div className="flex items-center gap-1" title={`${metrics.impressions.toLocaleString()} views`}>
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm tabular-nums">{formatNumber(metrics.impressions)}</span>
        </div>
      </div>
    </div>
  )
}