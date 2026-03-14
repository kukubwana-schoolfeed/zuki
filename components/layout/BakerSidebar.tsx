'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, Store,
  Calendar, Settings, FileText, LogOut, ChefHat
} from 'lucide-react'

function ZukiLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" stroke="#F4A7B9" strokeWidth="2" fill="none" />
      <path d="M10 10 L22 10 L10 22 L22 22" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

const navItems = [
  { href: '/baker', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/baker/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/baker/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/baker/storefront', label: 'Storefront', icon: Store },
  { href: '/baker/availability', label: 'Availability', icon: Calendar },
  { href: '/baker/settings', label: 'Settings', icon: Settings },
  { href: '/baker/reports', label: 'Reports', icon: FileText },
]

export function BakerSidebar({ bakerName }: { bakerName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-zuki-border fixed left-0 top-0 z-30">
        <div className="p-6 border-b border-zuki-border">
          <Link href="/baker" className="flex items-center gap-2">
            <ZukiLogo />
            <span className="font-display font-bold text-lg text-zuki-charcoal">Zuki</span>
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-zuki-pink flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {bakerName?.charAt(0)?.toUpperCase() || 'B'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-zuki-charcoal truncate">{bakerName}</p>
              <p className="text-xs text-zuki-muted flex items-center gap-1">
                <ChefHat className="w-3 h-3" /> Baker
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/baker' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-zuki-pink text-white'
                    : 'text-zuki-muted hover:bg-zuki-cream hover:text-zuki-charcoal'
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-zuki-border">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zuki-muted hover:bg-red-50 hover:text-zuki-error transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-zuki-border px-2 py-1 safe-area-inset-bottom">
        <div className="flex items-center justify-around">
          {navItems.slice(0, 5).map(item => {
            const isActive = pathname === item.href || (item.href !== '/baker' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs font-medium transition-all',
                  isActive ? 'text-zuki-pink' : 'text-zuki-muted'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
