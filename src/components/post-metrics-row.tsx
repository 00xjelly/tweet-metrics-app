import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TableCell, TableRow } from "@/components/ui/table"
import { Heart, MessageCircle, Repeat2, BarChart2, Link2, Quote } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface PostMetricsRowProps {
  content: string
  metrics: {
    likes: number
    replies: number
    retweets: number
    impressions: number
    bookmarks: number
  }
  timestamp: string
  author: {
    name: string
    handle: string
    avatar: string
  }
  postUrl: string
  isReply: boolean
  isQuote: boolean
}

export function PostMetricsRow({
  content,
  metrics,
  timestamp,
  author,
  postUrl,
  isReply,
  isQuote,
}: PostMetricsRowProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const engagement = metrics.likes + metrics.replies + metrics.retweets
  const engagementRate = ((engagement / metrics.impressions) * 100).toFixed(1)

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{author.name}</span>
              <span className="text-sm text-muted-foreground">{author.handle}</span>
              {isReply && (
                <MessageCircle className="h-3 w-3 text-muted-foreground" />
              )}
              {isQuote && (
                <Quote className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{content}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-rose-500" />
              <span className="text-sm">{formatNumber(metrics.likes)}</span>
            </TooltipTrigger>
            <TooltipContent>Likes</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4 text-blue-500" />
              <span className="text-sm">{formatNumber(metrics.replies)}</span>
            </TooltipTrigger>
            <TooltipContent>Replies</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1">
              <Repeat2 className="h-4 w-4 text-emerald-500" />
              <span className="text-sm">{formatNumber(metrics.retweets)}</span>
            </TooltipTrigger>
            <TooltipContent>Retweets</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1">
              <BarChart2 className="h-4 w-4 text-purple-500" />
              <span className="text-sm">{engagementRate}%</span>
            </TooltipTrigger>
            <TooltipContent>Engagement Rate</TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">{timestamp}</span>
      </TableCell>
      <TableCell>
        <a 
          href={postUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600"
        >
          <Link2 className="h-4 w-4" />
        </a>
      </TableCell>
    </TableRow>
  )
}