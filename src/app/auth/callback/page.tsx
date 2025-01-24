import { Card } from '@/components/ui/card'

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center">
          <div className="animate-pulse text-lg">Completing sign in...</div>
        </div>
      </Card>
    </div>
  )
}
