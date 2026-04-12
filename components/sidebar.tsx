'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { FileText, Home, Building2, LayoutTemplate, LogOut, ChevronRight, Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
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
  const [open, setOpen] = useState(false)

  const SidebarContent = (
    <>
      <div className="h-14 flex items-center gap-3 px-5 border-b border-border bg-card">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-semibold tracking-tight text-sm">Contractor</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 bg-card">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="w-3 h-3 opacity-50" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-border bg-card">
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
            onClick={() => signOut({ callbackUrl: '/' })}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* MOBILE HEADER */}
      <header className="md:hidden sticky top-0 z-50 flex items-center justify-between h-14 px-4 bg-background border-b border-border">
        <div className="flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="-ml-2">
                  <Menu className="w-5 h-5 text-foreground" />
                </Button>
              }
            />
            <SheetContent side="left" className="w-64 p-0 flex flex-col hide-close-button bg-card">
              {SidebarContent}
            </SheetContent>
          </Sheet>
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">Contractor</span>
        </div>
        
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
      </header>

      {/* DESKTOP SIDEBAR */}
      <aside className="w-60 shrink-0 hidden md:flex flex-col h-screen sticky top-0 border-r border-border bg-card">
        {SidebarContent}
      </aside>
    </>
  )
}
