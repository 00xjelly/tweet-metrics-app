import { Tweet } from '@/lib/api'
import { MessageCircle, Heart, Eye, Repeat2 } from 'lucide-react'

export function TweetCard({ tweet }: { tweet: Tweet }) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex justify-between items-center text-xs mb-2">
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

      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="font-medium">{tweet.author}</div>
          <p className="text-sm text-muted-foreground truncate">{tweet.text}</p>
        </div>

        <div className="flex gap-4 text-muted-foreground text-sm shrink-0">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" /> {tweet.metrics.likes}
          </div>
          <div className="flex items-center gap-1">
            <Repeat2 className="w-4 h-4" /> {tweet.metrics.retweets}
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" /> {tweet.metrics.replies}
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" /> {tweet.metrics.impressions}
          </div>
        </div>
      </div>
    </div>
  )
}