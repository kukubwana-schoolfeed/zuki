import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ZukiCard } from '@/components/zuki/ZukiCard'
import { NotificationBell } from '@/components/layout/NotificationBell'
import { AIBubble } from '@/components/zuki/AIBubble'
import { formatZMW } from '@/lib/utils'
import { ShoppingBag, DollarSign, Clock, Star } from 'lucide-react'
import { BakerOrdersChart } from '@/components/dashboard/BakerOrdersChart'

async function getBakeryStats(bakeryId: string) {
  const supabase = await createClient()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [ordersRes, revenueRes, pendingRes, reviewsRes] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true })
      .eq('bakery_id', bakeryId)
      .gte('created_at', startOfMonth),
    supabase.from('orders').select('total_price_zmw')
      .eq('bakery_id', bakeryId)
      .gte('created_at', startOfMonth)
      .in('status', ['confirmed', 'in_progress', 'ready', 'collected']),
    supabase.from('orders').select('id', { count: 'exact', head: true })
      .eq('bakery_id', bakeryId)
      .in('status', ['pending']),
    supabase.from('reviews').select('rating').eq('bakery_id', bakeryId),
  ])

  const totalRevenue = revenueRes.data?.reduce((sum, o) => sum + o.total_price_zmw, 0) || 0
  const avgRating = reviewsRes.data?.length
    ? (reviewsRes.data.reduce((s, r) => s + r.rating, 0) / reviewsRes.data.length).toFixed(1)
    : null

  return {
    ordersThisMonth: ordersRes.count || 0,
    revenueThisMonth: totalRevenue,
    pendingOrders: pendingRes.count || 0,
    avgRating,
  }
}

export default async function BakerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: bakery } = await supabase
    .from('bakeries')
    .select('id, name, status, slug')
    .eq('owner_id', user.id)
    .single()

  if (!bakery) redirect('/baker/onboarding')
  if (bakery.status !== 'approved') redirect('/baker/pending')

  const stats = await getBakeryStats(bakery.id)

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, order_number, status, total_price_zmw, requested_date, profiles:client_id(full_name), menu_items(name)')
    .eq('bakery_id', bakery.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const context = `Baker: ${bakery.name}. Orders this month: ${stats.ordersThisMonth}. Revenue: ${formatZMW(stats.revenueThisMonth)}. Pending: ${stats.pendingOrders}.`

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-zuki-charcoal">{bakery.name}</h1>
          <p className="text-zuki-muted mt-1">Welcome back! Here&apos;s your overview.</p>
        </div>
        <NotificationBell userId={user.id} />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Orders this month', value: stats.ordersThisMonth.toString(), icon: ShoppingBag, color: 'text-zuki-blue' },
          { label: 'Revenue this month', value: formatZMW(stats.revenueThisMonth), icon: DollarSign, color: 'text-zuki-success' },
          { label: 'Pending orders', value: stats.pendingOrders.toString(), icon: Clock, color: 'text-zuki-warning' },
          { label: 'Average rating', value: stats.avgRating || 'No reviews', icon: Star, color: 'text-yellow-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-zuki-border p-4">
            <div className={`w-8 h-8 rounded-xl bg-zuki-cream flex items-center justify-center mb-3`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="font-display font-bold text-xl text-zuki-charcoal">{stat.value}</p>
            <p className="text-xs text-zuki-muted mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <BakerOrdersChart bakeryId={bakery.id} />

      {/* Recent orders */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-zuki-charcoal">Recent Orders</h2>
          <a href="/baker/orders" className="text-sm text-zuki-pink hover:text-zuki-pink-deep font-medium">View all →</a>
        </div>
        {recentOrders && recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((order: any) => (
              <a key={order.id} href={`/baker/orders/${order.id}`}>
                <div className="bg-white rounded-2xl border border-zuki-border p-4 hover:shadow-zuki hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-zuki-pink">{order.order_number}</p>
                    <p className="font-medium text-zuki-charcoal text-sm">{(order.profiles as any)?.full_name || 'Client'}</p>
                    <p className="text-xs text-zuki-muted">{(order.menu_items as any)?.name}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : order.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200'
                      : order.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                    <p className="text-sm font-bold text-zuki-charcoal mt-1">{formatZMW(order.total_price_zmw)}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-zuki-border">
            <p className="text-zuki-muted">No orders yet. Share your storefront to get started!</p>
            <a href={`/bakery/${bakery.slug}`} className="text-zuki-pink text-sm font-medium mt-2 block">
              View your storefront →
            </a>
          </div>
        )}
      </div>

      <AIBubble context={context} />
    </div>
  )
}
