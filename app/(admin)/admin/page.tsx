import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatZMW } from '@/lib/utils'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [bakeryRes, orderRes, pendingRes] = await Promise.all([
    supabase.from('bakeries').select('id, status', { count: 'exact' }).order('created_at'),
    supabase.from('orders').select('total_price_zmw, status'),
    supabase.from('bakeries').select('id, name, owner_id, created_at', { count: 'exact' }).eq('status', 'pending'),
  ])

  const totalRevenue = orderRes.data?.filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total_price_zmw, 0) || 0
  const totalBakeries = bakeryRes.count || 0
  const approvedBakeries = bakeryRes.data?.filter(b => b.status === 'approved').length || 0
  const pendingBakeries = pendingRes.count || 0
  const totalOrders = orderRes.data?.length || 0

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-display text-3xl font-bold text-zuki-charcoal mb-8">Platform Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Bakeries', value: totalBakeries.toString(), sub: `${approvedBakeries} approved` },
          { label: 'Pending Approval', value: pendingBakeries.toString(), sub: 'Need action', urgent: pendingBakeries > 0 },
          { label: 'Total Orders', value: totalOrders.toString(), sub: 'All time' },
          { label: 'Total Revenue', value: formatZMW(totalRevenue), sub: 'Processed' },
        ].map((s, i) => (
          <div key={i} className={`bg-white rounded-2xl border p-4 ${s.urgent ? 'border-yellow-300 bg-yellow-50' : 'border-zuki-border'}`}>
            <p className="font-display font-bold text-2xl text-zuki-charcoal">{s.value}</p>
            <p className="font-medium text-sm text-zuki-charcoal mt-0.5">{s.label}</p>
            <p className="text-xs text-zuki-muted">{s.sub}</p>
          </div>
        ))}
      </div>

      {pendingBakeries > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-5 mb-6">
          <h2 className="font-bold text-yellow-900 mb-2">⚠️ {pendingBakeries} bakeries awaiting approval</h2>
          <Link href="/admin/bakeries?status=pending"
            className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline">
            Review now →
          </Link>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-zuki-border p-5">
        <h2 className="font-display font-bold text-zuki-charcoal mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/bakeries?status=pending"
            className="px-4 py-2 bg-zuki-pink text-white rounded-xl text-sm font-medium hover:bg-zuki-pink-deep transition-colors">
            Review Pending Bakeries
          </Link>
          <Link href="/admin/bakeries"
            className="px-4 py-2 border border-zuki-border text-zuki-charcoal rounded-xl text-sm font-medium hover:bg-zuki-cream transition-colors">
            All Bakeries
          </Link>
        </div>
      </div>
    </div>
  )
}
