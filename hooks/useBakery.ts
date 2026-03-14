'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Bakery } from '@/types'

export function useBakery(ownerId?: string) {
  const [bakery, setBakery] = useState<Bakery | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!ownerId) { setLoading(false); return }
    supabase.from('bakeries').select('*').eq('owner_id', ownerId).single()
      .then(({ data }) => { setBakery(data); setLoading(false) })
  }, [ownerId, supabase])

  return { bakery, loading }
}
