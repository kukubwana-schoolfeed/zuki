'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ZukiButton } from '@/components/zuki/ZukiButton'
import { formatZMW } from '@/lib/utils'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { FileText, Download, Sparkles } from 'lucide-react'

export default function BakerReportsPage() {
  const [bakery, setBakery] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [report, setReport] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [dateRange, setDateRange] = useState({
    from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    to: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  })
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('bakeries').select('id, name').eq('owner_id', user.id).single()
      if (data) setBakery(data)
      setLoading(false)
    }
    load()
  }, [supabase])

  async function loadOrders() {
    if (!bakery) return
    const { data } = await supabase
      .from('orders')
      .select('*, menu_items(name), profiles:client_id(full_name)')
      .eq('bakery_id', bakery.id)
      .gte('created_at', dateRange.from)
      .lte('created_at', dateRange.to + 'T23:59:59')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    return data
  }

  async function generateReport() {
    setGenerating(true)
    const ordersData = await loadOrders()
    if (!ordersData) { setGenerating(false); return }

    const res = await fetch('/api/ai/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bakeryName: bakery.name,
        period: `${dateRange.from} to ${dateRange.to}`,
        ordersData: ordersData.map((o: any) => ({
          orderNumber: o.order_number,
          status: o.status,
          total: o.total_price_zmw,
          item: o.menu_items?.name,
          date: o.created_at,
        })),
      }),
    })

    const data = await res.json()
    if (data.report) setReport(data.report)
    setGenerating(false)
  }

  async function downloadPDF() {
    if (!report || orders.length === 0) return
    // Dynamic import to avoid SSR issues
    const { pdf } = await import('@react-pdf/renderer')
    const { SalesReportDocument } = await import('@/lib/pdf')
    const blob = await pdf(SalesReportDocument({ bakeryName: bakery.name, period: `${dateRange.from} to ${dateRange.to}`, report, orders })).toBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${bakery.name}-report-${dateRange.from}.pdf`
    a.click()
  }

  if (loading) return <div className="p-6 text-center text-zuki-muted">Loading...</div>

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-zuki-charcoal">Reports</h1>
        <p className="text-zuki-muted text-sm">Generate AI-powered sales summaries and order receipts</p>
      </div>

      <div className="bg-white rounded-2xl border border-zuki-border p-6 mb-6">
        <h2 className="font-display font-bold text-zuki-charcoal mb-4">Sales Summary Report</h2>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-zuki-charcoal mb-2">From Date</label>
            <input type="date" value={dateRange.from} onChange={e => setDateRange(p => ({ ...p, from: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zuki-charcoal mb-2">To Date</label>
            <input type="date" value={dateRange.to} onChange={e => setDateRange(p => ({ ...p, to: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
          </div>
        </div>

        <ZukiButton onClick={generateReport} loading={generating} className="w-full">
          <Sparkles className="w-4 h-4 mr-2" />
          {generating ? 'Generating with AI...' : 'Generate Report'}
        </ZukiButton>
      </div>

      {report && (
        <div className="bg-white rounded-2xl border border-zuki-border p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-zuki-charcoal">
              {bakery.name} — {dateRange.from} to {dateRange.to}
            </h2>
            <ZukiButton variant="secondary" size="sm" onClick={downloadPDF}>
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </ZukiButton>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Orders', value: report.summary.totalOrders },
              { label: 'Total Revenue', value: formatZMW(report.summary.totalRevenue) },
              { label: 'Avg Order Value', value: formatZMW(report.summary.averageOrderValue) },
              { label: 'Completed', value: report.summary.completedOrders },
            ].map((s, i) => (
              <div key={i} className="bg-zuki-cream rounded-xl p-3 text-center">
                <p className="font-display font-bold text-lg text-zuki-charcoal">{s.value}</p>
                <p className="text-xs text-zuki-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Top items */}
          {report.topItems?.length > 0 && (
            <div>
              <h3 className="font-medium text-zuki-charcoal text-sm mb-3">Top Items</h3>
              <div className="space-y-2">
                {report.topItems.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-zuki-charcoal">{item.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-zuki-muted">{item.count} orders</span>
                      <span className="font-medium">{formatZMW(item.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI highlights */}
          {report.highlights?.length > 0 && (
            <div>
              <h3 className="font-medium text-zuki-charcoal text-sm mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-zuki-pink" /> AI Insights
              </h3>
              <ul className="space-y-1">
                {report.highlights.map((h: string, i: number) => (
                  <li key={i} className="text-sm text-zuki-muted flex gap-2">
                    <span className="text-zuki-pink">•</span> {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.recommendations?.length > 0 && (
            <div>
              <h3 className="font-medium text-zuki-charcoal text-sm mb-2">Recommendations</h3>
              <ul className="space-y-1">
                {report.recommendations.map((r: string, i: number) => (
                  <li key={i} className="text-sm text-zuki-muted flex gap-2">
                    <span className="text-zuki-blue">→</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Orders list */}
      {orders.length > 0 && (
        <div className="bg-white rounded-2xl border border-zuki-border overflow-hidden mt-6">
          <div className="px-5 py-4 border-b border-zuki-border">
            <h3 className="font-display font-bold text-zuki-charcoal text-sm">Orders in Range ({orders.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zuki-cream text-xs text-zuki-muted">
                <tr>
                  <th className="text-left px-4 py-3">Order</th>
                  <th className="text-left px-4 py-3">Client</th>
                  <th className="text-left px-4 py-3">Item</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zuki-border">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-zuki-cream/50">
                    <td className="px-4 py-3 font-medium text-zuki-pink">{order.order_number}</td>
                    <td className="px-4 py-3 text-zuki-charcoal">{(order.profiles as any)?.full_name}</td>
                    <td className="px-4 py-3 text-zuki-muted">{(order.menu_items as any)?.name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        order.status === 'collected' ? 'bg-green-100 text-green-700'
                        : order.status === 'cancelled' ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-right">{formatZMW(order.total_price_zmw)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
