import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PostMetricsRow } from "@/components/post-metrics-row"
import { TooltipProvider } from "@/components/ui/tooltip"

// Sample post data
const posts = [
  {
    id: "1",
    content: "Just launched our new feature! Check it out and let me know what you think 🚀",
    metrics: {
      likes: 142000,
      replies: 28000,
      retweets: 36000,
      impressions: 1245300,
      bookmarks: 5600
    },
    timestamp: "2h",
    author: {
      name: "Sarah Johnson",
      handle: "@sarahj",
      avatar: "/placeholder.svg?height=32&width=32"
    },
    postUrl: "https://twitter.com/sarahj/status/1",
    isReply: false,
    isQuote: false
  },
  {
    id: "2",
    content: "Absolutely agree with this! User experience should always come first in software development.",
    metrics: {
      likes: 89000,
      replies: 42000,
      retweets: 15000,
      impressions: 823400,
      bookmarks: 3200
    },
    timestamp: "5h",
    author: {
      name: "Alex Chen",
      handle: "@alexc",
      avatar: "/placeholder.svg?height=32&width=32"
    },
    postUrl: "https://twitter.com/alexc/status/2",
    isReply: true,
    isQuote: false
  },
  {
    id: "3",
    content: "This is exactly why we implemented automated testing in our workflow. Great point! 💡",
    metrics: {
      likes: 234000,
      replies: 18000,
      retweets: 56000,
      impressions: 1567800,
      bookmarks: 8900
    },
    timestamp: "8h",
    author: {
      name: "Mike Wilson",
      handle: "@mikew",
      avatar: "/placeholder.svg?height=32&width=32"
    },
    postUrl: "https://twitter.com/mikew/status/3",
    isReply: false,
    isQuote: true
  },
  {
    id: "4",
    content: "What's your favorite programming language and why? Reply below! 👇",
    metrics: {
      likes: 167000,
      replies: 89000,
      retweets: 23000,
      impressions: 987600,
      bookmarks: 4500
    },
    timestamp: "12h",
    author: {
      name: "Emma Davis",
      handle: "@emmad",
      avatar: "/placeholder.svg?height=32&width=32"
    },
    postUrl: "https://twitter.com/emmad/status/4",
    isReply: false,
    isQuote: false
  }
]

export default function PostMetricsDashboard() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold tracking-tight">Post Performance</h2>
        <p className="text-sm text-muted-foreground">Last 24 hours</p>
      </div>
      
      <TooltipProvider>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">Post</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="w-[50px]">Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <PostMetricsRow
                  key={post.id}
                  content={post.content}
                  metrics={post.metrics}
                  timestamp={post.timestamp}
                  author={post.author}
                  postUrl={post.postUrl}
                  isReply={post.isReply}
                  isQuote={post.isQuote}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </TooltipProvider>
    </div>
  )
}