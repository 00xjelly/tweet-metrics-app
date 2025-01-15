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
import { Slider } from "@/components/ui/slider"
import { DateRangePicker } from "./date-range-picker"
import { BatchSaveDialog } from "./batch-save-dialog"
import { BatchLoadDialog } from "./batch-load-dialog"
import { MultiLineInput } from "./multi-line-input"
import { useSavedBatches } from "../lib/hooks/use-saved-batches"
import { analyzeMetrics } from "../lib/api"

const profileSearchSchema = z.object({
  urls: z.string().min(1),
  keywords: z.string().optional(),
})

const postSearchSchema = z.object({
  urls: z.string().min(1),
})

const metricSearchSchema = z.object({
  keywords: z.string(),
  minEngagementRate: z.number().min(0).max(100),
  minImpressions: z.number().min(0),
})

export function SearchMetricsForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"profile" | "post" | "metrics">("profile")
  const [dateRange, setDateRange] = useState<DateRange>()
  const [isLoading, setIsLoading] = useState(false)
  
  const { savedBatches: savedProfileBatches, saveBatch: saveProfileBatch } = useSavedBatches("profile")
  const { savedBatches: savedPostBatches, saveBatch: savePostBatch } = useSavedBatches("post")
  const { savedBatches: savedMetricBatches, saveBatch: saveMetricBatch } = useSavedBatches("metrics")

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

  const handleSaveProfileBatch = (name: string) => {
    saveProfileBatch(name, {
      ...profileForm.getValues(),
      dateRange
    })
  }

  const handleLoadProfileBatch = (batch: any) => {
    profileForm.reset(batch.data)
    if (batch.data.dateRange) {
      setDateRange(batch.data.dateRange)
    }
  }

  const handleSavePostBatch = (name: string) => {
    savePostBatch(name, {
      ...postForm.getValues(),
      dateRange
    })
  }

  const handleLoadPostBatch = (batch: any) => {
    postForm.reset(batch.data)
    if (batch.data.dateRange) {
      setDateRange(batch.data.dateRange)
    }
  }

  const handleSaveMetricBatch = (name: string) => {
    saveMetricBatch(name, {
      ...metricForm.getValues(),
      dateRange
    })
  }

  const handleLoadMetricBatch = (batch: any) => {
    metricForm.reset(batch.data)
    if (batch.data.dateRange) {
      setDateRange(batch.data.dateRange)
    }
  }

  async function onProfileSubmit(values: z.infer<typeof profileSearchSchema>) {
    setIsLoading(true)
    try {
      const response = await analyzeMetrics({
        type: 'profile',
        ...values,
        urls: values.urls.split('\n').map(url => url.trim()).filter(Boolean),
        dateRange
      })
      
      router.push('/results')
    } catch (error) {
      console.error('Error analyzing profiles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function onPostSubmit(values: z.infer<typeof postSearchSchema>) {
    setIsLoading(true)
    try {
      const response = await analyzeMetrics({
        type: 'post',
        ...values,
        urls: values.urls.split('\n').map(url => url.trim()).filter(Boolean),
        dateRange
      })
      
      router.push('/results')
    } catch (error) {
      console.error('Error analyzing posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function onMetricSubmit(values: z.infer<typeof metricSearchSchema>) {
    setIsLoading(true)
    try {
      const response = await analyzeMetrics({
        type: 'metrics',
        ...values,
        dateRange
      })
      
      router.push('/results')
    } catch (error) {
      console.error('Error searching metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col gap-4 mb-4">
        <TabsList className="w-[400px]">
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

        <div className="flex flex-wrap items-center gap-2">
          {(activeTab === "profile" || activeTab === "post") && (
            <>
              <BatchSaveDialog 
                onSave={activeTab === "profile" ? handleSaveProfileBatch : handleSavePostBatch} 
                type={activeTab}
              />
              <BatchLoadDialog
                savedBatches={activeTab === "profile" ? savedProfileBatches : savedPostBatches}
                onLoad={activeTab === "profile" ? handleLoadProfileBatch : handleLoadPostBatch}
                type={activeTab}
              />
            </>
          )}
          {activeTab === "metrics" && (
            <>
              <BatchSaveDialog onSave={handleSaveMetricBatch} type="metrics" />
              <BatchLoadDialog
                savedBatches={savedMetricBatches}
                onLoad={handleLoadMetricBatch}
                type="metrics"
              />
            </>
          )}
        </div>

        <DateRangePicker
          date={dateRange}
          onChange={setDateRange}
        />
      </div>

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
                      description="Enter profile URLs separated by commas. Example: twitter.com/username1, twitter.com/username2"
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
            <Button type="submit" disabled={isLoading}>
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
                      description="Enter post URLs separated by commas. Example: twitter.com/username/status/123456789, twitter.com/username/status/987654321"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
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
            <Button type="submit" disabled={isLoading}>
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
    </Tabs>
  )
}
