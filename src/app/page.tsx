import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Dynamically import the form to avoid server-side rendering issues
const SearchMetricsForm = dynamic(
  () => import('@/components/search-metrics-form').then(mod => mod.SearchMetricsForm),
  { ssr: false }
)

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Request Post Metrics</CardTitle>
          <CardDescription>
            Search for Twitter posts and analyze their metrics using different methods. Add multiple entries to batch process your requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchMetricsForm />
        </CardContent>
      </Card>
    </div>
  )
}
