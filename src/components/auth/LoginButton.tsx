'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function LoginButton() {
  const supabase = createClientComponentClient()

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
  }

  return (
    <button
      onClick={handleSignIn}
      className="w-full flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
    >
      <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
        <path
          d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.41002L20.0303 3C17.9502 1.14002 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69001 1.28027 6.60001L5.27028 9.70001C6.21525 6.89001 8.87028 4.75 12.0003 4.75Z"
          fill="#EA4335"
        />
        <path
          d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.12 18.1L19.93 21.1C22.195 19 23.49 15.92 23.49 12.275Z"
          fill="#4285F4"
        />
        <path
          d="M5.26499 14.2899C5.02499 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26998 9.70993L1.27997 6.60992C0.45497 8.22992 0 10.0599 0 11.9999C0 13.9399 0.45497 15.7699 1.28497 17.3899L5.26499 14.2899Z"
          fill="#FBBC05"
        />
        <path
          d="M12.0004 24C15.2354 24 17.9504 22.935 19.9354 21.095L16.1254 18.095C15.0904 18.815 13.7004 19.25 12.0004 19.25C8.87042 19.25 6.22039 17.11 5.27039 14.29L1.28039 17.39C3.25539 21.3 7.31039 24 12.0004 24Z"
          fill="#34A853"
        />
      </svg>
      <span>Continue with Google</span>
    </button>
  )
}