"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Search, LinkIcon, User, Loader2, Upload } from 'lucide-react'
import { useState, useCallback, useMemo, useRef, useEffect } from "react"
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
  "@": z.string().optional(),            // Author field (X Username)
  twitterContent: z.string().optional(),
  username: z.string().optional(),       // Mentioned user field
  csvFile: z.any().optional(),
  maxItems: z.number().max(200).optional(),
  includeReplies: z.boolean().default(false),
  dateRange: z.object({
    since: z.string().optional(),
    until: z.string().optional()
  }).optional()
}).refine((data) => {
  return data['@'] || data.csvFile       // Changed to check @ field instead of username
}, {
  message: "Please provide either usernames or a CSV file"
})

type ProfileFormType = z.infer<typeof profileFormSchema>

export function SearchMetricsForm() {
  const renderRef = useRef(0)
  renderRef.current++

  // Use effect to log renders with stable logging
  useEffect(() => {
    console.log(`SearchMetricsForm Render #${renderRef.current}`)
  })

  const router = useRouter()
  const { setResults } = useMetrics()
  
  // Memoize state to reduce unnecessary re-renders
  const [activeTab, setActiveTab] = useState<"profile" | "post">("profile")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [csvUrls, setCsvUrls] = useState<string[]>([])

  // Memoize expensive functions
  const isTwitterUrl = useCallback((url: string) => {
    return /(^|\s|https?:\/\/)?(x\.com|twitter\.com)\/[\w-]+/.test(url)
  }, [])

  const handleCsvUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [isTwitterUrl])

  // Async submit functions
  async function onProfileSubmit(values: ProfileFormType) {
    setIsLoading(true)
    setError(null)
    
    try {
      // Now using @ field for authors instead of username
      const authors = [...(values['@']?.split(',').map(s => s.trim()).filter(Boolean) || []), ...csvUrls]
      
      if (authors.length === 0) {
        setError('Please provide at least one username')
        return
      }

      const response = await analyzeMetrics({
        '@': authors,                     // Send authors to @ parameter
        username: values.username,         // Send mentioned user to username parameter
        maxItems: values.maxItems,
        since: values.dateRange?.since,
        until: values.dateRange?.until,
        includeReplies: values.includeReplies,
        twitterContent: values.twitterContent || undefined
      })
      
      if (!response.success) {
        setError(response.error)
        return
      }

      setResults(response.data.posts)
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

  // Memoize form schemas
  const profileForm = useForm<ProfileFormType>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: useMemo(() => ({
      "@": "",
      twitterContent: "",
      username: "",
      maxItems: 50,
      includeReplies: false,
      dateRange: {
        since: undefined,
        until: undefined
      }
    }), [])
  })

  const postForm = useForm<z.infer<typeof postSearchSchema>>({
    resolver: zodResolver(postSearchSchema),
    defaultValues: useMemo(() => ({
      urls: "",
    }), [])
  })

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
              name="@"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>X Username(s)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. user1, user2" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mentioned User Filter</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Filter by mentioned user" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="maxItems"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Items</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={200} 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value))} 
                    />
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
                  <FormLabel>Content Filter</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Filter by keywords or content" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze Profiles
                </>
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
                    <textarea 
                      className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter URLs (one per line)" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze Posts
                </>
              )}
            </Button>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  )
}