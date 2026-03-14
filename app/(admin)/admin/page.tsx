import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { formatZMW } from '@/lib/utils'
import { format } from 'date-fns'
import { Store, Clock, ShoppingBag, TrendingUp, ChevronRight, AlertTriangle } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = createAdminClient()

  const [bakeryRes, orderRes, pendingRes, recentRes] = await Promise.all([
    supabase.from('bakeries').select('id, status'),
    supabase.from('orders').select('total_price_zmw, status'),
    supabase.from('bakeries').select('id, name, slug, created_at').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
    supabase.from('bakeries').select('id, name, slug, status, created_at').order('created_at', { ascending: false }).limit(8),
  ])

  const totalRevenue = orderRes.data?.filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total_price_zmw || 0), 0) || 0
  const totalBakeries = bakeryRes.data?.length || 0
  const approvedBakeries = bakeryRes.data?.filter(b => b.status === 'approved').length || 0
  const pendingCount = pendingRes.data?.length || 0
  const totalOrders = orderRes.data?.length || 0

  const stats = [
    { label: 'Total Bakeries', value: totalBakeries.toString(), sub: `${approvedBakeries} approved`, icon: Store, color: 'bg-zuki-pink/10 text-zuki-pink' },
    { label: 'Pending Approval', value: pendingCount.toString(), sub: 'Awaiting review', icon: Clock, color: pendingCount > 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400', urgent: pendingCount > 0 },
    { label: 'Total Orders', value: totalOrders.toString(), sub: 'Platform-wide', icon: ShoppingBag, color: 'bg-zuki-blue/10 text-zuki-blue' },
    { label: 'Revenue Processed', value: formatZMW(totalRevenue), sub: 'All time', icon: TrendingUp, color: 'bg-green-100 text-green-600' },
  ]

  const statusStyles: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-700 border-yellow-200',
    approved:  'bg-green-100 text-green-700 border-green-200',
    suspended: 'bg-red-100 text-red-700 border-red-200',
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-zuki-charcoal">Platform Overview</h1>
        <p className="text-zuki-muted text-sm mt-1">Welcome back, admin.</p>
      </div>

      {/* Urgent banner */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-300 rounded-2xl p-4">
          <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-yellow-900 text-sm">{pendingCount} {pendingCount === 1 ? 'bakery' : 'bakeries'} awaiting approval</p>
            <p className="text-yellow-700 text-xs">Review and approve to get them live on Zuki.</p>
          </div>
          <Link href="/admin/bakeries?status=pending"
            className="shrink-0 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-sm font-medium transition-colors">
            Review
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s, i) => (
          <div key={i} className={`bg-white rounded-2xl border p-4 sm:p-5 ${s.urgent ? 'border-yellow-300' : 'border-zuki-border'}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="font-display font-bold text-xl sm:text-2xl text-zuki-charcoal leading-none">{s.value}</p>
            <p className="font-medium text-xs sm:text-sm text-zuki-charcoal mt-1">{s.label}</p>
            <p className="text-xs text-zuki-muted mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending bakeries */}
        {pendingCount > 0 && (
          <div className="bg-white rounded-2xl border border-zuki-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zuki-border">
              <h2 className="font-display font-bold text-zuki-charcoal">Pending Bakeries</h2>
              <Link href="/admin/bakeries?status=pending" className="text-xs text-zuki-blue hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-zuki-border">
              {pendingRes.data?.map((b: any) => (
                <Link key={b.id} href={`/admin/bakeries/${b.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-zuki-cream/50 transition-colors group">
                  <div>
                    <p className="font-medium text-sm text-zuki-charcoal group-hover:text-zuki-pink transition-colors">{b.name}</p>
                    <p className="text-xs text-zuki-muted">{format(new Date(b.created_at), 'dd MMM yyyy')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200 font-medium">pending</span>
                    <ChevronRight className="w-4 h-4 text-zuki-muted group-hover:text-zuki-pink transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent bakeries */}
        <div className={`bg-white rounded-2xl border border-zuki-border overflow-hidden ${pendingCount === 0 ? 'lg:col-span-2' : ''}`}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-zuki-border">
            <h2 className="font-display font-bold text-zuki-charcoal">Recent Bakeries</h2>
            <Link href="/admin/bakeries" className="text-xs text-zuki-blue hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-zuki-border">
            {recentRes.data?.map((b: any) => (
              <Link key={b.id} href={`/admin/bakeries/${b.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-zuki-cream/50 transition-colors group">
                <div>
                  <p className="font-medium text-sm text-zuki-charcoal group-hover:text-zuki-pink transition-colors">{b.name}</p>
                  <p className="text-xs text-zuki-muted">{format(new Date(b.created_at), 'dd MMM yyyy')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusStyles[b.status]}`}>{b.status}</span>
                  <ChevronRight className="w-4 h-4 text-zuki-muted group-hover:text-zuki-pink transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-zuki-border p-5">
        <h2 className="font-display font-bold text-zuki-charcoal mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/bakeries?status=pending"
            className="px-4 py-2.5 bg-zuki-pink text-white rounded-xl text-sm font-medium hover:bg-zuki-pink-deep transition-colors">
            Review Pending Bakeries
          </Link>
          <Link href="/admin/bakeries"
            className="px-4 py-2.5 border border-zuki-border text-zuki-charcoal rounded-xl text-sm font-medium hover:bg-zuki-cream transition-colors">
            All Bakeries
          </Link>
        </div>
      </div>
    </div>
  )
}
