"use client"

import { MessageCircle, Repeat2, Heart, BarChart2, Quote } from 'lucide-react'

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

export function MetricRow({ id, text, url, author, isReply, isQuote, metrics }: MetricRowProps) {
  return (
    <div className="flex items-center py-2 hover:bg-muted/50 px-2 rounded">
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{author}</span>
          {isReply && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Reply</span>
          )}
          {isQuote && (
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Quote</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">{text}</p>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs text-blue-500 hover:underline"
        >
          View Tweet
        </a>
      </div>
      <div className="flex items-center gap-4 ml-4">
        <div className="flex items-center gap-1">
          <Heart className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{metrics.likes.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{metrics.replies.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Repeat2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{metrics.retweets.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{metrics.impressions.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}