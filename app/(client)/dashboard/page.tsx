import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ZukiBadge } from '@/components/zuki/ZukiBadge'
import { ZukiStepper } from '@/components/zuki/ZukiStepper'
import { NotificationBell } from '@/components/layout/NotificationBell'
import { AIBubble } from '@/components/zuki/AIBubble'
import { formatZMW } from '@/lib/utils'
import { format } from 'date-fns'
import type { Order } from '@/types'

export default async function ClientDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: orders } = await supabase
    .from('orders')
    .select('*, bakeries(name, slug), menu_items(name)')
    .eq('client_id', user.id)
    .not('status', 'in', '("collected","cancelled")')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-zuki-charcoal">My Orders</h1>
          <p className="text-zuki-muted mt-1">Track your active cake orders</p>
        </div>
        <NotificationBell userId={user.id} />
      </div>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎂</div>
          <h3 className="font-display text-2xl font-bold text-zuki-charcoal mb-2">No active orders</h3>
          <p className="text-zuki-muted mb-8">Ready to order your perfect cake?</p>
          <Link href="/bakeries"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zuki-pink text-white rounded-2xl font-medium hover:bg-zuki-pink-deep transition-colors">
            Browse Bakeries
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: Order & { bakeries: { name: string; slug: string }; menu_items: { name: string } }) => (
            <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
              <div className="bg-white rounded-2xl border border-zuki-border p-5 hover:shadow-zuki hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs font-medium text-zuki-pink">{order.order_number}</p>
                    <h3 className="font-display font-bold text-zuki-charcoal mt-0.5">{order.bakeries?.name}</h3>
                    <p className="text-sm text-zuki-muted">{order.menu_items?.name}</p>
                  </div>
                  <ZukiBadge status={order.status} />
                </div>

                <div className="mb-4 overflow-x-auto">
                  <ZukiStepper status={order.status} />
                </div>

                <div className="flex items-center justify-between text-sm pt-3 border-t border-zuki-border">
                  <span className="text-zuki-muted">
                    {format(new Date(order.requested_date), 'dd MMM yyyy')}
                  </span>
                  <span className="font-bold text-zuki-charcoal">{formatZMW(order.total_price_zmw)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <AIBubble context="Client viewing their active orders on the Zuki platform." />
    </div>
  )
}
