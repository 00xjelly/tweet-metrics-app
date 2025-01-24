"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Search, Upload, X, Loader2 } from 'lucide-react'
import { useState } from "react"
import { useRouter } from 'next/navigation'
import { useMetrics } from "@/context/metrics-context"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { extractTweetId } from "@/lib/utils"
import { processBatch } from "@/lib/batch-processor"
import Papa from 'papaparse'

const postSearchSchema = z.object({
  urls: z.string().min(1, "Please enter at least one URL"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  includeReplies: z.boolean().default(false)
})

export function PostSearchForm() {
  const router = useRouter()
  const { setResults } = useMetrics()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processingStatus, setProcessingStatus] = useState<string>('')

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

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      Papa.parse(text, {
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

          form.setValue('urls', urlList.join('\n'));
          setError(null);
          
          // Clear the file input
          if (event.target) {
            event.target.value = '';
          }
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          setError('Error parsing CSV file');
          if (event.target) {
            event.target.value = '';
          }
        },
      });
    } catch (error) {
      console.error('Error reading file:', error);
      setError('Error reading CSV file');
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  async function onSubmit(values: z.infer<typeof postSearchSchema>) {
    setIsLoading(true)
    setError(null)
    setProcessingStatus('')
    
    try {
      const urls = values.urls.split('\n')
        .map(url => url.trim())
        .filter(Boolean)
        .filter(isValidPostUrl);

      if (urls.length === 0) {
        throw new Error('No valid post URLs found')
      }

      // Extract tweet IDs
      const tweetIds = urls
        .map(url => extractTweetId(url))
        .filter((id): id is string => id !== null);

      const results = await processBatch({
        ids: tweetIds,
        type: 'tweets',
        processingCallback: (current, total) => {
          setProcessingStatus(`Processing batch ${current}/${total}`);
        },
        params: {
          since: values.startDate || undefined,
          until: values.endDate || undefined,
          includeReplies: values.includeReplies
        }
      });

      setResults(results)
      router.push('/results')
    } catch (error) {
      console.error('Error analyzing posts:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
      setProcessingStatus('')
    }
  }

  const form = useForm<z.infer<typeof postSearchSchema>>({    
    resolver: zodResolver(postSearchSchema),
    defaultValues: {
      urls: "",
      startDate: "",
      endDate: "",
      includeReplies: false
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
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
                        onChange={handleCsvUpload}
                      />
                    </label>
                  </Button>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="includeReplies"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              </FormControl>
              <FormLabel className="font-normal">Include Replies</FormLabel>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
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
            control={form.control}
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {processingStatus && (
          <div className="text-sm text-gray-600">
            {processingStatus}
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
  )
}