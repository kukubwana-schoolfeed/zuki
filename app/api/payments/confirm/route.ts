import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { paymentId, orderId } = await req.json()

  const { error } = await supabase.from('payments').update({
    status: 'confirmed',
    confirmed_by: user.id,
    confirmed_at: new Date().toISOString(),
  }).eq('id', paymentId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: order } = await supabase
    .from('orders')
    .select('client_id, order_number')
    .eq('id', orderId)
    .single()

  if (order) {
    await supabase.from('notifications').insert({
      user_id: order.client_id,
      title: '✅ Payment Confirmed',
      body: `Your payment for order ${order.order_number} has been confirmed by your baker.`,
      link: `/dashboard/orders/${orderId}`,
    })
  }

  return NextResponse.json({ success: true })
}
