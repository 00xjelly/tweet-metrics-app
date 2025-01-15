"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Search, LinkIcon, User, Loader2 } from 'lucide-react'
import { useState } from "react"
import { DateRange } from "react-day-picker"
import { useRouter } from 'next/navigation'

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { MultiLineInput } from "./multi-line-input"
import { analyzeMetrics } from "../lib/api"
import { useAnalysis } from "../context/analysis-context"

const postSearchSchema = z.object({
  urls: z.string().min(1),
})

export function SearchMetricsForm() {
  const router = useRouter()
  const { setResults } = useAnalysis()
  const [activeTab] = useState<"profile" | "post" | "metrics">("post")
  const [isLoading, setIsLoading] = useState(false)

  const postForm = useForm<z.infer<typeof postSearchSchema>>({
    resolver: zodResolver(postSearchSchema),
    defaultValues: {
      urls: "",
    },
  })

  async function onPostSubmit(values: z.infer<typeof postSearchSchema>) {
    setIsLoading(true)
    try {
      const urls = values.urls.split('\n')
        .map(url => url.trim())
        .filter(Boolean)

      const response = await analyzeMetrics({
        type: 'post',
        urls
      })
      
      if (response.success && response.data?.posts?.[0]) {
        const post = response.data.posts[0]
        setResults({
          url: urls[0],
          metrics: post.metrics
        })
        router.push('/results')
      }
    } catch (error) {
      console.error('Error analyzing posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...postForm}>
      <form onSubmit={postForm.handleSubmit(onPostSubmit)} className="space-y-6">
        <FormField
          control={postForm.control}
          name="urls"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Post URL</FormLabel>
              <FormControl>
                <MultiLineInput 
                  {...field} 
                  description="Enter post URL. Example: https://twitter.com/username/status/123456789"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
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
    </Form>
  )
}
