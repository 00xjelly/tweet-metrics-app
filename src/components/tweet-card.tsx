import { Tweet } from '@/lib/api'
import { formatNumber } from '@/lib/utils'

export function TweetCard({ tweet }: { tweet: Tweet }) {
  return (
    <div className="p-4 space-y-2 rounded-lg border bg-card">
      <div className="space-y-1">
        <div className="flex justify-between items-start gap-4 text-xs text-muted-foreground">
          <span>{new Date(tweet.createdAt).toLocaleDateString()}</span>
          <a 
            href={tweet.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View on X
          </a>
        </div>
        <p className="text-sm">{tweet.text}</p>
      </div>

      <div className="grid grid-cols-4 gap-2 text-sm text-muted-foreground">
        <div>♥️ {formatNumber(tweet.metrics.likes)}</div>
        <div>🔄 {formatNumber(tweet.metrics.retweets)}</div>
        <div>💬 {formatNumber(tweet.metrics.replies)}</div>
        <div>👁️ {formatNumber(tweet.metrics.impressions)}</div>
      </div>
    </div>
  )
}