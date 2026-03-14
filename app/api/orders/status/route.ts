import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/types'

const NOTIFS: Record<OrderStatus, { title: string; body: (n: string) => string }> = {
  confirmed:   { title: '🎂 Order Confirmed!',     body: n => `Order ${n} has been confirmed by your baker.` },
  in_progress: { title: '👩‍🍳 Baking has started!',  body: n => `Your baker has started creating order ${n}.` },
  ready:       { title: '✅ Your order is ready!',  body: n => `Order ${n} is ready for collection!` },
  collected:   { title: '🎉 Order complete!',       body: n => `Order ${n} collected. Leave a review!` },
  cancelled:   { title: 'Order Cancelled',          body: n => `Order ${n} has been cancelled.` },
  pending:     { title: 'Order Received',           body: n => `Order ${n} has been received.` },
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId, status, pickupTime, cancellationReason } = await req.json()

  const updateData: Record<string, unknown> = { status }
  if (pickupTime) updateData.pickup_time = pickupTime
  if (status === 'confirmed') updateData.confirmed_at = new Date().toISOString()
  if (status === 'ready') updateData.ready_at = new Date().toISOString()
  if (status === 'collected') updateData.collected_at = new Date().toISOString()
  if (status === 'cancelled') {
    updateData.cancelled_at = new Date().toISOString()
    updateData.cancellation_reason = cancellationReason
  }

  const { data: order, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select('client_id, order_number, bakery_id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (order) {
    const notif = NOTIFS[status as OrderStatus]
    if (notif) {
      await supabase.from('notifications').insert({
        user_id: order.client_id,
        title: notif.title,
        body: notif.body(order.order_number),
        link: `/dashboard/orders/${orderId}`,
      })
    }
  }

  return NextResponse.json({ success: true })
}
