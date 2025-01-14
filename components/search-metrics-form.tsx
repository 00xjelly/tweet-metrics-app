"use client"

import { useState } from "react"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PostCard } from "./post-card"
import { MetricCard } from "./metric-card"
import { BarChart2, Clock, MessageCircle, Users } from "lucide-react"

interface PostData {
  content: string
  timestamp: string
  metrics: {
    likes: number
    replies: number
    retweets: number
    impressions: number
  }
}

export function SearchMetricsForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [posts, setPosts] = useState<PostData[]>([])
  const [aggregateMetrics, setAggregateMetrics] = useState<{
    totalEngagement: number
    avgEngagement: number
    totalImpressions: number
    responseTime: number
  } | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setError(null)
    
    if (!file) return
    
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }

    setIsLoading(true)

    Papa.parse(file, {
      complete: (results) => {
        try {
          // Transform CSV data to PostData format
          const transformedData: PostData[] = results.data
            .filter((row: any) => row.content && row.timestamp) // Basic validation
            .map((row: any) => ({
              content: row.content,
              timestamp: new Date(row.timestamp).toLocaleDateString(),
              metrics: {
                likes: parseInt(row.likes) || 0,
                replies: parseInt(row.replies) || 0,
                retweets: parseInt(row.retweets) || 0,
                impressions: parseInt(row.impressions) || 0
              }
            }))

          // Calculate aggregate metrics
          const totalPosts = transformedData.length
          const totalEngagement = transformedData.reduce(
            (sum, post) => sum + post.metrics.likes + post.metrics.replies + post.metrics.retweets,
            0
          )
          const totalImpressions = transformedData.reduce(
            (sum, post) => sum + post.metrics.impressions,
            0
          )

          setAggregateMetrics({
            totalEngagement,
            avgEngagement: totalPosts ? Math.round(totalEngagement / totalPosts) : 0,
            totalImpressions,
            responseTime: totalPosts ? Math.round(transformedData.reduce(
              (sum, post) => sum + (post.metrics.replies > 0 ? 1 : 0),
              0
            ) / totalPosts * 100) : 0
          })

          setPosts(transformedData)
          setError(null)
        } catch (err) {
          setError('Error processing CSV data. Please check the file format.')
          console.error(err)
        } finally {
          setIsLoading(false)
        }
      },
      error: (err) => {
        setError('Error reading CSV file: ' + err.message)
        setIsLoading(false)
      }
    })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Label htmlFor="csv-upload">Upload CSV File</Label>
        <Input
          id="csv-upload"
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={isLoading}
        />
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {aggregateMetrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Engagement"
            value={aggregateMetrics.totalEngagement}
            icon={Users}
          />
          <MetricCard
            title="Average Engagement"
            value={aggregateMetrics.avgEngagement}
            icon={BarChart2}
          />
          <MetricCard
            title="Total Impressions"
            value={aggregateMetrics.totalImpressions.toLocaleString()}
            icon={Users}
          />
          <MetricCard
            title="Response Rate"
            value={`${aggregateMetrics.responseTime}%`}
            icon={Clock}
          />
        </div>
      )}

      {posts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Individual Posts</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <PostCard
                key={index}
                content={post.content}
                metrics={post.metrics}
                timestamp={post.timestamp}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}