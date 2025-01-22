"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Search, LinkIcon, User, Loader2, Upload } from 'lucide-react'
import { useState, useCallback, useMemo } from "react"
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

// Memoize form default values
const defaultProfileValues = {
  "@": "",
  twitterContent: "",
  username: "",
  maxItems: 50,
  includeReplies: false,
  dateRange: {
    since: undefined,
    until: undefined
  }
}

const defaultPostValues = {
  urls: "",
}

export function SearchMetricsForm() {
  const router = useRouter()
  const { setResults } = useMetrics()
  
  // Use useState with initial state function to avoid recreating default state
  const [activeTab, setActiveTab] = useState(() => "profile")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [csvUrls, setCsvUrls] = useState<string[]>(() => [])

  // Memoize the URL validation function
  const isTwitterUrl = useCallback((url: string) => {
    return /(^|\s|https?:\/\/)?(x\.com|twitter\.com)\/[\w-]+/.test(url)
  }, [])

  // Memoize CSV handling function
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

  // Memoize submit handlers
  const onProfileSubmit = useCallback(async (values: ProfileFormType) => {
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
  }, [csvUrls, router, setResults])

  const onPostSubmit = useCallback(async (values: z.infer<typeof postSearchSchema>) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const urls = values.urls.split('\n')
        .map(url => url.trim())
        .filter(Boolean)

      const response = await analyzeMetrics({ urls })
      
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
  }, [router, setResults])

  // Memoize form configurations
  const profileForm = useForm<ProfileFormType>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: defaultProfileValues
  })

  const postForm = useForm<z.infer<typeof postSearchSchema>>({
    resolver: zodResolver(postSearchSchema),
    defaultValues: defaultPostValues
  })

  // Rest of the component remains the same...
  return (
    <Tabs 
      value={activeTab} 
      onValueChange={setActiveTab} 
      className="w-full max-w-2xl mx-auto"
    >
      {/* ... rest of JSX */}
    </Tabs>
  )
}