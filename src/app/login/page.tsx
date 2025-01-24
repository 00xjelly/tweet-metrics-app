'use client'

import { Card } from '@/components/ui/card'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase/client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Handle hash-based auth response
    const handleHashBasedResponse = async () => {
      const hash = window.location.hash
      if (hash && hash.includes('access_token')) {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (session && !error) {
          router.push('/')
        }
      }
    }

    handleHashBasedResponse()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="space-y-2 text-center mb-4">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access your tweet metrics
          </p>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google']}
          onlyThirdPartyProviders
        />
      </Card>
    </div>
  )
}