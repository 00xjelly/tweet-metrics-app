import { Tweet } from '@/lib/api'
import { MessageCircle, Heart, Eye, Repeat2, Quote, Reply } from 'lucide-react'

export function TweetCard({ tweet }: { tweet: Tweet }) {
  return (
    <div className="p-3 rounded-lg border bg-card max-w-4xl">
      <div className="flex items-baseline justify-between mb-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium">@{tweet.author}</span>
          <span className="text-muted-foreground">
            {new Date(tweet.createdAt).toLocaleDateString()}
          </span>
          {(tweet.isReply || tweet.isQuote) && (
            <span className="flex gap-1.5 text-muted-foreground ml-1">
              {tweet.isReply && (
                <span className="flex items-center gap-0.5">
                  <Reply className="w-3 h-3" />
                  Reply
                </span>
              )}
              {tweet.isQuote && (
                <span className="flex items-center gap-0.5">
                  <Quote className="w-3 h-3" />
                  Quote
                </span>
              )}
            </span>
          )}
        </div>
        <a 
          href={tweet.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline"
        >
          View on X
        </a>
      </div>

      <div className="flex items-center justify-between gap-8">
        <p className="text-sm text-muted-foreground truncate">{tweet.text}</p>

        <div className="flex items-center gap-6 text-muted-foreground text-sm whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <Heart className="w-4 h-4" /> {tweet.metrics.likes}
          </div>
          <div className="flex items-center gap-1.5">
            <Repeat2 className="w-4 h-4" /> {tweet.metrics.retweets}
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4" /> {tweet.metrics.replies}
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" /> {tweet.metrics.impressions}
          </div>
        </div>
      </div>
    </div>
  )
}