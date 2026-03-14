'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ZukiButton } from '@/components/zuki/ZukiButton'
import { Menu, X } from 'lucide-react'

function ZukiLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" stroke="#F4A7B9" strokeWidth="2" fill="none" />
      <path d="M10 10 L22 10 L10 22 L22 22" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-zuki-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <ZukiLogo />
            <span className="font-display font-bold text-xl text-zuki-charcoal">Zuki</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/bakeries" className="text-zuki-muted hover:text-zuki-charcoal transition-colors text-sm font-medium">
              Browse Bakeries
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/sign-in"><ZukiButton variant="ghost" size="sm">Sign In</ZukiButton></Link>
            <Link href="/sign-up"><ZukiButton size="sm">Get Started</ZukiButton></Link>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-xl text-zuki-charcoal" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-zuki-border px-4 py-4 space-y-2">
          <Link href="/bakeries" onClick={() => setOpen(false)}
            className="block px-4 py-3 rounded-xl text-zuki-charcoal font-medium hover:bg-zuki-cream transition-colors">
            Browse Bakeries
          </Link>
          <Link href="/sign-in" onClick={() => setOpen(false)}
            className="block px-4 py-3 rounded-xl text-zuki-charcoal font-medium hover:bg-zuki-cream transition-colors">
            Sign In
          </Link>
          <Link href="/sign-up" onClick={() => setOpen(false)}
            className="block px-4 py-3 rounded-xl bg-zuki-pink text-white font-medium text-center">
            Get Started
          </Link>
        </div>
      )}
    </nav>
  )
}

export function ClientNav({ userName, userId }: { userName: string; userId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-zuki-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ZukiLogo />
            <span className="font-display font-bold text-xl text-zuki-charcoal">Zuki</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-zuki-muted hover:text-zuki-charcoal transition-colors text-sm font-medium">My Orders</Link>
            <Link href="/dashboard/history" className="text-zuki-muted hover:text-zuki-charcoal transition-colors text-sm font-medium">History</Link>
            <Link href="/bakeries" className="text-zuki-muted hover:text-zuki-charcoal transition-colors text-sm font-medium">Browse Bakeries</Link>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-zuki-muted">{userName}</span>
            <Link href="/dashboard/profile">
              <div className="w-8 h-8 rounded-full bg-zuki-pink flex items-center justify-center text-white text-sm font-bold">
                {userName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </Link>
            <button onClick={handleSignOut} className="text-sm text-zuki-muted hover:text-zuki-error transition-colors">Sign out</button>
          </div>

          {/* Mobile: avatar + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <Link href="/dashboard/profile">
              <div className="w-8 h-8 rounded-full bg-zuki-pink flex items-center justify-center text-white text-sm font-bold">
                {userName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </Link>
            <button className="p-2 rounded-xl text-zuki-charcoal" onClick={() => setOpen(!open)}>
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-zuki-border px-4 py-4 space-y-1">
          <Link href="/dashboard" onClick={() => setOpen(false)}
            className="block px-4 py-3 rounded-xl text-zuki-charcoal font-medium hover:bg-zuki-cream transition-colors">
            My Orders
          </Link>
          <Link href="/dashboard/history" onClick={() => setOpen(false)}
            className="block px-4 py-3 rounded-xl text-zuki-charcoal font-medium hover:bg-zuki-cream transition-colors">
            History
          </Link>
          <Link href="/bakeries" onClick={() => setOpen(false)}
            className="block px-4 py-3 rounded-xl text-zuki-charcoal font-medium hover:bg-zuki-cream transition-colors">
            Browse Bakeries
          </Link>
          <Link href="/dashboard/profile" onClick={() => setOpen(false)}
            className="block px-4 py-3 rounded-xl text-zuki-charcoal font-medium hover:bg-zuki-cream transition-colors">
            My Profile
          </Link>
          <button onClick={() => { setOpen(false); handleSignOut() }}
            className="block w-full text-left px-4 py-3 rounded-xl text-zuki-error font-medium hover:bg-red-50 transition-colors">
            Sign Out
          </button>
        </div>
      )}
    </nav>
  )
}
