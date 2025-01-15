import { Metadata } from "next"
import { Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricCard } from "@/components/metric-card"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Example dashboard with twitter metrics.",
}

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          type="dashboard"
          title="Total Followers"
          value="10,483"
          description="+180 from last month"
          icon={Users}
        />
      </div>
    </div>
  )
}
