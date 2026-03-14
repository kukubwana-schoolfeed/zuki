import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClientNav } from '@/components/layout/Navbar'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'client') redirect('/')

  return (
    <div className="min-h-screen bg-zuki-cream">
      <ClientNav userName={profile?.full_name || 'Client'} userId={user.id} />
      <main className="pt-20 pb-8">
        {children}
      </main>
    </div>
  )
}
