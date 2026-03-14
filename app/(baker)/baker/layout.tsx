'use client'
import { usePathname } from 'next/navigation'
import { BakerSidebar } from '@/components/layout/BakerSidebar'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const STANDALONE_PATHS = ['/baker/onboarding', '/baker/pending']

export default function BakerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [bakerName, setBakerName] = useState('Baker')
  const supabase = createClient()

  const isStandalone = STANDALONE_PATHS.some(p => pathname === p)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('full_name').eq('id', user.id).single()
        .then(({ data }) => { if (data?.full_name) setBakerName(data.full_name) })
    })
  }, [supabase])

  if (isStandalone) return <>{children}</>

  return (
    <div className="min-h-screen bg-zuki-cream">
      <BakerSidebar bakerName={bakerName} />
      <main className="md:ml-64 min-h-screen pb-20 md:pb-8">
        {children}
      </main>
    </div>
  )
}
