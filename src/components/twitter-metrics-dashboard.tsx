import { Users, MessageCircle, ArrowUpRight, Share2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricCard } from "@/components/metric-card"

export function TwitterMetricsDashboard() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          type="dashboard"
          title="Total Followers"
          value="10,483"
          description="+180 from last month"
          icon={Users}
        />
        <MetricCard
          type="dashboard"
          title="Engagements"
          value="8,624"
          description="+7% from last month"
          icon={MessageCircle}
        />
        <MetricCard
          type="dashboard"
          title="Impressions"
          value="145.2K"
          description="+4.75% from last month"
          icon={ArrowUpRight}
        />
        <MetricCard
          type="dashboard"
          title="Retweets"
          value="1,234"
          description="+12% from last month"
          icon={Share2}
        />
      </div>
    </div>
  )
}
