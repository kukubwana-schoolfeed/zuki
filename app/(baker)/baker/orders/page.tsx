'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ZukiBadge } from '@/components/zuki/ZukiBadge'
import { ZukiSkeleton } from '@/components/zuki/ZukiSkeleton'
import { NotificationBell } from '@/components/layout/NotificationBell'
import { formatZMW } from '@/lib/utils'
import { format } from 'date-fns'
import { LayoutGrid, List, MessageCircle } from 'lucide-react'
import type { OrderStatus } from '@/types'

const KANBAN_COLS: { status: OrderStatus; label: string; color: string }[] = [
  { status: 'pending', label: 'Pending', color: 'border-yellow-300 bg-yellow-50' },
  { status: 'confirmed', label: 'Confirmed', color: 'border-green-300 bg-green-50' },
  { status: 'in_progress', label: 'In Progress', color: 'border-blue-300 bg-blue-50' },
  { status: 'ready', label: 'Ready', color: 'border-purple-300 bg-purple-50' },
]

export default function BakerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [userId, setUserId] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: bakery } = await supabase
        .from('bakeries').select('id').eq('owner_id', user.id).single()
      if (!bakery) return

      const { data } = await supabase
        .from('orders')
        .select('*, profiles:client_id(full_name), menu_items(name)')
        .eq('bakery_id', bakery.id)
        .not('status', 'in', '("collected","cancelled")')
        .order('created_at', { ascending: false })

      setOrders(data || [])
      setLoading(false)

      // Real-time
      const channel = supabase.channel('orders-list')
        .on('postgres_changes', {
          event: '*', schema: 'public', table: 'orders',
          filter: `bakery_id=eq.${bakery.id}`,
        }, () => {
          supabase.from('orders')
            .select('*, profiles:client_id(full_name), menu_items(name)')
            .eq('bakery_id', bakery.id)
            .not('status', 'in', '("collected","cancelled")')
            .order('created_at', { ascending: false })
            .then(({ data: fresh }) => { if (fresh) setOrders(fresh) })
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
    load()
  }, [supabase])

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <ZukiSkeleton key={i} className="h-64" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-zuki-charcoal">Orders</h1>
          <p className="text-zuki-muted text-sm">{orders.length} active orders</p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell userId={userId} />
          <div className="flex border border-zuki-border rounded-xl overflow-hidden bg-white">
            <button
              onClick={() => setView('kanban')}
              className={`p-2 ${view === 'kanban' ? 'bg-zuki-pink text-white' : 'text-zuki-muted hover:bg-zuki-cream'} transition-colors`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 ${view === 'list' ? 'bg-zuki-pink text-white' : 'text-zuki-muted hover:bg-zuki-cream'} transition-colors`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-zuki-border">
          <div className="text-5xl mb-4">🎂</div>
          <p className="text-zuki-muted">No active orders. Share your storefront to get orders!</p>
        </div>
      ) : view === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 overflow-x-auto">
          {KANBAN_COLS.map(col => {
            const colOrders = orders.filter(o => o.status === col.status)
            return (
              <div key={col.status} className={`rounded-2xl border-2 ${col.color} p-3 min-h-[400px]`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-sm text-zuki-charcoal">{col.label}</span>
                  <span className="text-xs bg-white/80 px-2 py-0.5 rounded-full font-medium">{colOrders.length}</span>
                </div>
                <div className="space-y-2">
                  {colOrders.map(order => (
                    <Link key={order.id} href={`/baker/orders/${order.id}`}>
                      <div className="bg-white rounded-xl border border-zuki-border p-3 hover:shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer">
                        <p className="text-[10px] font-medium text-zuki-pink">{order.order_number}</p>
                        <p className="font-medium text-sm text-zuki-charcoal mt-0.5">{(order.profiles as any)?.full_name}</p>
                        <p className="text-xs text-zuki-muted">{(order.menu_items as any)?.name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-zuki-muted">
                            {format(new Date(order.requested_date), 'dd MMM')}
                          </span>
                          <span className="text-xs font-bold text-zuki-charcoal">{formatZMW(order.total_price_zmw)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zuki-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-zuki-cream text-xs font-medium text-zuki-muted">
              <tr>
                <th className="text-left px-4 py-3">Order</th>
                <th className="text-left px-4 py-3">Client</th>
                <th className="text-left px-4 py-3">Item</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zuki-border">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-zuki-cream/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/baker/orders/${order.id}`} className="text-xs font-medium text-zuki-pink hover:underline">
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm">{(order.profiles as any)?.full_name}</td>
                  <td className="px-4 py-3 text-sm text-zuki-muted">{(order.menu_items as any)?.name}</td>
                  <td className="px-4 py-3 text-sm text-zuki-muted">{format(new Date(order.requested_date), 'dd MMM yyyy')}</td>
                  <td className="px-4 py-3 text-sm font-bold">{formatZMW(order.total_price_zmw)}</td>
                  <td className="px-4 py-3"><ZukiBadge status={order.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
