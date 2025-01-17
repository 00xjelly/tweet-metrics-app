import { Tweet } from '@/lib/api'

export function TweetCard({ tweet }: { tweet: Tweet }) {
  return (
    <div className="p-4 space-y-4 rounded-lg border bg-card">
      <div className="flex items-start justify-between mb-1 text-xs text-muted-foreground">
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

      <div>
        <div className="font-medium mb-1">{tweet.author}</div>
        <p className="text-sm text-muted-foreground line-clamp-2">{tweet.text}</p>
      </div>

      <div className="grid grid-cols-4 gap-2 text-muted-foreground">
        <div>❤️ {tweet.metrics.likes}</div>
        <div>🔁 {tweet.metrics.retweets}</div>
        <div>💬 {tweet.metrics.replies}</div>
        <div>👁️ {tweet.metrics.impressions}</div>
      </div>
    </div>
  )
}