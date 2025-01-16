import { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { MetricsProvider } from "@/context/metrics-context"

export const metadata: Metadata = {
  title: "Tweet Metrics App",
  description: "Analyze metrics for tweets and profiles",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head />
      <body>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  )
}
