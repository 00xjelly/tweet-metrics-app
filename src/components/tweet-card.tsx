import { Tweet } from '@/lib/api'
import { formatNumber } from '@/lib/utils'

export function TweetCard({ tweet }: { tweet: Tweet }) {
  return (
    <div className="p-4 space-y-2 rounded-lg border bg-card">
      <div className="flex justify-between items-start gap-2">
        <p className="text-sm flex-grow">{tweet.text}</p>
        <div className="flex flex-col items-end gap-1">
          <a 
            href={tweet.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline whitespace-nowrap"
          >
            View on X
          </a>
          <span className="text-xs text-muted-foreground">
            {new Date(tweet.createdAt).toLocaleDateString()}
          </span>
        </div>
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