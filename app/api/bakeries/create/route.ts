import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateSlug } from '@/lib/utils'

export async function POST(req: NextRequest) {
  // Verify the user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const slug = generateSlug(body.name)

  // Use admin client to bypass RLS for insert
  const adminClient = createAdminClient()

  // Check if slug already exists
  const { data: existing } = await adminClient
    .from('bakeries')
    .select('id')
    .eq('slug', slug)
    .single()

  const finalSlug = existing ? `${slug}-${Date.now()}` : slug

  const { data, error } = await adminClient.from('bakeries').insert({
    owner_id: user.id,
    name: body.name,
    description: body.description || null,
    logo_url: body.logo_url || null,
    cover_url: body.cover_url || null,
    whatsapp_number: body.whatsapp_number || null,
    deposit_percent: body.deposit_percent ?? 50,
    min_notice_hours: body.min_notice_hours ?? 48,
    rush_order_enabled: body.rush_order_enabled ?? false,
    rush_fee_zmw: body.rush_fee_zmw ?? 0,
    delivery_option: body.delivery_option ?? 'pickup',
    delivery_fee_zmw: body.delivery_fee_zmw ?? 0,
    max_orders_per_day: body.max_orders_per_day ?? 10,
    refund_policy_enabled: body.refund_policy_enabled ?? false,
    refund_policy_text: body.refund_policy_text || null,
    accepts_airtel: body.accepts_airtel ?? true,
    accepts_mtn: body.accepts_mtn ?? true,
    accepts_zamtel: body.accepts_zamtel ?? false,
    accepts_bank: body.accepts_bank ?? false,
    airtel_number: body.airtel_number || null,
    mtn_number: body.mtn_number || null,
    zamtel_number: body.zamtel_number || null,
    bank_name: body.bank_name || null,
    bank_account_name: body.bank_account_name || null,
    bank_account_number: body.bank_account_number || null,
    slug: finalSlug,
    status: 'pending',
  }).select('id').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ id: data.id, slug: finalSlug })
}
