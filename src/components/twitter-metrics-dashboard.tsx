import { ArrowUpRight, BarChart3, Users, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { MetricCard } from "./metric-card"
import { ActivityList } from "./activity-list"
import { EngagementChart } from "./engagement-chart"

export function TwitterMetricsDashboard() {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold tracking-tight mb-8">Twitter Analytics</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Followers"
          value="10,483"
          description="+180 from last month"
          icon={Users}
        />
        <MetricCard
          title="Engagement Rate"
          value="4.3%"
          description="+0.3% from last month"
          icon={BarChart3}
        />
        <MetricCard
          title="Total Impressions"
          value="45.2K"
          description="+20% from last month"
          icon={ArrowUpRight}
        />
        <MetricCard
          title="Average Replies"
          value="32"
          description="Per tweet this month"
          icon={MessageCircle}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Engagement Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <EngagementChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityList />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
