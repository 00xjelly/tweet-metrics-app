'use client'

import { Home, BookmarkPlus } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function NavBar() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/saved', label: 'Saved Items', icon: BookmarkPlus },
  ]

  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-14 items-center">
        <div className="flex gap-6 text-sm">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 transition-colors hover:text-foreground/80',
                  pathname === link.href ? 'text-foreground' : 'text-foreground/60'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}