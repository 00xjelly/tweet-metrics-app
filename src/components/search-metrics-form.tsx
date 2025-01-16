"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Search, LinkIcon, User, Loader2, Upload } from 'lucide-react'
import { useState } from "react"
import { useRouter } from 'next/navigation'
import { useMetrics } from "@/context/metrics-context"
import Papa from 'papaparse'

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { analyzeMetrics } from "../lib/api"

const postSearchSchema = z.object({
  urls: z.string().min(1, "Please enter at least one URL"),
})

const profileSearchSchema = z.object({
  inputType: z.enum(["text", "file"]),
  profiles: z.string().min(1, "Please enter at least one username"),
  maxItems: z.number().min(1).max(200).optional()
})

export function SearchMetricsForm() {
  const router = useRouter()
  const { setResults } = useMetrics()
  const [activeTab, setActiveTab] = useState<"profile" | "post" | "metrics">("post")
  const [isLoading, setIsLoading] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

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
      maxItems: 100
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

        // Assuming the CSV has a column named 'username' or 'profile'
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
      
      console.log('API Response:', response);

      if (response.success) {
        setResults(response.data.posts)
        router.push('/results')
      }
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
      const profiles = values.profiles
        .split(/[\n,]/)
        .map(username => username.trim())
        .filter(Boolean)
        .map(username => username.startsWith('@') ? username.slice(1) : username)

      const response = await analyzeMetrics({
        type: 'profile',
        username: profiles[0], // Currently handling first profile only - we'll update this
        maxItems: values.maxItems
      })
      
      console.log('API Response:', response);

      if (response.success) {
        setResults(response.data.posts)
        router.push('/results')
      }
    } catch (error) {
      console.error('Error analyzing profile:', error)
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
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => document.querySelector('input[type="file"]')?.click()}
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