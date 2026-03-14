import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { sendBakeryApprovedEmail } from '@/lib/email'
import { ArrowLeft } from 'lucide-react'

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

  const [ordersRes, reviewsRes, ownerEmailRes] = await Promise.all([
    supabase.from('orders').select('id, status, total_price_zmw', { count: 'exact' }).eq('bakery_id', params.id),
    supabase.from('reviews').select('rating').eq('bakery_id', params.id),
    supabase.auth.admin.getUserById(bakery.owner_id).catch(() => ({ data: { user: null } })),
  ])

  const totalRevenue = ordersRes.data?.filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total_price_zmw, 0) || 0
  const avgRating = reviewsRes.data?.length
    ? (reviewsRes.data.reduce((s, r) => s + r.rating, 0) / reviewsRes.data.length).toFixed(1)
    : null

  // Server actions handled via API route pattern
  async function approveBakery() {
    'use server'
    const supabase = await createClient()
    await supabase.from('bakeries').update({ status: 'approved' }).eq('id', params.id)
    // Try to send email (may fail if Resend not configured)
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

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    suspended: 'bg-red-100 text-red-700',
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/bakeries" className="p-2 rounded-xl hover:bg-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-zuki-charcoal">{bakery.name}</h1>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[bakery.status]}`}>
            {bakery.status}
          </span>
        </div>
      </div>

      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Orders', value: (ordersRes.count || 0).toString() },
            { label: 'Revenue Processed', value: `K${totalRevenue.toFixed(2)}` },
            { label: 'Avg Rating', value: avgRating || 'No reviews' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-zuki-border p-4 text-center">
              <p className="font-display font-bold text-xl text-zuki-charcoal">{s.value}</p>
              <p className="text-xs text-zuki-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Bakery info */}
        <div className="bg-white rounded-2xl border border-zuki-border p-5">
          <h2 className="font-display font-bold text-zuki-charcoal mb-4">Bakery Information</h2>
          <div className="space-y-2 text-sm">
            {[
              ['Bakery Name', bakery.name],
              ['Slug / URL', `/bakery/${bakery.slug}`],
              ['Owner Name', bakery.profiles?.full_name],
              ['Owner Phone', bakery.profiles?.phone || 'Not provided'],
              ['Applied', format(new Date(bakery.created_at), 'dd MMMM yyyy')],
              ['Description', bakery.description || 'Not provided'],
              ['WhatsApp', bakery.whatsapp_number || 'Not set'],
              ['Deposit %', `${bakery.deposit_percent}%`],
              ['Min Notice', `${bakery.min_notice_hours} hours`],
              ['Delivery', bakery.delivery_option],
            ].map(([label, value], i) => (
              <div key={i} className="flex gap-4">
                <span className="text-zuki-muted w-32 shrink-0">{label}</span>
                <span className="font-medium text-zuki-charcoal">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl border border-zuki-border p-5">
          <h2 className="font-display font-bold text-zuki-charcoal mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            {bakery.status === 'pending' && (
              <form action={approveBakery}>
                <button type="submit"
                  className="px-5 py-2.5 bg-zuki-success text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                  ✓ Approve Bakery
                </button>
              </form>
            )}
            {bakery.status === 'approved' && (
              <form action={suspendBakery}>
                <button type="submit"
                  className="px-5 py-2.5 bg-zuki-error text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                  ✗ Suspend Bakery
                </button>
              </form>
            )}
            {bakery.status === 'suspended' && (
              <form action={reactivateBakery}>
                <button type="submit"
                  className="px-5 py-2.5 bg-zuki-success text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                  ↺ Reactivate Bakery
                </button>
              </form>
            )}
            {bakery.status === 'approved' && (
              <a href={`/bakery/${bakery.slug}`} target="_blank" rel="noopener noreferrer"
                className="px-5 py-2.5 border border-zuki-border text-zuki-charcoal rounded-xl text-sm font-medium hover:bg-zuki-cream transition-colors">
                View Storefront →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
