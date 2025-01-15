'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, LinkIcon, User, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { analyzeMetrics } from '../lib/api'
import { useAnalysis } from '../context/analysis-context'

export function SearchMetricsForm() {
  const router = useRouter()
  const { setResults } = useAnalysis()
  const [isLoading, setIsLoading] = useState(false)
  const [url, setUrl] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url) return

    setIsLoading(true)
    console.log('Submitting URL:', url)

    try {
      const response = await analyzeMetrics({
        type: 'post',
        urls: [url]
      })

      console.log('API Response:', response)

      if (response.success && response.data?.posts?.[0]) {
        setResults({
          url: url,
          metrics: response.data.posts[0].metrics
        })
        router.push('/results')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">Post URL</Label>
          <Input
            id="url"
            placeholder="Enter tweet URL (e.g., twitter.com/username/status/123456789)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !url}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Tweet'
          )}
        </Button>
      </form>
    </div>
  )
}
