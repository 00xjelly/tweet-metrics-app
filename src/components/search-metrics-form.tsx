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
import Papa from 'papaparse'

const postSearchSchema = z.object({
  urls: z.string().min(1, "Please enter at least one URL"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  includeReplies: z.boolean().default(false)
})

// ... [previous profileFormSchema and types remain the same]

export function SearchMetricsForm() {
  // ... [previous state and helper functions remain the same until the post search tab]

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full max-w-2xl mx-auto">
      {/* ... [previous profile tab content remains the same] */}

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
