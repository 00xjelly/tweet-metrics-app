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

// ... (keep existing schema definitions)

export function SearchMetricsForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"profile" | "post" | "metrics">("profile")
  const [dateRange, setDateRange] = useState<DateRange>()
  const [isLoading, setIsLoading] = useState(false)
  
  // ... (keep existing form setup code)

  async function onProfileSubmit(values: z.infer<typeof profileSearchSchema>) {
    setIsLoading(true)
    try {
      const response = await analyzeMetrics({
        type: 'profile',
        ...values,
        urls: values.urls.split('\n').map(url => url.trim()).filter(Boolean),
        dateRange
      })
      
      // Navigate to results page
      router.push('/results')
    } catch (error) {
      console.error('Error analyzing profiles:', error)
      // TODO: Add error toast notification
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
      
      // Navigate to results page
      router.push('/results')
    } catch (error) {
      console.error('Error analyzing posts:', error)
      // TODO: Add error toast notification
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
      
      // Navigate to results page
      router.push('/results')
    } catch (error) {
      console.error('Error searching metrics:', error)
      // TODO: Add error toast notification
    } finally {
      setIsLoading(false)
    }
  }

  // ... (keep existing JSX/render code)
}