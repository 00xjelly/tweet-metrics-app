import { PostMetricsDashboard } from "@/components/post-metrics-dashboard"
import { TwitterMetricsDashboard } from "@/components/twitter-metrics-dashboard"

export default function ResultsPage() {
  return (
    <div className="container mx-auto py-8">
      <TwitterMetricsDashboard />
      <div className="mt-8">
        <PostMetricsDashboard />
      </div>
    </div>
  )
}
