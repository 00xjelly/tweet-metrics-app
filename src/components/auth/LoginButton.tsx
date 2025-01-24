import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase/client'

export default function LoginButton() {
  return (
    <div className="max-w-md mx-auto p-4">
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['google']}
        redirectTo="http://localhost:3000/auth/callback"
      />
    </div>
  )
}
