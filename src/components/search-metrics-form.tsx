"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Search, LinkIcon, User, Loader2 } from 'lucide-react'
import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { MultiLineInput } from "./multi-line-input"
import { analyzeMetrics } from "../lib/api"
import { useAnalysis } from "../context/analysis-context"

const profileSearchSchema = z.object({
  urls: z.string().min(1, "Please enter at least one profile URL"),
  keywords: z.string().optional(),
})

const postSearchSchema = z.object({
  urls: z.string().min(1, "Please enter at least one post URL"),
})

const metricSearchSchema = z.object({
  keywords: z.string().min(1, "Please enter search keywords"),
  minEngagementRate: z.number().min(0).max(100),
  minImpressions: z.number().min(0),
})

export function SearchMetricsForm() {
  const router = useRouter()
  const { setResults } = useAnalysis()
  const [activeTab, setActiveTab] = useState<"profile" | "post" | "metrics">("post")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Log mounted status
    console.log('SearchMetricsForm mounted');
    return () => console.log('SearchMetricsForm unmounted');
  }, []);
  
  const profileForm = useForm<z.infer<typeof profileSearchSchema>>({
    resolver: zodResolver(profileSearchSchema),
    defaultValues: {
      urls: "",
      keywords: "",
    },
  })

  const postForm = useForm<z.infer<typeof postSearchSchema>>({
    resolver: zodResolver(postSearchSchema),
    defaultValues: {
      urls: "",
    },
  })

  const metricForm = useForm<z.infer<typeof metricSearchSchema>>({
    resolver: zodResolver(metricSearchSchema),
    defaultValues: {
      keywords: "",
      minEngagementRate: 1,
      minImpressions: 1000,
    },
  })

  async function onProfileSubmit(values: z.infer<typeof profileSearchSchema>) {
    console.log('Profile form submitted with values:', values);
    setIsLoading(true);
    
    try {
      const urls = values.urls.split('\n')
        .map(url => url.trim())
        .filter(Boolean);
      
      console.log('Processing profile URLs:', urls);
      
      const response = await analyzeMetrics({
        type: 'profile',
        urls,
      });
      
      console.log('Profile analysis response:', response);
      
      if (response.success && response.data?.posts?.[0]) {
        const post = response.data.posts[0];
        setResults({
          url: urls[0],
          metrics: post.metrics
        });
        router.push('/results');
      }
    } catch (error) {
      console.error('Error in profile submit:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function onPostSubmit(values: z.infer<typeof postSearchSchema>) {
    console.log('Post form submitted with values:', values);
    setIsLoading(true);
    
    try {
      const urls = values.urls.split('\n')
        .map(url => url.trim())
        .filter(Boolean);

      console.log('Processing post URLs:', urls);

      const response = await analyzeMetrics({
        type: 'post',
        urls
      });
      
      console.log('Post analysis response:', response);

      if (response.success && response.data?.posts?.[0]) {
        const post = response.data.posts[0];
        setResults({
          url: urls[0],
          metrics: post.metrics
        });
        router.push('/results');
      }
    } catch (error) {
      console.error('Error in post submit:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function onMetricSubmit(values: z.infer<typeof metricSearchSchema>) {
    console.log('Metric form submitted with values:', values);
    setIsLoading(true);
    
    try {
      const response = await analyzeMetrics({
        type: 'metrics',
        ...values,
      });
      
      console.log('Metric analysis response:', response);

      if (response.success && response.data?.posts?.[0]) {
        const post = response.data.posts[0];
        setResults({
          url: post.url,
          metrics: post.metrics
        });
        router.push('/results');
      }
    } catch (error) {
      console.error('Error in metric submit:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full max-w-2xl mx-auto">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Profile Search
        </TabsTrigger>
        <TabsTrigger value="post" className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4" />
          Post Search
        </TabsTrigger>
        <TabsTrigger value="metrics" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Metric Search
        </TabsTrigger>
      </TabsList>

      <div className="mt-4">
        <TabsContent value="profile">
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <FormField
                control={profileForm.control}
                name="urls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile URLs</FormLabel>
                    <FormControl>
                      <MultiLineInput 
                        {...field} 
                        description="Enter profile URLs, one per line. Example: twitter.com/username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keywords (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter keywords to filter posts" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Search Profiles'
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="post">
          <Form {...postForm}>
            <form onSubmit={postForm.handleSubmit(onPostSubmit)} className="space-y-6">
              <FormField
                control={postForm.control}
                name="urls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post URLs</FormLabel>
                    <FormControl>
                      <MultiLineInput 
                        {...field} 
                        description="Enter post URLs, one per line. Example: twitter.com/username/status/123456789"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full"
                onClick={() => console.log('Post submit button clicked')}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Posts'
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="metrics">
          <Form {...metricForm}>
            <form onSubmit={metricForm.handleSubmit(onMetricSubmit)} className="space-y-6">
              <FormField
                control={metricForm.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keywords</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter keywords to search posts" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={metricForm.control}
                name="minEngagementRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Engagement Rate (%)</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Slider
                          min={0}
                          max={100}
                          step={0.1}
                          value={[field.value]}
                          onValueChange={([value]) => field.onChange(value)}
                        />
                        <div className="text-sm text-muted-foreground">
                          Current: {field.value}%
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={metricForm.control}
                name="minImpressions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Impressions</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0}
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
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
                    Searching...
                  </>
                ) : (
                  'Search Posts'
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </div>
    </Tabs>
  )
}
