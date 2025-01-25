'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { NewListDialog } from '@/components/lists/new-list-dialog'

type ProfileList = {
  id: string
  name: string
  profiles: string[]
  created_at: string
  last_analyzed: string
}

export default function SavedPage() {
  const [lists, setLists] = useState<ProfileList[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  const fetchLists = async () => {
    const { data } = await supabase
      .from('profile_lists')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setLists(data)
  }

  useEffect(() => {
    fetchLists()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true)
      const { error } = await supabase
        .from('profile_lists')
        .delete()
        .match({ id })

      if (error) throw error

      setLists(lists.filter(list => list.id !== id))
    } catch (error) {
      console.error('Error deleting list:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Profile Lists</CardTitle>
            <CardDescription>Create and manage your Twitter profile lists</CardDescription>
          </div>
          <NewListDialog onListCreated={fetchLists} />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profiles</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Analyzed</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(list.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {lists.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
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