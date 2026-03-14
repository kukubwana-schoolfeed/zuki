import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId } = await req.json()

  const { data: order } = await supabase
    .from('orders')
    .select('*, menu_items(name), profiles:client_id(full_name, phone)')
    .eq('id', orderId)
    .single()

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const { data: bakery } = await supabase
    .from('bakeries')
    .select('name, whatsapp_number')
    .eq('id', order.bakery_id)
    .single()

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('order_id', orderId)

  // Return order data — PDF generation happens client-side
  return NextResponse.json({ order, bakery, payments })
}
