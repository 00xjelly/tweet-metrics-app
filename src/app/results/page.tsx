import { MetricCard } from "@/components/metric-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart2, Heart, MessageCircle, Repeat2 } from 'lucide-react'

// This will be replaced with real data from API
const mockPostData = {
  url: "https://x.com/francescoweb3/status/1879496404089102599",
  metrics: {
    likes: 1243,
    replies: 89,
    retweets: 156,
    impressions: 12453
  }
}

export default function ResultsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Likes"
              value={mockPostData.metrics.likes}
              icon={Heart}
            />
            <MetricCard
              title="Replies"
              value={mockPostData.metrics.replies}
              icon={MessageCircle}
            />
            <MetricCard
              title="Retweets"
              value={mockPostData.metrics.retweets}
              icon={Repeat2}
            />
            <MetricCard
              title="Impressions"
              value={mockPostData.metrics.impressions}
              icon={BarChart2}
            />
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            <p>Post URL: <a href={mockPostData.url} target="_blank" rel="noopener noreferrer" className="underline">{mockPostData.url}</a></p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
