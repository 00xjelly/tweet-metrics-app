'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Search, Upload, Loader2, X } from 'lucide-react'
import { useState, useCallback, useMemo } from "react"
import { useRouter } from 'next/navigation'
import { useMetrics } from "@/context/metrics-context"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { processBatch } from "@/lib/batch-processor"
import { SelectListDialog } from "@/components/lists/select-list-dialog"
import Papa from 'papaparse'
import { isTwitterUrl, extractUsername } from "@/utils/url-validation"
import { createProfileFormSchema, ProfileFormType, defaultFormValues, FormFields } from "@/schemas/profile-form"

export function ProfileSearchForm() {
  const router = useRouter()
  const { setResults } = useMetrics()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [csvUrls, setCsvUrls] = useState<string[]>([])
  const [processingStatus, setProcessingStatus] = useState<string>('')

  const profileFormSchema = useMemo(() => createProfileFormSchema(csvUrls), [csvUrls])

  const form = useForm<ProfileFormType>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: defaultFormValues
  })

  const clearCsvUrls = () => {
    setCsvUrls([]);
    setError(null);
  };

  const handleListSelect = (profiles: string[]) => {
    const usernames = profiles
      .map(url => extractUsername(url))
      .filter(username => username.length > 0)
      .join(', ');

    form.setValue('@' as FormFields, usernames);
    clearCsvUrls();
  };

  const handleCsvUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (form.getValues('@')) {
      form.setValue('@', '');
    }

    try {
      const text = await file.text();
      Papa.parse(text, {
        skipEmptyLines: true,
        complete: (results) => {
          const twitterUrls = results.data
            .flat()
            .map(String)
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .filter(isTwitterUrl)

          if (twitterUrls.length === 0) {
            setError('No valid Twitter/X URLs found in the CSV');
            return;
          }
          
          setCsvUrls(twitterUrls);
          setError(null);

          if (event.target) {
            event.target.value = '';
          }
        },
        error: (error) => {
          setError('Error parsing CSV file');
          console.error('CSV parsing error:', error);
          if (event.target) {
            event.target.value = '';
          }
        }
      });
    } catch (error) {
      console.error('Error reading file:', error);
      setError('Error reading CSV file');
      if (event.target) {
        event.target.value = '';
      }
    }
  }, [])

  async function onSubmit(values: ProfileFormType) {
    setIsLoading(true)
    setError(null)
    setProcessingStatus('')
    
    try {
      let authors: string[] = []
      
      // Handle CSV URLs - extract usernames from URLs
      if (csvUrls.length > 0) {
        authors = csvUrls.map(url => extractUsername(url)).filter(username => username.length > 0)
      } 
      // Handle username input
      else if (values['@']) {
        authors = values['@'].split(',').map(s => s.trim()).filter(Boolean)
      }
      
      if (authors.length === 0) {
        setError('Please provide at least one username or upload a CSV file')
        setIsLoading(false)
        return
      }

      const results = await processBatch({
        ids: authors,
        type: 'profiles',
        processingCallback: (current, total) => {
          setProcessingStatus(`Processing batch ${current}/${total}`)
        },
        params: {
          username: values.username,
          maxItems: values.maxItems,
          since: values.dateRange?.since,
          until: values.dateRange?.until,
          includeReplies: values.includeReplies,
          twitterContent: values.twitterContent || undefined
        }
      })

      setResults(results)
      router.push('/results')
    } catch (error) {
      console.error('Error analyzing profiles:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
      setProcessingStatus('')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="@"
          render={({ field }) => (
            <FormItem>
              <FormLabel>X Username(s)</FormLabel>
              <FormControl>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Input 
                      placeholder="e.g. user1, user2" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        if (e.target.value) {
                          clearCsvUrls();
                        }
                      }}
                      disabled={csvUrls.length > 0}
                    />
                    {field.value && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => field.onChange('')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <SelectListDialog onSelect={handleListSelect} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
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
          control={form.control}
          name="csvFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload CSV</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    disabled={Boolean(form.getValues('@'))}
                  />
                  {csvUrls.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearCsvUrls}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {csvUrls.length > 0 && (
          <div className="text-sm text-gray-600">
            Found {csvUrls.length} valid Twitter/X profile URLs
          </div>
        )}

        <FormField
          control={form.control}
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
          control={form.control}
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
            name="dateRange.since"
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
            name="dateRange.until"
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

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || (csvUrls.length === 0 && !form.getValues('@'))}
        >
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
  )
}