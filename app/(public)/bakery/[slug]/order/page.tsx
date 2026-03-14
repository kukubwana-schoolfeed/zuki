'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { ZukiButton } from '@/components/zuki/ZukiButton'
import { formatZMW, OCCASIONS, PAYMENT_METHOD_LABELS } from '@/lib/utils'
import { getPaymentInstructions } from '@/lib/payments'
import { ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react'
import type { Bakery, MenuItem } from '@/types'
import { format, addHours, addDays } from 'date-fns'

interface OrderFormData {
  // Step 1
  menuItemId: string
  selectedFlavor: string
  selectedFilling: string
  selectedFrosting: string
  selectedSize: string
  selectedTiers: string
  customDescription: string
  specialInstructions: string
  occasion: string
  dedicationMessage: string
  // Step 2
  pickupOrDelivery: 'pickup' | 'delivery'
  deliveryAddress: string
  requestedDate: string
  isRushOrder: boolean
  // Step 3
  paymentMethod: string
  transactionReference: string
}

export default function OrderPage({ params }: { params: { slug: string } }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [bakery, setBakery] = useState<Bakery | null>(null)
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  const [form, setForm] = useState<OrderFormData>({
    menuItemId: searchParams.get('item') || '',
    selectedFlavor: '',
    selectedFilling: '',
    selectedFrosting: '',
    selectedSize: '',
    selectedTiers: '',
    customDescription: '',
    specialInstructions: '',
    occasion: '',
    dedicationMessage: '',
    pickupOrDelivery: 'pickup',
    deliveryAddress: '',
    requestedDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    isRushOrder: false,
    paymentMethod: '',
    transactionReference: '',
  })

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/sign-in?next=/bakery/${params.slug}/order`)
        return
      }
      setUserId(user.id)

      const { data: bakeryData } = await supabase
        .from('bakeries')
        .select('*')
        .eq('slug', params.slug)
        .eq('status', 'approved')
        .single()

      if (!bakeryData) { router.push('/bakeries'); return }
      setBakery(bakeryData)

      // Set default payment method
      const defaultMethod = bakeryData.accepts_airtel ? 'airtel'
        : bakeryData.accepts_mtn ? 'mtn'
        : bakeryData.accepts_zamtel ? 'zamtel'
        : bakeryData.accepts_bank ? 'bank_transfer' : ''

      setForm(prev => ({
        ...prev,
        pickupOrDelivery: bakeryData.delivery_option === 'delivery' ? 'delivery' : 'pickup',
        paymentMethod: defaultMethod,
        requestedDate: format(addHours(new Date(), bakeryData.min_notice_hours || 48), 'yyyy-MM-dd'),
      }))

      if (form.menuItemId) {
        const { data: item } = await supabase
          .from('menu_items')
          .select('*')
          .eq('id', form.menuItemId)
          .single()
        if (item) setMenuItem(item)
      } else {
        // Load first available menu item
        const { data: items } = await supabase
          .from('menu_items')
          .select('*')
          .eq('bakery_id', bakeryData.id)
          .eq('is_available', true)
          .limit(1)
        if (items && items[0]) {
          setMenuItem(items[0])
          setForm(prev => ({ ...prev, menuItemId: items[0].id }))
        }
      }

      setLoading(false)
    }
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug])

  const basePrice = menuItem?.base_price_zmw || 0
  const rushFee = form.isRushOrder ? (bakery?.rush_fee_zmw || 0) : 0
  const deliveryFee = form.pickupOrDelivery === 'delivery' ? (bakery?.delivery_fee_zmw || 0) : 0
  const total = basePrice + rushFee + deliveryFee
  const deposit = Math.ceil(total * ((bakery?.deposit_percent || 50) / 100))
  const balance = total - deposit

  async function submitOrder() {
    if (!bakery || !menuItem || !userId) return
    setSubmitting(true)
    setError('')

    try {
      // Get order count for number generation
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('bakery_id', bakery.id)

      const orderNum = `ZUKI-${String((count || 0) + 1).padStart(4, '0')}`

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNum,
          bakery_id: bakery.id,
          client_id: userId,
          menu_item_id: menuItem.id,
          selected_flavor: form.selectedFlavor || null,
          selected_filling: form.selectedFilling || null,
          selected_frosting: form.selectedFrosting || null,
          selected_size: form.selectedSize || null,
          selected_tiers: form.selectedTiers || null,
          custom_description: form.customDescription || null,
          special_instructions: form.specialInstructions || null,
          occasion: form.occasion || null,
          dedication_message: form.dedicationMessage || null,
          pickup_or_delivery: form.pickupOrDelivery,
          delivery_address: form.pickupOrDelivery === 'delivery' ? form.deliveryAddress : null,
          requested_date: form.requestedDate,
          is_rush_order: form.isRushOrder,
          base_price_zmw: basePrice,
          rush_fee_zmw: rushFee,
          delivery_fee_zmw: deliveryFee,
          total_price_zmw: total,
          deposit_amount_zmw: deposit,
          balance_amount_zmw: balance,
          status: 'pending',
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create payment record
      await supabase.from('payments').insert({
        order_id: order.id,
        payment_type: 'deposit',
        method: form.paymentMethod,
        amount_zmw: deposit,
        status: form.transactionReference ? 'proof_submitted' : 'pending',
        transaction_reference: form.transactionReference || null,
      })

      // Notify baker
      await supabase.from('notifications').insert({
        user_id: bakery.owner_id,
        title: '🎂 New Order!',
        body: `New order ${orderNum} received. Check your dashboard.`,
        link: `/baker/orders/${order.id}`,
      })

      router.push(`/dashboard/orders/${order.id}?success=true`)
    } catch (err) {
      setError('Failed to place order. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zuki-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-zuki-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zuki-muted">Loading order form...</p>
        </div>
      </div>
    )
  }

  if (!bakery || !menuItem) {
    return (
      <div className="min-h-screen bg-zuki-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-zuki-muted mb-4">No menu items available.</p>
          <button onClick={() => router.back()} className="text-zuki-pink">← Go back</button>
        </div>
      </div>
    )
  }

  const paymentInstructions = bakery ? getPaymentInstructions(form.paymentMethod, bakery) : null

  return (
    <div className="min-h-screen bg-zuki-cream py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="p-2 rounded-xl hover:bg-white transition-colors">
            <ArrowLeft className="w-5 h-5 text-zuki-charcoal" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-zuki-charcoal">Place Your Order</h1>
            <p className="text-zuki-muted text-sm">{bakery.name}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {['Customise', 'Delivery & Date', 'Review & Pay'].map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i + 1 < step ? 'bg-zuki-success text-white'
                : i + 1 === step ? 'bg-zuki-pink text-white'
                : 'bg-white border border-zuki-border text-zuki-muted'
              }`}>
                {i + 1 < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i + 1 === step ? 'text-zuki-pink' : 'text-zuki-muted'}`}>{label}</span>
              {i < 2 && <div className={`h-0.5 flex-1 ${i + 1 < step ? 'bg-zuki-success' : 'bg-zuki-border'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Customise */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="bg-white rounded-2xl border border-zuki-border p-5">
                <h2 className="font-display font-bold text-zuki-charcoal mb-4">Ordering: {menuItem.name}</h2>
                <p className="text-zuki-muted text-sm mb-5">Starting from {formatZMW(menuItem.base_price_zmw)}</p>

                {menuItem.flavor_options?.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-zuki-charcoal mb-2">Flavour</label>
                    <select value={form.selectedFlavor} onChange={e => setForm(p => ({ ...p, selectedFlavor: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 text-sm">
                      <option value="">Select flavour</option>
                      {menuItem.flavor_options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                )}

                {menuItem.filling_options?.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-zuki-charcoal mb-2">Filling</label>
                    <select value={form.selectedFilling} onChange={e => setForm(p => ({ ...p, selectedFilling: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 text-sm">
                      <option value="">Select filling</option>
                      {menuItem.filling_options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                )}

                {menuItem.frosting_options?.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-zuki-charcoal mb-2">Frosting</label>
                    <select value={form.selectedFrosting} onChange={e => setForm(p => ({ ...p, selectedFrosting: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 text-sm">
                      <option value="">Select frosting</option>
                      {menuItem.frosting_options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                )}

                {menuItem.size_options?.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-zuki-charcoal mb-2">Size</label>
                    <select value={form.selectedSize} onChange={e => setForm(p => ({ ...p, selectedSize: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 text-sm">
                      <option value="">Select size</option>
                      {menuItem.size_options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                )}

                {menuItem.tier_options?.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-zuki-charcoal mb-2">Tiers</label>
                    <select value={form.selectedTiers} onChange={e => setForm(p => ({ ...p, selectedTiers: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 text-sm">
                      <option value="">Select tiers</option>
                      {menuItem.tier_options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-zuki-charcoal mb-2">Describe your cake design</label>
                  <textarea
                    value={form.customDescription}
                    onChange={e => setForm(p => ({ ...p, customDescription: e.target.value }))}
                    placeholder="Tell the baker exactly how you want your cake to look. Include colours, decorations, style, etc."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-zuki-border bg-zuki-cream focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 text-sm resize-none"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-zuki-charcoal mb-2">Occasion</label>
                  <select value={form.occasion} onChange={e => setForm(p => ({ ...p, occasion: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 text-sm">
                    <option value="">Select occasion</option>
                    {OCCASIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-zuki-charcoal mb-2">Message on the cake</label>
                  <input
                    type="text"
                    value={form.dedicationMessage}
                    onChange={e => setForm(p => ({ ...p, dedicationMessage: e.target.value }))}
                    placeholder="e.g. Happy Birthday Sarah! 🎉"
                    className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zuki-charcoal mb-2">Special instructions</label>
                  <textarea
                    value={form.specialInstructions}
                    onChange={e => setForm(p => ({ ...p, specialInstructions: e.target.value }))}
                    placeholder="Allergies, dietary requirements, or any other instructions..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-zuki-border bg-zuki-cream focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 text-sm resize-none"
                  />
                </div>
              </div>

              <ZukiButton onClick={() => setStep(2)} className="w-full">
                Next: Delivery & Date <ArrowRight className="w-4 h-4 ml-2" />
              </ZukiButton>
            </motion.div>
          )}

          {/* Step 2: Delivery & Date */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="bg-white rounded-2xl border border-zuki-border p-5">
                <h2 className="font-display font-bold text-zuki-charcoal mb-4">Delivery & Collection</h2>

                {bakery.delivery_option === 'both' && (
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {['pickup', 'delivery'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, pickupOrDelivery: opt as 'pickup' | 'delivery' }))}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          form.pickupOrDelivery === opt
                            ? 'border-zuki-pink bg-zuki-pink/5 text-zuki-pink'
                            : 'border-zuki-border text-zuki-muted hover:border-zuki-pink/50'
                        }`}
                      >
                        {opt === 'pickup' ? '🏪 Pickup' : '🚗 Delivery'}
                      </button>
                    ))}
                  </div>
                )}

                {form.pickupOrDelivery === 'delivery' && (
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-zuki-charcoal mb-2">Delivery Address</label>
                    <textarea
                      value={form.deliveryAddress}
                      onChange={e => setForm(p => ({ ...p, deliveryAddress: e.target.value }))}
                      required
                      placeholder="Full delivery address"
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-zuki-border bg-zuki-cream focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 text-sm resize-none"
                    />
                    {bakery.delivery_fee_zmw > 0 && (
                      <p className="text-xs text-zuki-muted mt-1">Delivery fee: {formatZMW(bakery.delivery_fee_zmw)}</p>
                    )}
                  </div>
                )}

                <div className="mb-5">
                  <label className="block text-sm font-medium text-zuki-charcoal mb-2">Requested Date</label>
                  <input
                    type="date"
                    value={form.requestedDate}
                    onChange={e => setForm(p => ({ ...p, requestedDate: e.target.value }))}
                    min={format(addHours(new Date(), bakery.min_notice_hours || 48), 'yyyy-MM-dd')}
                    className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 text-sm"
                  />
                  <p className="text-xs text-zuki-muted mt-1">Minimum {bakery.min_notice_hours}h notice required</p>
                </div>

                {bakery.rush_order_enabled && (
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isRushOrder}
                      onChange={e => setForm(p => ({ ...p, isRushOrder: e.target.checked }))}
                      className="mt-0.5 w-4 h-4 accent-zuki-pink"
                    />
                    <div>
                      <p className="text-sm font-medium text-zuki-charcoal">Rush Order</p>
                      <p className="text-xs text-zuki-muted">Priority processing — additional fee of {formatZMW(bakery.rush_fee_zmw)}</p>
                    </div>
                  </label>
                )}
              </div>

              {bakery.refund_policy_enabled && bakery.refund_policy_text && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 mb-1">Refund Policy</p>
                      <p className="text-xs text-yellow-700">{bakery.refund_policy_text}</p>
                    </div>
                  </div>
                </div>
              )}

              <ZukiButton onClick={() => setStep(3)} className="w-full">
                Next: Review & Pay <ArrowRight className="w-4 h-4 ml-2" />
              </ZukiButton>
            </motion.div>
          )}

          {/* Step 3: Review & Pay */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              {/* Order Summary */}
              <div className="bg-white rounded-2xl border border-zuki-border p-5">
                <h2 className="font-display font-bold text-zuki-charcoal mb-4">Order Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-zuki-muted">Item</span><span className="font-medium">{menuItem.name}</span></div>
                  {form.selectedSize && <div className="flex justify-between"><span className="text-zuki-muted">Size</span><span>{form.selectedSize}</span></div>}
                  {form.selectedFlavor && <div className="flex justify-between"><span className="text-zuki-muted">Flavour</span><span>{form.selectedFlavor}</span></div>}
                  {form.occasion && <div className="flex justify-between"><span className="text-zuki-muted">Occasion</span><span>{form.occasion}</span></div>}
                  <div className="flex justify-between"><span className="text-zuki-muted">Collection</span><span className="capitalize">{form.pickupOrDelivery}</span></div>
                  <div className="flex justify-between"><span className="text-zuki-muted">Date</span><span>{format(new Date(form.requestedDate), 'dd MMM yyyy')}</span></div>

                  <div className="border-t border-zuki-border pt-2 mt-2 space-y-1.5">
                    <div className="flex justify-between"><span className="text-zuki-muted">Base price</span><span>{formatZMW(basePrice)}</span></div>
                    {rushFee > 0 && <div className="flex justify-between"><span className="text-zuki-muted">Rush fee</span><span>{formatZMW(rushFee)}</span></div>}
                    {deliveryFee > 0 && <div className="flex justify-between"><span className="text-zuki-muted">Delivery fee</span><span>{formatZMW(deliveryFee)}</span></div>}
                  </div>
                  <div className="border-t border-zuki-border pt-2">
                    <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatZMW(total)}</span></div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-2xl border border-zuki-border p-5">
                <h2 className="font-display font-bold text-zuki-charcoal mb-4">Deposit Payment</h2>
                <div className="bg-zuki-pink/10 rounded-xl p-4 mb-5">
                  <p className="text-sm text-zuki-charcoal font-medium">Deposit required: {formatZMW(deposit)}</p>
                  <p className="text-xs text-zuki-muted mt-1">Balance of {formatZMW(balance)} due at collection</p>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-zuki-charcoal mb-3">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'airtel', label: 'Airtel Money', enabled: bakery.accepts_airtel },
                      { key: 'mtn', label: 'MTN MoMo', enabled: bakery.accepts_mtn },
                      { key: 'zamtel', label: 'Zamtel', enabled: bakery.accepts_zamtel },
                      { key: 'bank_transfer', label: 'Bank Transfer', enabled: bakery.accepts_bank },
                    ].filter(m => m.enabled).map(method => (
                      <button
                        key={method.key}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, paymentMethod: method.key }))}
                        className={`p-3 rounded-xl border-2 text-xs font-medium transition-all ${
                          form.paymentMethod === method.key
                            ? 'border-zuki-pink bg-zuki-pink/5 text-zuki-pink'
                            : 'border-zuki-border text-zuki-muted hover:border-zuki-pink/50'
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                {paymentInstructions && (
                  <div className="bg-zuki-cream rounded-xl p-4 mb-5">
                    <p className="text-sm font-medium text-zuki-charcoal mb-2">{paymentInstructions.title} Instructions</p>
                    <ol className="space-y-1">
                      {paymentInstructions.instructions.map((inst, i) => (
                        <li key={i} className="text-xs text-zuki-muted flex gap-2">
                          <span className="text-zuki-pink font-medium">{i + 1}.</span> {inst}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-zuki-charcoal mb-2">
                    Transaction Reference Number <span className="text-zuki-muted font-normal">(from your payment confirmation SMS)</span>
                  </label>
                  <input
                    type="text"
                    value={form.transactionReference}
                    onChange={e => setForm(p => ({ ...p, transactionReference: e.target.value }))}
                    placeholder="e.g. TXN123456789"
                    className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 text-sm"
                  />
                  <p className="text-xs text-zuki-muted mt-1">Make your payment first, then enter the reference number here. You can also add it later from your order page.</p>
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <ZukiButton onClick={submitOrder} loading={submitting} className="w-full">
                Place Order
              </ZukiButton>
              <p className="text-center text-xs text-zuki-muted">
                By placing this order you agree to the baker&apos;s refund policy
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
