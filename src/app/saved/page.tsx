'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { PlusCircle, RefreshCw, Trash2 } from 'lucide-react'

type SavedSearch = {
  id: string
  query: string
  last_run: string
  status: 'processing' | 'complete'
  created_at: string
}

type ProfileList = {
  id: string
  name: string
  profiles: any[]
  created_at: string
  last_analyzed: string
}

export default function SavedPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [lists, setLists] = useState<ProfileList[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: searchesData } = await supabase
        .from('saved_searches')
        .select('*')
        .order('created_at', { ascending: false })

      const { data: listsData } = await supabase
        .from('profile_lists')
        .select('*')
        .order('created_at', { ascending: false })

      if (searchesData) setSearches(searchesData)
      if (listsData) setLists(listsData)
    }

    fetchData()
  }, [supabase])

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Saved Items</h1>
      </div>

      {/* Saved Searches Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Saved Searches</CardTitle>
            <CardDescription>Your saved Twitter metrics searches</CardDescription>
          </div>
          <Button variant="secondary">
            <PlusCircle className="w-4 h-4 mr-2" />
            New Search
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Query</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Run</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searches.map((search) => (
                  <tr key={search.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{search.query}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(search.last_run).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${search.status === 'complete' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {search.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Button variant="ghost" size="sm" className="mr-2">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Profile Lists Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Profile Lists</CardTitle>
            <CardDescription>Your saved Twitter profile lists</CardDescription>
          </div>
          <Button variant="secondary">
            <PlusCircle className="w-4 h-4 mr-2" />
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lists.map((list) => (
                  <tr key={list.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{list.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{list.profiles.length}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(list.last_analyzed).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Button variant="ghost" size="sm" className="mr-2">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}