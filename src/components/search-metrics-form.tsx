"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Search, LinkIcon, User, Loader2, Upload, Calendar } from 'lucide-react'
import { useState, useRef } from "react"
import { useRouter } from 'next/navigation'
import { useMetrics } from "@/context/metrics-context"
import Papa from 'papaparse'
import { format } from 'date-fns'

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { analyzeMetrics } from "@/lib/api"

const postSearchSchema = z.object({
  urls: z.string().min(1, "Please enter at least one URL"),
})

const profileSearchSchema = z.object({
  inputType: z.enum(["text", "file"]),
  profiles: z.string().min(1, "Please enter at least one username"),
  maxItems: z.number().min(1).max(200).optional(),
  includeReplies: z.boolean().default(false),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional()
  }).optional()
})

export function SearchMetricsForm() {
  const router = useRouter()
  const { setResults } = useMetrics()
  const [activeTab, setActiveTab] = useState<"profile" | "post" | "metrics">("post")
  const [isLoading, setIsLoading] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const postForm = useForm<z.infer<typeof postSearchSchema>>({
    resolver: zodResolver(postSearchSchema),
    defaultValues: {
      urls: "",
    },
  })

  const profileForm = useForm<z.infer<typeof profileSearchSchema>>({
    resolver: zodResolver(profileSearchSchema),
    defaultValues: {
      inputType: "text",
      profiles: "",
      maxItems: 100,
      includeReplies: false,
      dateRange: {
        from: undefined,
        to: undefined
      }
    },
  })

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileError(null)
    
    if (file.type !== "text/csv") {
      setFileError("Please upload a CSV file")
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const csvData = Papa.parse(e.target?.result as string, {
          header: true,
          skipEmptyLines: true
        })

        if (csvData.errors.length > 0) {
          setFileError("Invalid CSV format")
          return
        }

        const profiles = csvData.data
          .map((row: any) => row.username || row.profile)
          .filter(Boolean)
          .map(username => username.startsWith('@') ? username.slice(1) : username)
          .join('\n')

        if (!profiles) {
          setFileError("No valid profiles found in CSV")
          return
        }

        profileForm.setValue('inputType', 'text')
        profileForm.setValue('profiles', profiles)
      } catch (error) {
        setFileError("Error processing CSV file")
      }
    }

    reader.readAsText(file)
  }

  async function onPostSubmit(values: z.infer<typeof postSearchSchema>) {
    console.log('Form submitted with values:', values);
    
    setIsLoading(true)
    try {
      const urls = values.urls.split('\n')
        .map(url => url.trim())
        .filter(Boolean)

      console.log('Processing URLs:', urls);

      const response = await analyzeMetrics({
        type: 'post',
        urls
      })
      
      if ('error' in response) {
        setFileError(response.error)
        return
      }
      
      setResults(response.data.posts)
      router.push('/results')
    } catch (error) {
      console.error('Error analyzing posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function onProfileSubmit(values: z.infer<typeof profileSearchSchema>) {
    console.log('Profile form submitted with values:', values);
    
    setIsLoading(true)
    try {
      const username = values.profiles.includes('/') ? 
        values.profiles.split('/').pop() : 
        values.profiles

      const since = values.dateRange?.from ? 
        format(values.dateRange.from, "yyyy-MM-dd_HH:mm:ss_'UTC'") : 
        undefined

      const until = values.dateRange?.to ? 
        format(values.dateRange.to, "yyyy-MM-dd_HH:mm:ss_'UTC'") : 
        undefined

      const response = await analyzeMetrics({
        type: 'profile',
        username,
        maxItems: values.maxItems,
        since,
        until,
        filterReplies: !values.includeReplies
      })
      
      if ('error' in response) {
        setFileError(response.error)
        return
      }

      setResults(response.data.posts)
      router.push('/results')
    } catch (error) {
      console.error('Error analyzing profile:', error)
      setFileError('Error processing request')
    } finally {
      setIsLoading(false)
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

      <TabsContent value="profile" className="mt-4">
        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
            <FormField
              control={profileForm.control}
              name="profiles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter Usernames</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Textarea 
                        {...field} 
                        placeholder="Enter usernames (one per line or comma-separated)&#10;e.g. @username1, @username2&#10;or&#10;@username1&#10;@username2"
                        className="min-h-[100px]"
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          className="max-w-xs"
                          ref={fileInputRef}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                      {fileError && (
                        <p className="text-sm text-red-500">{fileError}</p>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Range</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {field.value?.from ? (
                            field.value.to ? (
                              <>
                                {format(field.value.from, "PP")} - {format(field.value.to, "PP")}
                              </>
                            ) : (
                              format(field.value.from, "PP")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          initialFocus
                          mode="range"
                          defaultMonth={field.value?.from}
                          selected={{
                            from: field.value?.from,
                            to: field.value?.to,
                          }}
                          onSelect={field.onChange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="includeReplies"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Include Replies
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="maxItems"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of tweets to analyze (max 200)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number"
                      min={1}
                      max={200}
                      onChange={e => field.onChange(parseInt(e.target.value))}
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
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Profile...
                </>
              ) : (
                'Analyze Profile'
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