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
import { useAnalysisStore } from "../lib/store"

// ... (keep other schemas)

export function SearchMetricsForm() {
  const router = useRouter()
  const setResults = useAnalysisStore((state) => state.setResults)
  // ... (keep other state)

  async function onPostSubmit(values: z.infer<typeof postSearchSchema>) {
    setIsLoading(true)
    try {
      const response = await analyzeMetrics({
        type: 'post',
        ...values,
        urls: values.urls.split('\n').map(url => url.trim()).filter(Boolean),
        dateRange
      })
      
      // Store results
      if (response.success && response.data?.posts?.[0]) {
        const post = response.data.posts[0]
        setResults({
          url: post.url || values.urls[0],
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

  // ... (keep rest of the component)
}