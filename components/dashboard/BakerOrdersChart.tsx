'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { subDays, format, startOfDay } from 'date-fns'
import { formatZMW } from '@/lib/utils'
import { ZukiSkeleton } from '@/components/zuki/ZukiSkeleton'

const COLORS = ['#F4A7B9', '#5B8DEF', '#6BCB8B', '#F6C85F', '#F47B7B']

export function BakerOrdersChart({ bakeryId }: { bakeryId: string }) {
  const [ordersData, setOrdersData] = useState<any[]>([])
  const [statusData, setStatusData] = useState<any[]>([])
  const [menuData, setMenuData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadCharts() {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString()

      const { data: orders } = await supabase
        .from('orders')
        .select('created_at, status, total_price_zmw, menu_items(name)')
        .eq('bakery_id', bakeryId)
        .gte('created_at', thirtyDaysAgo)

      if (orders) {
        // Orders by day
        const byDay: Record<string, number> = {}
        for (let i = 29; i >= 0; i--) {
          const day = format(subDays(new Date(), i), 'MMM dd')
          byDay[day] = 0
        }
        orders.forEach(o => {
          const day = format(new Date(o.created_at), 'MMM dd')
          if (byDay[day] !== undefined) byDay[day]++
        })
        setOrdersData(Object.entries(byDay).map(([date, count]) => ({ date, count })))

        // Status breakdown
        const byStatus: Record<string, number> = {}
        orders.forEach(o => { byStatus[o.status] = (byStatus[o.status] || 0) + 1 })
        setStatusData(Object.entries(byStatus).map(([name, value]) => ({
          name: name.replace('_', ' '),
          value
        })))

        // Menu items
        const byItem: Record<string, number> = {}
        orders.forEach(o => {
          const name = (o.menu_items as any)?.name || 'Unknown'
          byItem[name] = (byItem[name] || 0) + 1
        })
        setMenuData(
          Object.entries(byItem)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }))
        )
      }

      setLoading(false)
    }
    loadCharts()
  }, [bakeryId, supabase])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ZukiSkeleton className="h-64" />
        <ZukiSkeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Orders by day */}
      <div className="bg-white rounded-2xl border border-zuki-border p-5">
        <h3 className="font-display font-bold text-zuki-charcoal mb-4 text-sm">Orders — Last 30 Days</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={ordersData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0E8E8" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={6} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#F4A7B9" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-2xl border border-zuki-border p-5">
        <h3 className="font-display font-bold text-zuki-charcoal mb-4 text-sm">Order Status Breakdown</h3>
        {statusData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {statusData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend formatter={val => <span style={{ fontSize: 11 }}>{val}</span>} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-zuki-muted text-sm">No data yet</div>
        )}
      </div>

      {/* Popular items */}
      {menuData.length > 0 && (
        <div className="bg-white rounded-2xl border border-zuki-border p-5 lg:col-span-2">
          <h3 className="font-display font-bold text-zuki-charcoal mb-4 text-sm">Most Ordered Items</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={menuData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F0E8E8" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#F4A7B9" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
