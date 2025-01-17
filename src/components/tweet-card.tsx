import { Tweet } from '@/lib/api'
import { formatNumber } from '@/lib/utils'

export function TweetCard({ tweet }: { tweet: Tweet }) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-start justify-between mb-1">
        <span className="text-xs text-muted-foreground">
          {new Date(tweet.createdAt).toLocaleDateString()}
        </span>
        <a 
          href={tweet.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline"
        >
          View on X
        </a>
      </div>

      <p className="text-sm mb-4">{tweet.text}</p>

      <div className="grid grid-cols-4 gap-2 text-sm text-muted-foreground">
        <div>❤️ {formatNumber(tweet.metrics.likes)}</div>
        <div>🔄 {formatNumber(tweet.metrics.retweets)}</div>
        <div>💬 {formatNumber(tweet.metrics.replies)}</div>
        <div>👁️ {formatNumber(tweet.metrics.impressions)}</div>
      </div>
    </div>
  )
}