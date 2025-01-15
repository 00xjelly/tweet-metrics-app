"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Search, LinkIcon, User, Loader2 } from 'lucide-react'
import { useState } from "react"
import { useRouter } from 'next/navigation'

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { MultiLineInput } from "./multi-line-input"
import { analyzeMetrics } from "../lib/api"
import { useAnalysis } from "../context/analysis-context"

const postSearchSchema = z.object({
  urls: z.string().min(1),
})

export function SearchMetricsForm() {
  const router = useRouter()
  const { setResults } = useAnalysis()
  const [isLoading, setIsLoading] = useState(false)

  // Simplify to just the post form for debugging
  const form = useForm<z.infer<typeof postSearchSchema>>({
    resolver: zodResolver(postSearchSchema),
    defaultValues: {
      urls: "",
    },
  })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log('Form submitted');
    
    const formData = new FormData(e.target as HTMLFormElement);
    const urls = formData.get('urls') as string;
    
    if (!urls) {
      console.log('No URLs provided');
      return;
    }

    setIsLoading(true);
    console.log('Processing URLs:', urls);

    try {
      const response = await analyzeMetrics({
        type: 'post',
        urls: [urls]
      });

      console.log('API Response:', response);

      if (response.success && response.data?.posts?.[0]) {
        setResults({
          url: urls,
          metrics: response.data.posts[0].metrics
        });
        router.push('/results');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={onSubmit} className="space-y-6">
        <FormItem>
          <FormLabel>Post URL</FormLabel>
          <FormControl>
            <Input 
              name="urls"
              placeholder="Enter post URL. Example: twitter.com/username/status/123456789"
            />
          </FormControl>
          <FormMessage />
        </FormItem>

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
            'Analyze Post'
          )}
        </Button>
      </form>
    </div>
  )
}
