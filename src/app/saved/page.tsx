'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'

type ProfileList = {
  id: string
  name: string
  profiles: string[]
  created_at: string
  last_analyzed: string
}

export default function SavedPage() {
  const [lists, setLists] = useState<ProfileList[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchLists = async () => {
      const { data } = await supabase
        .from('profile_lists')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) setLists(data)
    }

    fetchLists()
  }, [supabase])

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Profile Lists</CardTitle>
            <CardDescription>Create and manage your Twitter profile lists</CardDescription>
          </div>
          <Button variant="outline">
            <PlusCircle className="h-4 w-4 mr-2" />
            New List
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profiles</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Analyzed</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lists.map((list) => (
                  <tr key={list.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {list.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {list.profiles.length} profiles
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(list.last_analyzed).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {lists.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      No profile lists yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}