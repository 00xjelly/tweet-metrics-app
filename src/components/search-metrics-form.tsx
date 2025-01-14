"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Search, LinkIcon, User, Loader2 } from 'lucide-react'
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { MultiLineInput } from "./multi-line-input"

const profileSearchSchema = z.object({
  urls: z.string().min(1, "Please enter at least one URL"),
  keywords: z.string().optional(),
})

export function SearchMetricsForm() {
  const [activeTab, setActiveTab] = useState<"profile" | "post" | "metrics">("profile")
  const [isLoading, setIsLoading] = useState(false)

  const profileForm = useForm<z.infer<typeof profileSearchSchema>>({  
    resolver: zodResolver(profileSearchSchema),
    defaultValues: {
      urls: "",
      keywords: "",
    },
  })

  async function onProfileSubmit(values: z.infer<typeof profileSearchSchema>) {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const urls = values.urls.split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0)
      console.log({
        ...values,
        urls
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full max-w-2xl mx-auto">
      <TabsList className="w-[400px]">
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

      <TabsContent value="profile">
        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
            <FormField
              control={profileForm.control}
              name="urls"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile URLs</FormLabel>
                  <FormControl>
                    <MultiLineInput 
                      {...field} 
                      description="Enter one profile URL per line. Example:\ntwitter.com/username1\ntwitter.com/username2"
                      placeholder="twitter.com/username1\ntwitter.com/username2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={profileForm.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter keywords to filter posts" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                'Search Profiles'
              )}
            </Button>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="post">
        {/* Post Search form will go here */}
      </TabsContent>

      <TabsContent value="metrics">
        {/* Metrics Search form will go here */}
      </TabsContent>
    </Tabs>
  )
}