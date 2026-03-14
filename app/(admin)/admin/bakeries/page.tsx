import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import type { BakeryStatus } from '@/types'

interface PageProps {
  searchParams: { status?: string }
}

export default async function AdminBakeriesPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const statusFilter = searchParams.status as BakeryStatus | undefined

  let query = supabase
    .from('bakeries')
    .select('id, name, slug, status, created_at, profiles:owner_id(full_name, email:id)')
    .order('created_at', { ascending: false })

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  const { data: bakeries } = await query

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    approved: 'bg-green-100 text-green-700 border-green-300',
    suspended: 'bg-red-100 text-red-700 border-red-300',
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-display text-3xl font-bold text-zuki-charcoal mb-6">Bakeries</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { label: 'All', value: undefined },
          { label: 'Pending', value: 'pending' },
          { label: 'Approved', value: 'approved' },
          { label: 'Suspended', value: 'suspended' },
        ].map(tab => (
          <Link
            key={tab.label}
            href={tab.value ? `/admin/bakeries?status=${tab.value}` : '/admin/bakeries'}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
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
          <p className="text-zuki-muted">No bakeries found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zuki-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-zuki-cream text-xs font-medium text-zuki-muted">
              <tr>
                <th className="text-left px-5 py-3">Bakery</th>
                <th className="text-left px-5 py-3">Owner</th>
                <th className="text-left px-5 py-3">Applied</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zuki-border">
              {bakeries.map((bakery: any) => (
                <tr key={bakery.id} className="hover:bg-zuki-cream/30 transition-colors">
                  <td className="px-5 py-4">
                    <Link href={`/admin/bakeries/${bakery.id}`} className="font-medium text-zuki-charcoal hover:text-zuki-pink transition-colors">
                      {bakery.name}
                    </Link>
                    <p className="text-xs text-zuki-muted">/{bakery.slug}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-zuki-charcoal">{bakery.profiles?.full_name || 'Unknown'}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-zuki-muted">
                    {format(new Date(bakery.created_at), 'dd MMM yyyy')}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[bakery.status]}`}>
                      {bakery.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/bakeries/${bakery.id}`} className="text-xs text-zuki-blue hover:underline">
                      Review →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
