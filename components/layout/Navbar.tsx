'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ZukiButton } from '@/components/zuki/ZukiButton'

function ZukiLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" stroke="#F4A7B9" strokeWidth="2" fill="none" />
      <path d="M10 10 L22 10 L10 22 L22 22" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function Navbar() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-zuki-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <ZukiLogo />
            <span className="font-display font-bold text-xl text-zuki-charcoal">Zuki</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/bakeries" className="text-zuki-muted hover:text-zuki-charcoal transition-colors text-sm font-medium">
              Browse Bakeries
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <ZukiButton variant="ghost" size="sm">Sign In</ZukiButton>
            </Link>
            <Link href="/sign-up">
              <ZukiButton size="sm">Get Started</ZukiButton>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export function ClientNav({ userName, userId }: { userName: string; userId: string }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-zuki-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ZukiLogo />
            <span className="font-display font-bold text-xl text-zuki-charcoal">Zuki</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-zuki-muted hover:text-zuki-charcoal transition-colors text-sm font-medium">
              My Orders
            </Link>
            <Link href="/dashboard/history" className="text-zuki-muted hover:text-zuki-charcoal transition-colors text-sm font-medium">
              History
            </Link>
            <Link href="/bakeries" className="text-zuki-muted hover:text-zuki-charcoal transition-colors text-sm font-medium">
              Browse Bakeries
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-zuki-muted hidden md:block">{userName}</span>
            <Link href="/dashboard/profile">
              <div className="w-8 h-8 rounded-full bg-zuki-pink flex items-center justify-center text-white text-sm font-bold">
                {userName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </Link>
            <button onClick={handleSignOut} className="text-sm text-zuki-muted hover:text-zuki-error transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
