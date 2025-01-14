import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Heart, MessageCircle, Repeat2, BarChart2 } from 'lucide-react'

interface PostMetrics {
  likes: number
  replies: number
  retweets: number
  impressions: number
}

interface PostCardProps {
  content: string
  metrics: PostMetrics
  timestamp: string
}

export function PostCard({ content, metrics, timestamp }: PostCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <p className="text-sm text-muted-foreground">{timestamp}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{content}</p>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-500" />
            <span className="text-sm font-medium">{metrics.likes}</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">{metrics.replies}</span>
          </div>
          <div className="flex items-center gap-2">
            <Repeat2 className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium">{metrics.retweets}</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">{metrics.impressions}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}