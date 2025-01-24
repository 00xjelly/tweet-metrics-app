'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Check for the auth code in the URL
    const handleAuthCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession()
        if (error) throw error
        // Redirect to the dashboard or home page after successful sign in
        router.push('/')
      } catch (error) {
        console.error('Error during auth callback:', error)
        router.push('/error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">Completing sign in...</div>
    </div>
  )
}
