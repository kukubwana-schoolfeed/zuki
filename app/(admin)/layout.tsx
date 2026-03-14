import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/')

  return (
    <div className="min-h-screen bg-zuki-cream">
      {/* Top nav */}
      <nav className="bg-zuki-charcoal text-white sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 gap-2 sm:gap-6">
            {/* Logo */}
            <Link href="/admin" className="flex items-center gap-2 shrink-0">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="15" stroke="#F4A7B9" strokeWidth="2" fill="none" />
                <path d="M10 10 L22 10 L10 22 L22 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              <span className="font-display font-bold text-base sm:text-lg text-white">Zuki Admin</span>
            </Link>

            {/* Nav links */}
            <div className="flex items-center gap-1 sm:gap-4 ml-2 sm:ml-4">
              <Link href="/admin"
                className="px-2 sm:px-3 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 text-xs sm:text-sm font-medium transition-colors">
                Dashboard
              </Link>
              <Link href="/admin/bakeries"
                className="px-2 sm:px-3 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 text-xs sm:text-sm font-medium transition-colors">
                Bakeries
              </Link>
            </div>

            {/* User email */}
            <div className="ml-auto text-xs text-white/40 hidden sm:block truncate max-w-[180px]">{user.email}</div>

            {/* Sign out */}
            <form action={async () => {
              'use server'
              const { createClient } = await import('@/lib/supabase/server')
              const supabase = await createClient()
              await supabase.auth.signOut()
              redirect('/')
            }}>
              <button type="submit" className="text-xs text-white/50 hover:text-white transition-colors shrink-0">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  )
}
