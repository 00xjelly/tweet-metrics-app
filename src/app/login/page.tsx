'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <div className="space-y-4 mb-8">
          <h1 className="text-2xl font-bold text-center text-gray-900">
            Welcome to Tweet Metrics
          </h1>
          <p className="text-center text-gray-600">
            Sign in to access your dashboard
          </p>
        </div>
        <Auth
          supabaseClient={supabase}
          view="sign_in"
          appearance={{ theme: ThemeSupa }}
          theme="light"
          showLinks={false}
          providers={['google']}
          redirectTo={`${window.location.origin}/auth/callback`}
        />
      </div>
    </div>
  )
}