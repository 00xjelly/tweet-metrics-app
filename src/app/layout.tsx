import { GeistSans } from 'geist/font/sans';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body>
        <main className="min-h-screen items-center justify-center p-24">
          {children}
        </main>
      </body>
    </html>
  )
}