import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { format } from 'date-fns'
import { ChevronRight } from 'lucide-react'
import type { BakeryStatus } from '@/types'

interface PageProps {
  searchParams: { status?: string }
}

export default async function AdminBakeriesPage({ searchParams }: PageProps) {
  const supabase = createAdminClient()
  const statusFilter = searchParams.status as BakeryStatus | undefined

  let query = supabase
    .from('bakeries')
    .select('id, name, slug, status, created_at, profiles:owner_id(full_name)')
    .order('created_at', { ascending: false })

  if (statusFilter) query = query.eq('status', statusFilter)

  const { data: bakeries } = await query

  const tabs = [
    { label: 'All', value: undefined },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Suspended', value: 'suspended' },
  ]

  const statusStyles: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-700 border-yellow-200',
    approved:  'bg-green-100 text-green-700 border-green-200',
    suspended: 'bg-red-100 text-red-700 border-red-200',
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-zuki-charcoal">Bakeries</h1>

      {/* Filter tabs — horizontally scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map(tab => (
          <Link
            key={tab.label}
            href={tab.value ? `/admin/bakeries?status=${tab.value}` : '/admin/bakeries'}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === tab.value || (!statusFilter && !tab.value)
                ? 'bg-zuki-pink text-white'
                : 'bg-white border border-zuki-border text-zuki-muted hover:bg-zuki-cream'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {!bakeries || bakeries.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-zuki-border">
          <div className="text-4xl mb-3">🏪</div>
          <p className="text-zuki-muted">No bakeries found</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-zuki-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-zuki-cream/80 text-xs font-semibold text-zuki-muted uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3.5">Bakery</th>
                  <th className="text-left px-5 py-3.5">Owner</th>
                  <th className="text-left px-5 py-3.5">Applied</th>
                  <th className="text-left px-5 py-3.5">Status</th>
                  <th className="text-left px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zuki-border">
                {bakeries.map((bakery: any) => (
                  <tr key={bakery.id} className="hover:bg-zuki-cream/30 transition-colors group">
                    <td className="px-5 py-4">
                      <Link href={`/admin/bakeries/${bakery.id}`} className="font-medium text-zuki-charcoal group-hover:text-zuki-pink transition-colors">
                        {bakery.name}
                      </Link>
                      <p className="text-xs text-zuki-muted">/{bakery.slug}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-zuki-charcoal">{(bakery.profiles as any)?.full_name || '—'}</td>
                    <td className="px-5 py-4 text-sm text-zuki-muted">{format(new Date(bakery.created_at), 'dd MMM yyyy')}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[bakery.status]}`}>
                        {bakery.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/bakeries/${bakery.id}`} className="text-xs font-medium text-zuki-blue hover:underline">
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden space-y-3">
            {bakeries.map((bakery: any) => (
              <Link key={bakery.id} href={`/admin/bakeries/${bakery.id}`}
                className="flex items-center justify-between bg-white rounded-2xl border border-zuki-border px-4 py-3.5 hover:shadow-sm transition-shadow">
                <div className="min-w-0">
                  <p className="font-medium text-zuki-charcoal truncate">{bakery.name}</p>
                  <p className="text-xs text-zuki-muted">{(bakery.profiles as any)?.full_name || '—'} · {format(new Date(bakery.created_at), 'dd MMM yy')}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyles[bakery.status]}`}>
                    {bakery.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-zuki-muted" />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
