"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Search, LinkIcon, User, Loader2, Upload } from 'lucide-react'
import { useState } from "react"
import { useRouter } from 'next/navigation'
import { useMetrics } from "@/context/metrics-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { analyzeMetrics } from "@/lib/api"
import Papa from 'papaparse'

const postSearchSchema = z.object({
  urls: z.string().min(1, "Please enter at least one URL"),
})

const oneYearAgo = new Date()
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

const profileFormSchema = z.object({
  username: z.string().optional(),
  twitterContent: z.string().optional(),
  "@": z.string().optional(),
  csvFile: z.any().optional(),
  maxItems: z.number().max(200).optional(),
  includeReplies: z.boolean().default(false),
  dateRange: z.object({
    since: z.string().optional(),
    until: z.string().optional()
  }).optional()
}).refine((data) => {
  return data.username || data.csvFile
}, {
  message: "Please provide either usernames or a CSV file"
})

type ProfileFormType = z.infer<typeof profileFormSchema>

export function SearchMetricsForm() {
  const router = useRouter()
  const { setResults } = useMetrics()
  const [activeTab, setActiveTab] = useState<"profile" | "post">("profile")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [csvUrls, setCsvUrls] = useState<string[]>([])

  const profileForm = useForm<ProfileFormType>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      twitterContent: "",
      "@": "",
      maxItems: 50,
      includeReplies: false,
      dateRange: {
        since: undefined,
        until: undefined
      }
    },
  })

  const postForm = useForm<z.infer<typeof postSearchSchema>>({
    resolver: zodResolver(postSearchSchema),
    defaultValues: {
      urls: "",
    },
  })

  const isTwitterUrl = (url: string) => {
    return /(^|\s|https?:\/\/)?(x\.com|twitter\.com)\/[\w-]+/.test(url)
  }

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()
    Papa.parse(text, {
      complete: (results) => {
        const twitterUrls = results.data
          .flat()
          .map(String)
          .map(s => s.trim())
          .filter(s => s.length > 0)
          .filter(isTwitterUrl)

        if (twitterUrls.length === 0) {
          setError('No valid Twitter/X URLs found in the CSV')
          return
        }

        setCsvUrls(twitterUrls)
      },
      error: (error) => {
        setError('Error parsing CSV file')
        console.error('CSV parsing error:', error)
      }
    })
  }

  async function onProfileSubmit(values: ProfileFormType) {
    setIsLoading(true)
    setError(null)
    
    try {
      const usernames = [...(values.username?.split(',').map(s => s.trim()).filter(Boolean) || []), ...csvUrls]
      
      if (usernames.length === 0) {
        setError('Please provide at least one username')
        return
      }

      const responses = await Promise.all(usernames.map(username => 
        analyzeMetrics({
          type: 'profile',
          username,
          maxItems: values.maxItems,
          since: values.dateRange?.since,
          until: values.dateRange?.until,
          includeReplies: values.includeReplies,
          twitterContent: values.twitterContent || undefined,
          "@": values["@"] || undefined
        })
      ))
      
      const errors = responses.filter(r => !r.success)
      if (errors.length > 0) {
        setError(`Error processing ${errors.length} profiles`)
        return
      }

      const allPosts = responses.flatMap(r => r.data.posts)
      setResults(allPosts)
      router.push('/results')
    } catch (error) {
      console.error('Error analyzing profiles:', error)
      setError('Error processing request')
    } finally {
      setIsLoading(false)
    }
  }

  async function onPostSubmit(values: z.infer<typeof postSearchSchema>) {
    setIsLoading(true)
    setError(null)
    
    try {
      const urls = values.urls.split('\n')
        .map(url => url.trim())
        .filter(Boolean)

      const response = await analyzeMetrics({
        type: 'post',
        urls
      })
      
      if (!response.success) {
        setError(response.error)
        return
      }
      
      setResults(response.data.posts)
      router.push('/results')
    } catch (error) {
      console.error('Error analyzing posts:', error)
      setError('Error processing request')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full max-w-2xl mx-auto">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Profile Search
        </TabsTrigger>
        <TabsTrigger value="post" className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4" />
          Post Search
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-4">
        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
            <FormField
              control={profileForm.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>X Username</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="multiple profiles, separated by ," />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="twitterContent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Filter by Keyword</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="keyword or phrase to filter by" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="@"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Filter by Mentioned Username</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="username without @" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="csvFile"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>CSV Upload</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={(e) => {
                          onChange(e)
                          handleCsvUpload(e)
                        }}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={profileForm.control}
                name="dateRange.since"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        min={oneYearAgo.toISOString().split('T')[0]}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="dateRange.until"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        min={oneYearAgo.toISOString().split('T')[0]}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={profileForm.control}
              name="maxItems"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of tweets to analyze per profile (max 200)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number"
                      max={200}
                      onChange={e => field.onChange(parseInt(e.target.value) || undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="includeReplies"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  </FormControl>
                  <FormLabel className="text-sm cursor-pointer">
                    Include Replies
                  </FormLabel>
                </FormItem>
              )}
            />

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Profiles...
                </>
              ) : (
                'Analyze Profiles'
              )}
            </Button>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="post" className="mt-4">
        <Form {...postForm}>
          <form onSubmit={postForm.handleSubmit(onPostSubmit)} className="space-y-6">
            <FormField
              control={postForm.control}
              name="urls"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post URLs</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="twitter.com/username/status/123456789"
                      type="text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full"
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
    </Tabs>
  )
}
