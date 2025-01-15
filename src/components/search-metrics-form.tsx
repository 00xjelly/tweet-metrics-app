"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Search, LinkIcon, User, Loader2 } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { analyzeMetrics } from "../lib/api"
import { useAnalysis } from "../context/analysis-context"

export function SearchMetricsForm() {
  const router = useRouter()
  const { setResults } = useAnalysis()
  const [isLoading, setIsLoading] = useState(false)
  const [url, setUrl] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log('Form submitted with URL:', url);
    
    if (!url) {
      console.log('No URL provided');
      return;
    }

    setIsLoading(true);
    try {
      const response = await analyzeMetrics({
        type: 'post',
        urls: [url]
      });

      console.log('API Response:', response);

      if (response.success && response.data?.posts?.[0]) {
        setResults({
          url: url,
          metrics: response.data.posts[0].metrics
        });
        router.push('/results');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={onSubmit} className="space-y-6">
        <FormItem>
          <FormLabel>Post URL</FormLabel>
          <FormControl>
            <Input 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter post URL. Example: twitter.com/username/status/123456789"
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <Button 
          type="submit" 
          disabled={isLoading || !url}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Post'
          )}
        </Button>
      </form>
    </div>
  )
}
