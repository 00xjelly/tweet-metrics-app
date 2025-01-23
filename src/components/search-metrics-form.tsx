"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Search, LinkIcon, User, Loader2, Upload, X } from 'lucide-react'
import { useState, useCallback, useMemo } from "react"
import { useRouter } from 'next/navigation'
import { useMetrics } from "@/context/metrics-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { analyzeMetrics } from "@/lib/api"
import { extractTweetId } from "@/lib/utils"
import Papa from 'papaparse'

const postSearchSchema = z.object({
  urls: z.string().min(1, "Please enter at least one URL"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

const profileFormSchema = z.object({
  "@": z.string().optional(),
  twitterContent: z.string().optional(),
  username: z.string().optional(),
  csvFile: z.any().optional(),
  maxItems: z.number().max(200).optional(),
  includeReplies: z.boolean().default(false),
  dateRange: z.object({
    since: z.string().optional(),
    until: z.string().optional()
  }).optional()
}).refine((data) => {
  return data['@'] || data.csvFile
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

  const isTwitterUrl = useCallback((url: string) => {
    try {
      const cleanUrl = url.trim().replace(/^https?:\/\//, '');
      return (
        (cleanUrl.startsWith('twitter.com/') || cleanUrl.startsWith('x.com/')) &&
        !cleanUrl.includes('/status/') &&
        cleanUrl.split('/').length === 2
      );
    } catch {
      return false;
    }
  }, [])

  const isValidPostUrl = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url.trim());
      return (
        (parsedUrl.hostname === 'twitter.com' || 
         parsedUrl.hostname === 'x.com') &&
        parsedUrl.pathname.split('/').length >= 4 &&
        parsedUrl.pathname.includes('/status/')
      );
    } catch {
      return false;
    }
  };

  const handleProfileCsvUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handlePostCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      skipEmptyLines: true,
      complete: (results) => {
        const urlList = results.data
          .flat()
          .filter(Boolean)
          .map(String)
          .map(url => url.trim())
          .filter(url => url.length > 0)
          .filter(isValidPostUrl);

        if (urlList.length === 0) {
          setError('No valid post URLs found in the CSV');
          return;
        }

        postForm.setValue('urls', urlList.join('\n'));
        setError(null);
        
        if (event.target) {
          event.target.value = '';
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setError('Error parsing CSV file');
      },
    });
  };
  async function onProfileSubmit(values: ProfileFormType) {
    setIsLoading(true)
    setError(null)
    
    try {
      const authors = [...(values['@']?.split(',').map(s => s.trim()).filter(Boolean) || []), ...csvUrls]
      
      if (authors.length === 0) {
        setError('Please provide at least one username')
        return
      }

      const response = await analyzeMetrics({
        '@': authors,
        username: values.username,
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
        .filter(isValidPostUrl);

      if (urls.length === 0) {
        throw new Error('No valid post URLs found')
      }

      // Extract tweet IDs from URLs
      const tweetIds = urls
        .map(url => extractTweetId(url))
        .filter((id): id is string => id !== null);

      const response = await analyzeMetrics({
        tweet_ids: tweetIds,
        since: values.startDate || undefined,
        until: values.endDate || undefined
      });

      if (!response.success) {
        throw new Error(response.error)
      }

      setResults(response.data.posts)
      router.push('/results')
    } catch (error) {
      console.error('Error analyzing posts:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

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
      startDate: "",
      endDate: ""
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

      {/* Profile tab content remains exactly the same */}

      <TabsContent value="post" className="mt-4">
        <Form {...postForm}>
          <form onSubmit={postForm.handleSubmit(onPostSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={postForm.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={postForm.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={postForm.control}
              name="urls"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post URLs</FormLabel>
                  <div className="space-y-2">
                    <div className="relative">
                      <FormControl>
                        <textarea 
                          className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Enter URLs (one per line)" 
                          {...field} 
                        />
                      </FormControl>
                      {field.value && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            field.onChange("");
                            setError(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <label className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload CSV
                          <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handlePostCsvUpload}
                          />
                        </label>
                      </Button>
                    </div>
                  </div>
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
