import { Tweet } from '@/lib/api'

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

      <div className="space-y-4">
        <p className="text-sm">{tweet.text}</p>

        <div className="grid grid-cols-4 gap-2 text-sm text-muted-foreground">
          <div>❤️ {tweet.metrics.likes}</div>
          <div>🔄 {tweet.metrics.retweets}</div>
          <div>💬 {tweet.metrics.replies}</div>
          <div>👁️ {tweet.metrics.impressions}</div>
        </div>
      </div>
    </div>
  )
}