import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function BakerRootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'baker') redirect('/')

  return <>{children}</>
}
