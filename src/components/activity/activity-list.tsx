import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Repeat2, Eye, Bookmark } from 'lucide-react'
import type { Tweet } from '@/db/schema'

interface ActivityListProps {
  tweets: Tweet[]
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'likes':
      return <Heart className="h-4 w-4 text-rose-500" />
    case 'retweets':
      return <Repeat2 className="h-4 w-4 text-emerald-500" />
    case 'replies':
      return <MessageCircle className="h-4 w-4 text-blue-500" />
    case 'views':
      return <Eye className="h-4 w-4 text-purple-500" />
    case 'bookmarks':
      return <Bookmark className="h-4 w-4 text-yellow-500" />
    default:
      return <Eye className="h-4 w-4 text-purple-500" />
  }
}

const formatTimestamp = (date: Date | string | null): string => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// Determine the most significant metric
const getTopMetric = (metrics: Tweet['metrics']) => {
  if (!metrics) return 'views'
  
  const metricPriority = ['likes', 'retweets', 'replies', 'views', 'bookmarks'] as const
  return metricPriority.find(metric => metrics[metric] && metrics[metric]! > 0) || 'views'
}

export function ActivityList({ tweets }: ActivityListProps) {
  return (
    <div className="space-y-4">
      {tweets.map((tweet) => {
        const topMetric = getTopMetric(tweet.metrics)
        return (
          <div key={tweet.id} className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={`https://unavatar.io/${tweet.authorUsername}`} />
              <AvatarFallback>
                {tweet.authorUsername?.[0]?.toUpperCase() ?? '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                {tweet.authorUsername}
                <span className="text-muted-foreground"> @{tweet.authorUsername}</span>
              </p>
              <div className="flex items-center gap-1">
                {getActivityIcon(topMetric)}
                <span className="text-xs text-muted-foreground">
                  {tweet.metrics?.[topMetric]} {topMetric} · {formatTimestamp(tweet.lastUpdated)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{tweet.content}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}