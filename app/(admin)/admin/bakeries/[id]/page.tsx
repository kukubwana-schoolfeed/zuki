import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { sendBakeryApprovedEmail } from '@/lib/email'
import { ArrowLeft, CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react'
import { formatZMW } from '@/lib/utils'

interface PageProps {
  params: { id: string }
}

export default async function AdminBakeryDetail({ params }: PageProps) {
  const supabase = await createClient()

  const { data: bakery } = await supabase
    .from('bakeries')
    .select('*, profiles:owner_id(full_name, phone)')
    .eq('id', params.id)
    .single()

  if (!bakery) notFound()

  const [ordersRes, reviewsRes] = await Promise.all([
    supabase.from('orders').select('id, status, total_price_zmw', { count: 'exact' }).eq('bakery_id', params.id),
    supabase.from('reviews').select('rating').eq('bakery_id', params.id),
  ])

  const totalRevenue = ordersRes.data?.filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total_price_zmw || 0), 0) || 0
  const avgRating = reviewsRes.data?.length
    ? (reviewsRes.data.reduce((s, r) => s + r.rating, 0) / reviewsRes.data.length).toFixed(1)
    : null

  async function approveBakery() {
    'use server'
    const supabase = await createClient()
    await supabase.from('bakeries').update({ status: 'approved' }).eq('id', params.id)
    try {
      const { data: ownerAuth } = await supabase.auth.admin.getUserById(bakery.owner_id)
      if (ownerAuth?.user?.email) {
        await sendBakeryApprovedEmail(ownerAuth.user.email, bakery.name, bakery.slug)
      }
    } catch {}
    redirect('/admin/bakeries')
  }

  async function suspendBakery() {
    'use server'
    const supabase = await createClient()
    await supabase.from('bakeries').update({ status: 'suspended' }).eq('id', params.id)
    redirect('/admin/bakeries')
  }

  async function reactivateBakery() {
    'use server'
    const supabase = await createClient()
    await supabase.from('bakeries').update({ status: 'approved' }).eq('id', params.id)
    redirect('/admin/bakeries')
  }

  const statusStyles: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-700 border-yellow-200',
    approved:  'bg-green-100 text-green-700 border-green-200',
    suspended: 'bg-red-100 text-red-700 border-red-200',
  }

  const paymentMethods = [
    bakery.accepts_airtel && `Airtel Money${bakery.airtel_number ? ` (${bakery.airtel_number})` : ''}`,
    bakery.accepts_mtn && `MTN MoMo${bakery.mtn_number ? ` (${bakery.mtn_number})` : ''}`,
    bakery.accepts_zamtel && `Zamtel${bakery.zamtel_number ? ` (${bakery.zamtel_number})` : ''}`,
    bakery.accepts_bank && bakery.bank_name && `${bakery.bank_name} – ${bakery.bank_account_name || ''} (${bakery.bank_account_number || ''})`,
  ].filter(Boolean)

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/admin/bakeries" className="p-2 rounded-xl hover:bg-white transition-colors mt-0.5 shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="font-display text-xl sm:text-2xl font-bold text-zuki-charcoal truncate">{bakery.name}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[bakery.status]}`}>
              {bakery.status}
            </span>
            <span className="text-xs text-zuki-muted">/{bakery.slug}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Orders', value: (ordersRes.count || 0).toString() },
          { label: 'Revenue', value: formatZMW(totalRevenue) },
          { label: 'Avg Rating', value: avgRating ? `${avgRating}/5` : '—' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-zuki-border p-3 sm:p-4 text-center">
            <p className="font-display font-bold text-lg sm:text-xl text-zuki-charcoal">{s.value}</p>
            <p className="text-xs text-zuki-muted mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl border border-zuki-border p-5">
        <h2 className="font-display font-bold text-zuki-charcoal mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          {bakery.status === 'pending' && (
            <form action={approveBakery}>
              <button type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-zuki-success text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                <CheckCircle className="w-4 h-4" /> Approve Bakery
              </button>
            </form>
          )}
          {bakery.status === 'approved' && (
            <form action={suspendBakery}>
              <button type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-zuki-error text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                <XCircle className="w-4 h-4" /> Suspend Bakery
              </button>
            </form>
          )}
          {bakery.status === 'suspended' && (
            <form action={reactivateBakery}>
              <button type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-zuki-success text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                <RefreshCw className="w-4 h-4" /> Reactivate Bakery
              </button>
            </form>
          )}
          {bakery.status === 'approved' && (
            <a href={`/bakery/${bakery.slug}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 border border-zuki-border text-zuki-charcoal rounded-xl text-sm font-medium hover:bg-zuki-cream transition-colors">
              <ExternalLink className="w-4 h-4" /> View Storefront
            </a>
          )}
        </div>
      </div>

      {/* Bakery info */}
      <div className="bg-white rounded-2xl border border-zuki-border p-5">
        <h2 className="font-display font-bold text-zuki-charcoal mb-4">Bakery Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          {[
            ['Owner', (bakery.profiles as any)?.full_name || '—'],
            ['Phone', (bakery.profiles as any)?.phone || 'Not provided'],
            ['Applied', format(new Date(bakery.created_at), 'dd MMMM yyyy')],
            ['WhatsApp', bakery.whatsapp_number || 'Not set'],
            ['Deposit', `${bakery.deposit_percent}% upfront`],
            ['Min Notice', `${bakery.min_notice_hours} hours`],
            ['Delivery', bakery.delivery_option],
            ['Delivery Fee', bakery.delivery_fee_zmw ? formatZMW(bakery.delivery_fee_zmw) : 'N/A'],
            ['Rush Orders', bakery.rush_order_enabled ? `Yes — ${formatZMW(bakery.rush_fee_zmw || 0)} fee` : 'Disabled'],
            ['Max Orders/Day', (bakery.max_orders_per_day || '—').toString()],
          ].map(([label, value], i) => (
            <div key={i} className="flex gap-3">
              <span className="text-zuki-muted shrink-0 w-28">{label}</span>
              <span className="font-medium text-zuki-charcoal">{value}</span>
            </div>
          ))}
        </div>

        {bakery.description && (
          <div className="mt-4 pt-4 border-t border-zuki-border">
            <p className="text-xs text-zuki-muted uppercase tracking-wide font-medium mb-1">Description</p>
            <p className="text-sm text-zuki-charcoal leading-relaxed">{bakery.description}</p>
          </div>
        )}
      </div>

      {/* Payment methods */}
      {paymentMethods.length > 0 && (
        <div className="bg-white rounded-2xl border border-zuki-border p-5">
          <h2 className="font-display font-bold text-zuki-charcoal mb-3">Payment Methods</h2>
          <ul className="space-y-2">
            {paymentMethods.map((m, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-zuki-charcoal">
                <span className="w-2 h-2 rounded-full bg-zuki-success shrink-0" />
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Refund policy */}
      {bakery.refund_policy_enabled && bakery.refund_policy_text && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
          <h2 className="font-display font-bold text-yellow-900 mb-2">Refund Policy</h2>
          <p className="text-sm text-yellow-800 leading-relaxed">{bakery.refund_policy_text}</p>
        </div>
      )}
    </div>
  )
}
