import { Tweet } from '@/lib/api'
import { MessageCircle, Heart, Eye, Repeat2 } from 'lucide-react'

export function TweetCard({ tweet }: { tweet: Tweet }) {
  return (
    <div className="p-4 rounded-lg border bg-card max-w-3xl">
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground">
          {new Date(tweet.createdAt).toLocaleDateString()}
        </span>
        <a 
          href={tweet.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          View on X
        </a>
      </div>

      <div className="flex items-center justify-between gap-8 mt-2">
        <div className="overflow-hidden">
          <div className="font-medium mb-0.5">{tweet.author}</div>
          <p className="text-sm text-muted-foreground truncate">{tweet.text}</p>
        </div>

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