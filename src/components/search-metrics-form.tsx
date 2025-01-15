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
import { MultiLineInput } from "./multi-line-input"
import { analyzeMetrics } from "../lib/api"

const postSearchSchema = z.object({
  urls: z.string().min(1, "Please enter at least one URL"),
})

export function SearchMetricsForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"profile" | "post" | "metrics">("post")
  const [isLoading, setIsLoading] = useState(false)

  const postForm = useForm<z.infer<typeof postSearchSchema>>({
    resolver: zodResolver(postSearchSchema),
    defaultValues: {
      urls: "",
    },
  })

  async function onPostSubmit(values: z.infer<typeof postSearchSchema>) {
    console.log('Form submitted with values:', values); // Debug log
    
    setIsLoading(true)
    try {
      const urls = values.urls.split('\n')
        .map(url => url.trim())
        .filter(Boolean)

      console.log('Processing URLs:', urls); // Debug log

      const response = await analyzeMetrics({
        type: 'post',
        urls
      })
      
      console.log('API Response:', response); // Debug log

      if (response.success) {
        router.push('/results')
      }
    } catch (error) {
      console.error('Error analyzing posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    console.log('Button clicked'); // Debug log
    const formData = postForm.getValues();
    console.log('Current form data:', formData); // Debug log
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

      <TabsContent value="post" className="mt-4">
        <Form {...postForm}>
          <form 
            onSubmit={(e) => {
              console.log('Form submit event triggered'); // Debug log
              e.preventDefault();
              postForm.handleSubmit(onPostSubmit)(e);
            }} 
            className="space-y-6"
          >
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
              onClick={handleButtonClick}
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
