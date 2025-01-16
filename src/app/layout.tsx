import { Metadata } from "next"
import { Providers } from "./providers"
import "@/styles/globals.css"

export const metadata: Metadata = {
  title: "Tweet Metrics App",
  description: "Analyze metrics for tweets and profiles",
}

export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="min-h-screen bg-background">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
