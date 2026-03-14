import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/')

  return (
    <div className="min-h-screen bg-zuki-cream">
      <nav className="bg-zuki-charcoal text-white px-6 py-4 flex items-center gap-6">
        <span className="font-display font-bold text-lg">Zuki Admin</span>
        <Link href="/admin" className="text-white/70 hover:text-white text-sm transition-colors">Dashboard</Link>
        <Link href="/admin/bakeries" className="text-white/70 hover:text-white text-sm transition-colors">Bakeries</Link>
        <div className="ml-auto text-sm text-white/50">{user.email}</div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
