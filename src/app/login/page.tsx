'use client'

import LoginButton from '@/components/auth/LoginButton'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sign in to Tweet Metrics
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Track and manage your Twitter metrics
          </p>
        </div>
        <LoginButton />
      </div>
    </div>
  )
}