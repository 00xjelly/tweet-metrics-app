"use client"

import { User, Link } from 'lucide-react'
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileSearchForm } from "@/components/profile-search-form"
import { PostSearchForm } from "@/components/post-search-form"

export function SearchMetricsForm() {
  const [activeTab, setActiveTab] = useState<"profile" | "post">("profile")

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full max-w-2xl mx-auto">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Profile Search
        </TabsTrigger>
        <TabsTrigger value="post" className="flex items-center gap-2">
          <Link className="h-4 w-4" />
          Post Search
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-4">
        <ProfileSearchForm />
      </TabsContent>

      <TabsContent value="post" className="mt-4">
        <PostSearchForm />
      </TabsContent>
    </Tabs>
  )
}