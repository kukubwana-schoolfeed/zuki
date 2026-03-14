'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { ZukiButton } from '@/components/zuki/ZukiButton'
import { generateSlug } from '@/lib/utils'
import { Check, ArrowRight, ArrowLeft } from 'lucide-react'

const steps = ['Bakery Profile', 'Business Settings', 'Payment Methods']

export default function BakerOnboarding() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    // Step 1
    name: '',
    description: '',
    logo_url: '',
    cover_url: '',
    whatsapp_number: '',
    // Step 2
    deposit_percent: 50,
    min_notice_hours: 48,
    rush_order_enabled: false,
    rush_fee_zmw: 0,
    delivery_option: 'pickup' as 'pickup' | 'delivery' | 'both',
    delivery_fee_zmw: 0,
    max_orders_per_day: 10,
    refund_policy_enabled: false,
    refund_policy_text: '',
    // Step 3
    accepts_airtel: true,
    accepts_mtn: true,
    accepts_zamtel: false,
    accepts_bank: false,
    airtel_number: '',
    mtn_number: '',
    zamtel_number: '',
    bank_name: '',
    bank_account_name: '',
    bank_account_number: '',
  })

  function update(key: string, value: unknown) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function submit() {
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const slug = generateSlug(form.name)

    const { error: insertError } = await supabase.from('bakeries').insert({
      owner_id: user.id,
      ...form,
      slug,
      status: 'pending',
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/baker/pending')
  }

  return (
    <div className="min-h-screen bg-zuki-cream flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-zuki-charcoal">Set Up Your Bakery</h1>
          <p className="text-zuki-muted mt-2">3 quick steps and you&apos;re ready to go</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                i < step ? 'bg-zuki-success border-zuki-success text-white'
                : i === step ? 'bg-zuki-pink border-zuki-pink text-white'
                : 'bg-white border-zuki-border text-zuki-muted'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-zuki-pink' : 'text-zuki-muted'}`}>{label}</span>
              {i < 2 && <div className={`h-0.5 w-8 hidden sm:block ${i < step ? 'bg-zuki-success' : 'bg-zuki-border'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0: Profile */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="bg-white rounded-2xl border border-zuki-border p-6 space-y-5">
                <h2 className="font-display font-bold text-zuki-charcoal">Bakery Profile</h2>
                <div>
                  <label className="block text-sm font-medium text-zuki-charcoal mb-2">Bakery Name *</label>
                  <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
                    placeholder="e.g. Lulu's Cakes"
                    className="w-full px-4 py-3 rounded-xl border border-zuki-border bg-zuki-cream focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zuki-charcoal mb-2">Description</label>
                  <textarea value={form.description} onChange={e => update('description', e.target.value)}
                    placeholder="Tell clients about your bakery, specialties, and what makes you special..."
                    rows={4} className="w-full px-4 py-3 rounded-xl border border-zuki-border bg-zuki-cream focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zuki-charcoal mb-2">WhatsApp Number</label>
                  <input type="tel" value={form.whatsapp_number} onChange={e => update('whatsapp_number', e.target.value)}
                    placeholder="260971234567 (with country code)"
                    className="w-full px-4 py-3 rounded-xl border border-zuki-border bg-zuki-cream focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 text-sm" />
                  <p className="text-xs text-zuki-muted mt-1">Clients will use this to share reference photos</p>
                </div>
                <ZukiButton onClick={() => { if (form.name) setStep(1) }} disabled={!form.name} className="w-full">
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </ZukiButton>
              </div>
            </motion.div>
          )}

          {/* Step 1: Business Settings */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="bg-white rounded-2xl border border-zuki-border p-6 space-y-5">
                <h2 className="font-display font-bold text-zuki-charcoal">Business Settings</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zuki-charcoal mb-2">Deposit % Required</label>
                    <input type="number" value={form.deposit_percent} min={0} max={100}
                      onChange={e => update('deposit_percent', parseInt(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zuki-charcoal mb-2">Min Notice (hours)</label>
                    <input type="number" value={form.min_notice_hours} min={1}
                      onChange={e => update('min_notice_hours', parseInt(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zuki-charcoal mb-2">Delivery Options</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['pickup', 'delivery', 'both'].map(opt => (
                      <button key={opt} type="button" onClick={() => update('delivery_option', opt)}
                        className={`py-2 rounded-xl border-2 text-xs font-medium capitalize transition-all ${
                          form.delivery_option === opt
                            ? 'border-zuki-pink bg-zuki-pink/5 text-zuki-pink'
                            : 'border-zuki-border text-zuki-muted'
                        }`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {(form.delivery_option === 'delivery' || form.delivery_option === 'both') && (
                  <div>
                    <label className="block text-sm font-medium text-zuki-charcoal mb-2">Delivery Fee (ZMW)</label>
                    <input type="number" value={form.delivery_fee_zmw} min={0}
                      onChange={e => update('delivery_fee_zmw', parseFloat(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
                  </div>
                )}

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.rush_order_enabled}
                    onChange={e => update('rush_order_enabled', e.target.checked)} className="w-4 h-4 accent-zuki-pink" />
                  <span className="text-sm font-medium text-zuki-charcoal">Enable rush orders</span>
                </label>

                {form.rush_order_enabled && (
                  <div>
                    <label className="block text-sm font-medium text-zuki-charcoal mb-2">Rush Fee (ZMW)</label>
                    <input type="number" value={form.rush_fee_zmw} min={0}
                      onChange={e => update('rush_fee_zmw', parseFloat(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
                  </div>
                )}

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.refund_policy_enabled}
                    onChange={e => update('refund_policy_enabled', e.target.checked)} className="w-4 h-4 accent-zuki-pink" />
                  <span className="text-sm font-medium text-zuki-charcoal">Add refund policy</span>
                </label>

                {form.refund_policy_enabled && (
                  <textarea value={form.refund_policy_text} onChange={e => update('refund_policy_text', e.target.value)}
                    placeholder="Describe your refund policy..." rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-zuki-border bg-zuki-cream text-sm resize-none focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
                )}

                <div className="flex gap-3">
                  <ZukiButton variant="ghost" onClick={() => setStep(0)} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </ZukiButton>
                  <ZukiButton onClick={() => setStep(2)} className="flex-1">
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </ZukiButton>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="bg-white rounded-2xl border border-zuki-border p-6 space-y-5">
                <h2 className="font-display font-bold text-zuki-charcoal">Payment Methods</h2>
                <p className="text-sm text-zuki-muted">Enter your account details for each payment method you accept</p>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.accepts_airtel} onChange={e => update('accepts_airtel', e.target.checked)} className="w-4 h-4 accent-zuki-pink" />
                  <span className="text-sm font-medium">Airtel Money</span>
                </label>
                {form.accepts_airtel && (
                  <input type="tel" value={form.airtel_number} onChange={e => update('airtel_number', e.target.value)}
                    placeholder="Airtel Money number" className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
                )}

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.accepts_mtn} onChange={e => update('accepts_mtn', e.target.checked)} className="w-4 h-4 accent-zuki-pink" />
                  <span className="text-sm font-medium">MTN Mobile Money</span>
                </label>
                {form.accepts_mtn && (
                  <input type="tel" value={form.mtn_number} onChange={e => update('mtn_number', e.target.value)}
                    placeholder="MTN MoMo number" className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
                )}

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.accepts_zamtel} onChange={e => update('accepts_zamtel', e.target.checked)} className="w-4 h-4 accent-zuki-pink" />
                  <span className="text-sm font-medium">Zamtel Kwacha</span>
                </label>
                {form.accepts_zamtel && (
                  <input type="tel" value={form.zamtel_number} onChange={e => update('zamtel_number', e.target.value)}
                    placeholder="Zamtel number" className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
                )}

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.accepts_bank} onChange={e => update('accepts_bank', e.target.checked)} className="w-4 h-4 accent-zuki-pink" />
                  <span className="text-sm font-medium">Bank Transfer</span>
                </label>
                {form.accepts_bank && (
                  <div className="space-y-3">
                    <input type="text" value={form.bank_name} onChange={e => update('bank_name', e.target.value)}
                      placeholder="Bank name" className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
                    <input type="text" value={form.bank_account_name} onChange={e => update('bank_account_name', e.target.value)}
                      placeholder="Account name" className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
                    <input type="text" value={form.bank_account_number} onChange={e => update('bank_account_number', e.target.value)}
                      placeholder="Account number" className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
                  </div>
                )}

                {error && (
                  <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
                )}

                <div className="flex gap-3">
                  <ZukiButton variant="ghost" onClick={() => setStep(1)} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </ZukiButton>
                  <ZukiButton onClick={submit} loading={loading} className="flex-1">
                    Submit Bakery
                  </ZukiButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
