'use client'
import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ZukiBadge } from '@/components/zuki/ZukiBadge'
import { ZukiStepper } from '@/components/zuki/ZukiStepper'
import { ZukiButton } from '@/components/zuki/ZukiButton'
import { ZukiSkeleton } from '@/components/zuki/ZukiSkeleton'
import { OrderChat } from '@/components/chat/OrderChat'
import { WhatsAppRedirect } from '@/components/chat/WhatsAppRedirect'
import { AIBubble } from '@/components/zuki/AIBubble'
import { formatZMW, PAYMENT_METHOD_LABELS } from '@/lib/utils'
import { getPaymentInstructions } from '@/lib/payments'
import { format } from 'date-fns'
import { ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'

export default function OrderDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const orderId = params.id as string
  const isSuccess = searchParams.get('success') === 'true'

  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)
  const [bakery, setBakery] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [userId, setUserId] = useState<string>('')
  const [submittingRef, setSubmittingRef] = useState(false)
  const [transactionRef, setTransactionRef] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('airtel')
  const supabase = createClient()

  useEffect(() => {
    async function loadOrder() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: orderData } = await supabase
        .from('orders')
        .select('*, menu_items(name)')
        .eq('id', orderId)
        .eq('client_id', user.id)
        .single()

      if (!orderData) return
      setOrder(orderData)

      const { data: bakeryData } = await supabase
        .from('bakeries')
        .select('*')
        .eq('id', orderData.bakery_id)
        .single()
      setBakery(bakeryData)

      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
      setPayments(paymentsData || [])

      setLoading(false)
    }
    loadOrder()
  }, [orderId, supabase])

  async function submitPaymentRef() {
    if (!transactionRef.trim()) return
    setSubmittingRef(true)

    const existingPayment = payments.find(p => p.status === 'pending')
    if (existingPayment) {
      await supabase.from('payments').update({
        transaction_reference: transactionRef,
        status: 'proof_submitted',
        method: paymentMethod,
      }).eq('id', existingPayment.id)
    } else {
      await supabase.from('payments').insert({
        order_id: orderId,
        payment_type: 'deposit',
        method: paymentMethod,
        amount_zmw: order.deposit_amount_zmw,
        status: 'proof_submitted',
        transaction_reference: transactionRef,
      })
    }

    const { data: updated } = await supabase
      .from('payments').select('*').eq('order_id', orderId)
      .order('created_at', { ascending: false })
    setPayments(updated || [])
    setTransactionRef('')
    setSubmittingRef(false)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <ZukiSkeleton className="h-8 w-40" />
        <ZukiSkeleton className="h-48 w-full" />
        <ZukiSkeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!order) {
    return <div className="text-center py-20 text-zuki-muted">Order not found</div>
  }

  const confirmedPayment = payments.find(p => p.status === 'confirmed')
  const pendingPayment = payments.find(p => p.status === 'proof_submitted' || p.status === 'pending')
  const paymentInstructions = bakery ? getPaymentInstructions(paymentMethod, bakery) : null

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-zuki-success rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-medium text-green-800">Order placed successfully!</p>
            <p className="text-sm text-green-700">Your baker will confirm soon.</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="p-2 rounded-xl hover:bg-white transition-colors">
          <ArrowLeft className="w-5 h-5 text-zuki-charcoal" />
        </Link>
        <div>
          <p className="text-xs font-medium text-zuki-pink">{order.order_number}</p>
          <h1 className="font-display text-2xl font-bold text-zuki-charcoal">{bakery?.name}</h1>
        </div>
        <div className="ml-auto">
          <ZukiBadge status={order.status} />
        </div>
      </div>

      {/* Status Stepper */}
      <div className="bg-white rounded-2xl border border-zuki-border p-5">
        <h2 className="font-display font-bold text-zuki-charcoal mb-4">Order Status</h2>
        <ZukiStepper status={order.status} />
        {order.pickup_time && order.status !== 'collected' && (
          <div className="mt-4 bg-zuki-pink/10 rounded-xl p-3">
            <p className="text-sm font-medium text-zuki-charcoal">
              🕐 Pickup time: <span className="text-zuki-pink">{order.pickup_time}</span>
            </p>
          </div>
        )}
        {order.cancellation_reason && (
          <div className="mt-4 bg-red-50 rounded-xl p-3">
            <p className="text-sm text-red-600">Reason: {order.cancellation_reason}</p>
          </div>
        )}
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-2xl border border-zuki-border p-5">
        <h2 className="font-display font-bold text-zuki-charcoal mb-4">Order Details</h2>
        <div className="space-y-2 text-sm">
          {[
            ['Item', order.menu_items?.name],
            order.selected_flavor && ['Flavour', order.selected_flavor],
            order.selected_filling && ['Filling', order.selected_filling],
            order.selected_frosting && ['Frosting', order.selected_frosting],
            order.selected_size && ['Size', order.selected_size],
            order.selected_tiers && ['Tiers', order.selected_tiers],
            order.occasion && ['Occasion', order.occasion],
            order.dedication_message && ['Message on cake', order.dedication_message],
            ['Collection', order.pickup_or_delivery === 'delivery' ? 'Delivery' : 'Pickup'],
            order.delivery_address && ['Delivery address', order.delivery_address],
            ['Date', format(new Date(order.requested_date), 'dd MMM yyyy')],
          ].filter(Boolean).map((row, i) => (
            <div key={i} className="flex justify-between gap-4">
              <span className="text-zuki-muted shrink-0">{row![0]}</span>
              <span className="font-medium text-right">{row![1]}</span>
            </div>
          ))}
          {order.custom_description && (
            <div className="pt-2 border-t border-zuki-border">
              <p className="text-zuki-muted text-xs mb-1">Cake description</p>
              <p className="text-sm">{order.custom_description}</p>
            </div>
          )}
          {order.special_instructions && (
            <div className="pt-2">
              <p className="text-zuki-muted text-xs mb-1">Special instructions</p>
              <p className="text-sm">{order.special_instructions}</p>
            </div>
          )}
        </div>

        <div className="border-t border-zuki-border pt-3 mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-zuki-muted">Base price</span><span>{formatZMW(order.base_price_zmw)}</span></div>
          {order.rush_fee_zmw > 0 && <div className="flex justify-between"><span className="text-zuki-muted">Rush fee</span><span>{formatZMW(order.rush_fee_zmw)}</span></div>}
          {order.delivery_fee_zmw > 0 && <div className="flex justify-between"><span className="text-zuki-muted">Delivery fee</span><span>{formatZMW(order.delivery_fee_zmw)}</span></div>}
          <div className="flex justify-between font-bold text-base border-t border-zuki-border pt-1.5">
            <span>Total</span><span>{formatZMW(order.total_price_zmw)}</span>
          </div>
          <div className="flex justify-between text-zuki-muted"><span>Deposit</span><span>{formatZMW(order.deposit_amount_zmw)}</span></div>
          <div className="flex justify-between text-zuki-muted"><span>Balance at collection</span><span>{formatZMW(order.balance_amount_zmw)}</span></div>
        </div>
      </div>

      {/* Payment Section */}
      {!confirmedPayment && (
        <div className="bg-white rounded-2xl border border-zuki-border p-5">
          <h2 className="font-display font-bold text-zuki-charcoal mb-4">Payment</h2>

          {pendingPayment ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm font-medium text-yellow-800">Payment reference submitted</p>
              <p className="text-xs text-yellow-700 mt-1">Reference: {pendingPayment.transaction_reference}</p>
              <p className="text-xs text-yellow-700">Awaiting baker confirmation...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { key: 'airtel', label: 'Airtel Money', enabled: bakery?.accepts_airtel },
                  { key: 'mtn', label: 'MTN MoMo', enabled: bakery?.accepts_mtn },
                  { key: 'zamtel', label: 'Zamtel', enabled: bakery?.accepts_zamtel },
                  { key: 'bank_transfer', label: 'Bank Transfer', enabled: bakery?.accepts_bank },
                ].filter(m => m.enabled).map(method => (
                  <button key={method.key} type="button"
                    onClick={() => setPaymentMethod(method.key)}
                    className={`p-2 rounded-xl border-2 text-xs font-medium transition-all ${
                      paymentMethod === method.key
                        ? 'border-zuki-pink bg-zuki-pink/5 text-zuki-pink'
                        : 'border-zuki-border text-zuki-muted'
                    }`}>
                    {method.label}
                  </button>
                ))}
              </div>

              {paymentInstructions && (
                <div className="bg-zuki-cream rounded-xl p-3 mb-4">
                  <p className="text-sm font-medium text-zuki-charcoal mb-2">Send {formatZMW(order.deposit_amount_zmw)} via {paymentInstructions.title}</p>
                  {paymentInstructions.instructions.slice(0, 2).map((inst, i) => (
                    <p key={i} className="text-xs text-zuki-muted">{inst}</p>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <input
                  type="text"
                  value={transactionRef}
                  onChange={e => setTransactionRef(e.target.value)}
                  placeholder="Transaction reference number"
                  className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30"
                />
                <ZukiButton onClick={submitPaymentRef} loading={submittingRef} className="w-full">
                  Submit Payment Reference
                </ZukiButton>
              </div>
            </>
          )}
        </div>
      )}

      {confirmedPayment && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-zuki-success" />
          <div>
            <p className="text-sm font-medium text-green-800">Deposit confirmed!</p>
            <p className="text-xs text-green-700">{formatZMW(confirmedPayment.amount_zmw)} via {PAYMENT_METHOD_LABELS[confirmedPayment.method]}</p>
          </div>
        </div>
      )}

      {/* WhatsApp + Chat */}
      {bakery?.whatsapp_number && (
        <div className="bg-white rounded-2xl border border-zuki-border p-5">
          <p className="text-sm font-medium text-zuki-charcoal mb-3">Share reference photos</p>
          <WhatsAppRedirect whatsappNumber={bakery.whatsapp_number} orderNumber={order.order_number} />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-zuki-border overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h2 className="font-display font-bold text-zuki-charcoal">Chat with Baker</h2>
        </div>
        <div className="px-5 pb-5">
          <OrderChat orderId={orderId} currentUserId={userId} />
        </div>
      </div>

      <AIBubble context={`Viewing order ${order.order_number} from ${bakery?.name}. Status: ${order.status}. Total: ${formatZMW(order.total_price_zmw)}.`} />
    </div>
  )
}
