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
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <MetricsProvider>
            {children}
          </MetricsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
