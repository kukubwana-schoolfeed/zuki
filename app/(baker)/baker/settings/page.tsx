'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ZukiButton } from '@/components/zuki/ZukiButton'
import { Check } from 'lucide-react'

export default function BakerSettingsPage() {
  const [bakery, setBakery] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<any>({})
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('bakeries').select('*').eq('owner_id', user.id).single()
      if (data) { setBakery(data); setForm(data) }
      setLoading(false)
    }
    load()
  }, [supabase])

  function update(key: string, value: unknown) { setForm((p: any) => ({ ...p, [key]: value })) }

  async function save() {
    if (!bakery) return
    setSaving(true)
    await supabase.from('bakeries').update(form).eq('id', bakery.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <div className="p-6 text-center text-zuki-muted">Loading...</div>

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-zuki-charcoal">Business Settings</h1>
        <p className="text-zuki-muted text-sm">Configure your bakery operations</p>
      </div>

      {/* Order settings */}
      <div className="bg-white rounded-2xl border border-zuki-border p-6 space-y-4">
        <h2 className="font-display font-bold text-zuki-charcoal">Order Settings</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zuki-charcoal mb-2">Deposit % Required</label>
            <input type="number" value={form.deposit_percent || 50} min={0} max={100}
              onChange={e => update('deposit_percent', parseInt(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zuki-charcoal mb-2">Min Notice (hours)</label>
            <input type="number" value={form.min_notice_hours || 48} min={1}
              onChange={e => update('min_notice_hours', parseInt(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zuki-charcoal mb-2">Max Orders Per Day</label>
            <input type="number" value={form.max_orders_per_day || 10} min={1}
              onChange={e => update('max_orders_per_day', parseInt(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.rush_order_enabled || false}
              onChange={e => update('rush_order_enabled', e.target.checked)} className="w-4 h-4 accent-zuki-pink" />
            <span className="text-sm font-medium text-zuki-charcoal">Enable rush orders</span>
          </label>
          {form.rush_order_enabled && (
            <div>
              <label className="block text-sm font-medium text-zuki-charcoal mb-2">Rush Fee (ZMW)</label>
              <input type="number" value={form.rush_fee_zmw || 0} min={0}
                onChange={e => update('rush_fee_zmw', parseFloat(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
            </div>
          )}
        </div>
      </div>

      {/* Delivery */}
      <div className="bg-white rounded-2xl border border-zuki-border p-6 space-y-4">
        <h2 className="font-display font-bold text-zuki-charcoal">Delivery Options</h2>
        <div className="grid grid-cols-3 gap-2">
          {['pickup', 'delivery', 'both'].map(opt => (
            <button key={opt} type="button" onClick={() => update('delivery_option', opt)}
              className={`py-2 rounded-xl border-2 text-xs font-medium capitalize transition-all ${
                form.delivery_option === opt
                  ? 'border-zuki-pink bg-zuki-pink/5 text-zuki-pink'
                  : 'border-zuki-border text-zuki-muted hover:border-zuki-pink/50'
              }`}>
              {opt}
            </button>
          ))}
        </div>
        {(form.delivery_option === 'delivery' || form.delivery_option === 'both') && (
          <div>
            <label className="block text-sm font-medium text-zuki-charcoal mb-2">Delivery Fee (ZMW)</label>
            <input type="number" value={form.delivery_fee_zmw || 0} min={0}
              onChange={e => update('delivery_fee_zmw', parseFloat(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
          </div>
        )}
      </div>

      {/* Payment methods */}
      <div className="bg-white rounded-2xl border border-zuki-border p-6 space-y-4">
        <h2 className="font-display font-bold text-zuki-charcoal">Payment Methods</h2>

        {[
          { key: 'airtel', label: 'Airtel Money', numKey: 'airtel_number', placeholder: 'Airtel number' },
          { key: 'mtn', label: 'MTN Mobile Money', numKey: 'mtn_number', placeholder: 'MTN number' },
          { key: 'zamtel', label: 'Zamtel Kwacha', numKey: 'zamtel_number', placeholder: 'Zamtel number' },
        ].map(method => (
          <div key={method.key}>
            <label className="flex items-center gap-3 cursor-pointer mb-2">
              <input type="checkbox" checked={form[`accepts_${method.key}`] || false}
                onChange={e => update(`accepts_${method.key}`, e.target.checked)} className="w-4 h-4 accent-zuki-pink" />
              <span className="text-sm font-medium text-zuki-charcoal">{method.label}</span>
            </label>
            {form[`accepts_${method.key}`] && (
              <input type="tel" value={form[method.numKey] || ''} onChange={e => update(method.numKey, e.target.value)}
                placeholder={method.placeholder}
                className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
            )}
          </div>
        ))}

        <div>
          <label className="flex items-center gap-3 cursor-pointer mb-2">
            <input type="checkbox" checked={form.accepts_bank || false}
              onChange={e => update('accepts_bank', e.target.checked)} className="w-4 h-4 accent-zuki-pink" />
            <span className="text-sm font-medium text-zuki-charcoal">Bank Transfer</span>
          </label>
          {form.accepts_bank && (
            <div className="space-y-2">
              <input type="text" value={form.bank_name || ''} onChange={e => update('bank_name', e.target.value)}
                placeholder="Bank name" className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
              <input type="text" value={form.bank_account_name || ''} onChange={e => update('bank_account_name', e.target.value)}
                placeholder="Account name" className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
              <input type="text" value={form.bank_account_number || ''} onChange={e => update('bank_account_number', e.target.value)}
                placeholder="Account number" className="w-full px-4 py-2.5 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
            </div>
          )}
        </div>
      </div>

      {/* Refund policy */}
      <div className="bg-white rounded-2xl border border-zuki-border p-6 space-y-4">
        <h2 className="font-display font-bold text-zuki-charcoal">Refund Policy</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.refund_policy_enabled || false}
            onChange={e => update('refund_policy_enabled', e.target.checked)} className="w-4 h-4 accent-zuki-pink" />
          <span className="text-sm font-medium text-zuki-charcoal">Show refund policy on storefront</span>
        </label>
        {form.refund_policy_enabled && (
          <textarea value={form.refund_policy_text || ''} onChange={e => update('refund_policy_text', e.target.value)}
            placeholder="Describe your refund policy..." rows={4}
            className="w-full px-4 py-3 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 resize-none" />
        )}
      </div>

      <ZukiButton onClick={save} loading={saving} className="w-full">
        {saved ? <><Check className="w-4 h-4 mr-2" />Saved!</> : 'Save All Settings'}
      </ZukiButton>
    </div>
  )
}
