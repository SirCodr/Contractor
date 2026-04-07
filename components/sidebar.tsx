'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { FileText, Home, Building2, LayoutTemplate, LogOut, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/contracts', label: 'Contratos', icon: FileText },
  { href: '/properties', label: 'Inmuebles', icon: Building2 },
  { href: '/templates', label: 'Plantillas', icon: LayoutTemplate },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="w-60 shrink-0 flex flex-col h-screen sticky top-0 border-r border-border">
      {/* Logo */}
      <div className="h-14 flex items-center gap-3 px-5 border-b border-border">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-semibold tracking-tight text-sm">Arrendo</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="w-3 h-3 opacity-50" />}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name ?? ''}
              width={28}
              height={28}
              className="w-7 h-7 rounded-full ring-1 ring-border shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
              <span className="text-xs font-medium">{session?.user?.name?.[0] ?? '?'}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{session?.user?.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{session?.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
