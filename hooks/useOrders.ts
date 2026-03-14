'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Order } from '@/types'

export function useOrders(userId: string, role: 'client' | 'baker', bakeryId?: string) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    async function load() {
      let query = supabase.from('orders').select('*')
      if (role === 'client') {
        query = query.eq('client_id', userId)
      } else if (role === 'baker' && bakeryId) {
        query = query.eq('bakery_id', bakeryId)
      }
      const { data } = await query.order('created_at', { ascending: false })
      setOrders(data || [])
      setLoading(false)
    }

    load()
  }, [userId, role, bakeryId, supabase])

  return { orders, loading }
}
