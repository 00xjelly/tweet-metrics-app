'use client'

import { SearchMetricsForm } from "@/components/search-metrics-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'

export default function Home() {
  const [user, setUser] = useState(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }
    checkUser()
  }, [supabase])

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Request Post Metrics</CardTitle>
          <CardDescription>
            {user ? (
              <>
                Welcome {user.email}! 
                <button 
                  onClick={() => supabase.auth.signOut()}
                  className="ml-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Sign Out
                </button>
              </>
            ) : (
              'Please log in to analyze Twitter posts'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchMetricsForm />
        </CardContent>
      </Card>
    </div>
  )
}