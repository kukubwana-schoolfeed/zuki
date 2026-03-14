'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ZukiBadge } from '@/components/zuki/ZukiBadge'
import { ZukiStepper } from '@/components/zuki/ZukiStepper'
import { ZukiButton } from '@/components/zuki/ZukiButton'
import { ZukiSkeleton } from '@/components/zuki/ZukiSkeleton'
import { OrderChat } from '@/components/chat/OrderChat'
import { WhatsAppRedirect } from '@/components/chat/WhatsAppRedirect'
import { AIBubble } from '@/components/zuki/AIBubble'
import { formatZMW, PAYMENT_METHOD_LABELS } from '@/lib/utils'
import { format } from 'date-fns'
import { ArrowLeft, Check, X, Clock } from 'lucide-react'
import Link from 'next/link'
import type { OrderStatus } from '@/types'

export default function BakerOrderDetail() {
  const params = useParams()
  const orderId = params.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)
  const [bakery, setBakery] = useState<any>(null)
  const [client, setClient] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [userId, setUserId] = useState('')
  const [updating, setUpdating] = useState(false)
  const [pickupTime, setPickupTime] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [showCancel, setShowCancel] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: bakeryData } = await supabase.from('bakeries').select('*').eq('owner_id', user.id).single()
      if (!bakeryData) return
      setBakery(bakeryData)

      const { data: orderData } = await supabase
        .from('orders').select('*, menu_items(name)').eq('id', orderId).eq('bakery_id', bakeryData.id).single()
      if (!orderData) return
      setOrder(orderData)

      const { data: clientData } = await supabase
        .from('profiles').select('full_name, phone, avatar_url').eq('id', orderData.client_id).single()
      setClient(clientData)

      const { data: paymentsData } = await supabase
        .from('payments').select('*').eq('order_id', orderId).order('created_at', { ascending: false })
      setPayments(paymentsData || [])
      setLoading(false)
    }
    load()

    const channel = supabase.channel(`baker-order-${orderId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        payload => setOrder(payload.new))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [orderId, supabase])

  async function updateStatus(status: OrderStatus) {
    setUpdating(true)
    await fetch('/api/orders/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        status,
        pickupTime: pickupTime || undefined,
        cancellationReason: cancelReason || undefined,
      }),
    })
    setOrder((prev: any) => ({ ...prev, status, pickup_time: pickupTime || prev.pickup_time }))
    setUpdating(false)
    setShowCancel(false)
  }

  async function confirmPayment(paymentId: string) {
    setUpdating(true)
    await fetch('/api/payments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, orderId }),
    })
    setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'confirmed', confirmed_at: new Date().toISOString() } : p))
    setUpdating(false)
  }

  if (loading) {
    return <div className="p-6 space-y-4"><ZukiSkeleton className="h-48" /><ZukiSkeleton className="h-64" /></div>
  }
  if (!order) return <div className="p-6 text-center text-zuki-muted">Order not found</div>

  const proofPayment = payments.find(p => p.status === 'proof_submitted')
  const confirmedPayment = payments.find(p => p.status === 'confirmed')

  const nextStatusMap: Record<string, OrderStatus> = {
    pending: 'confirmed',
    confirmed: 'in_progress',
    in_progress: 'ready',
    ready: 'collected',
  }
  const nextStatus = nextStatusMap[order.status]

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/baker/orders" className="p-2 rounded-xl hover:bg-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <p className="text-xs font-medium text-zuki-pink">{order.order_number}</p>
          <h1 className="font-display text-2xl font-bold text-zuki-charcoal">{client?.full_name}</h1>
        </div>
        <ZukiBadge status={order.status} />
      </div>

      {/* Status control */}
      <div className="bg-white rounded-2xl border border-zuki-border p-5">
        <h2 className="font-display font-bold text-zuki-charcoal mb-4">Order Status</h2>
        <ZukiStepper status={order.status} />

        {order.status !== 'collected' && order.status !== 'cancelled' && (
          <div className="mt-5 space-y-3">
            {order.status === 'pending' && (
              <div>
                <label className="block text-sm font-medium text-zuki-charcoal mb-2">
                  <Clock className="w-4 h-4 inline mr-1" /> Set Pickup Time
                </label>
                <input type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 mb-3" />
              </div>
            )}

            <div className="flex gap-3">
              {nextStatus && (
                <ZukiButton onClick={() => updateStatus(nextStatus)} loading={updating} className="flex-1">
                  <Check className="w-4 h-4 mr-2" />
                  Mark as {nextStatus.replace('_', ' ')}
                </ZukiButton>
              )}
              {order.status !== 'cancelled' && (
                <ZukiButton variant="danger" size="md" onClick={() => setShowCancel(!showCancel)} className="flex-1">
                  <X className="w-4 h-4 mr-2" /> Cancel Order
                </ZukiButton>
              )}
            </div>

            {showCancel && (
              <div className="space-y-2">
                <input type="text" value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                  placeholder="Reason for cancellation (required)"
                  className="w-full px-4 py-2 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
                <ZukiButton variant="danger" onClick={() => cancelReason && updateStatus('cancelled')} loading={updating} className="w-full">
                  Confirm Cancellation
                </ZukiButton>
              </div>
            )}
          </div>
        )}

        {order.pickup_time && (
          <div className="mt-3 bg-zuki-pink/10 rounded-xl p-3">
            <p className="text-sm font-medium text-zuki-charcoal">Pickup time: {order.pickup_time}</p>
          </div>
        )}
      </div>

      {/* Order details */}
      <div className="bg-white rounded-2xl border border-zuki-border p-5">
        <h2 className="font-display font-bold text-zuki-charcoal mb-4">Order Details</h2>
        <div className="space-y-2 text-sm">
          {[
            ['Item', (order.menu_items as any)?.name],
            order.selected_flavor && ['Flavour', order.selected_flavor],
            order.selected_filling && ['Filling', order.selected_filling],
            order.selected_frosting && ['Frosting', order.selected_frosting],
            order.selected_size && ['Size', order.selected_size],
            order.selected_tiers && ['Tiers', order.selected_tiers],
            order.occasion && ['Occasion', order.occasion],
            order.dedication_message && ['Cake message', order.dedication_message],
            ['Collection', order.pickup_or_delivery],
            order.delivery_address && ['Address', order.delivery_address],
            ['Date', format(new Date(order.requested_date), 'dd MMM yyyy')],
            order.is_rush_order && ['Rush order', 'Yes'],
          ].filter(Boolean).map((row: any, i) => (
            <div key={i} className="flex justify-between gap-4">
              <span className="text-zuki-muted shrink-0">{row[0]}</span>
              <span className="font-medium text-right">{row[1]}</span>
            </div>
          ))}
          {order.custom_description && (
            <div className="pt-2 border-t border-zuki-border">
              <p className="text-zuki-muted text-xs mb-1">Design description</p>
              <p>{order.custom_description}</p>
            </div>
          )}
          {order.special_instructions && (
            <div className="pt-2">
              <p className="text-zuki-muted text-xs mb-1">Special instructions</p>
              <p>{order.special_instructions}</p>
            </div>
          )}
        </div>

        <div className="border-t border-zuki-border pt-3 mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-zuki-muted">Base</span><span>{formatZMW(order.base_price_zmw)}</span></div>
          {order.rush_fee_zmw > 0 && <div className="flex justify-between"><span className="text-zuki-muted">Rush</span><span>{formatZMW(order.rush_fee_zmw)}</span></div>}
          {order.delivery_fee_zmw > 0 && <div className="flex justify-between"><span className="text-zuki-muted">Delivery</span><span>{formatZMW(order.delivery_fee_zmw)}</span></div>}
          <div className="flex justify-between font-bold text-base border-t border-zuki-border pt-1.5">
            <span>Total</span><span>{formatZMW(order.total_price_zmw)}</span>
          </div>
          <div className="flex justify-between text-zuki-muted"><span>Deposit</span><span>{formatZMW(order.deposit_amount_zmw)}</span></div>
          <div className="flex justify-between text-zuki-muted"><span>Balance</span><span>{formatZMW(order.balance_amount_zmw)}</span></div>
        </div>
      </div>

      {/* Client info */}
      <div className="bg-white rounded-2xl border border-zuki-border p-5">
        <h2 className="font-display font-bold text-zuki-charcoal mb-3">Client</h2>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zuki-pink flex items-center justify-center text-white font-bold">
            {client?.full_name?.charAt(0) || 'C'}
          </div>
          <div>
            <p className="font-medium text-zuki-charcoal">{client?.full_name}</p>
            {client?.phone && <p className="text-sm text-zuki-muted">{client.phone}</p>}
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="bg-white rounded-2xl border border-zuki-border p-5">
        <h2 className="font-display font-bold text-zuki-charcoal mb-4">Payment</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-zuki-muted">No payment submitted yet</p>
        ) : payments.map(payment => (
          <div key={payment.id} className="mb-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-zuki-charcoal">
                  {formatZMW(payment.amount_zmw)} via {PAYMENT_METHOD_LABELS[payment.method] || payment.method}
                </p>
                {payment.transaction_reference && (
                  <p className="text-xs text-zuki-muted mt-0.5">Ref: {payment.transaction_reference}</p>
                )}
                <p className={`text-xs mt-1 font-medium ${
                  payment.status === 'confirmed' ? 'text-zuki-success'
                  : payment.status === 'proof_submitted' ? 'text-yellow-600'
                  : 'text-zuki-muted'
                }`}>
                  {payment.status === 'confirmed' ? '✓ Confirmed'
                    : payment.status === 'proof_submitted' ? '⏳ Awaiting your confirmation'
                    : 'Pending'}
                </p>
              </div>
              {payment.status === 'proof_submitted' && (
                <ZukiButton size="sm" onClick={() => confirmPayment(payment.id)} loading={updating}>
                  <Check className="w-3 h-3 mr-1" /> Confirm
                </ZukiButton>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* WhatsApp */}
      {bakery?.whatsapp_number && (
        <div className="bg-white rounded-2xl border border-zuki-border p-5">
          <h2 className="font-display font-bold text-zuki-charcoal mb-3">Reference Photos</h2>
          <WhatsAppRedirect whatsappNumber={bakery.whatsapp_number} orderNumber={order.order_number} />
        </div>
      )}

      {/* Chat */}
      <div className="bg-white rounded-2xl border border-zuki-border overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h2 className="font-display font-bold text-zuki-charcoal">Chat with Client</h2>
        </div>
        <div className="px-5 pb-5">
          <OrderChat orderId={orderId} currentUserId={userId} />
        </div>
      </div>

      <AIBubble context={`Baker managing order ${order.order_number}. Status: ${order.status}. Total: ${formatZMW(order.total_price_zmw)}.`} />
    </div>
  )
}
