'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ZukiButton } from '@/components/zuki/ZukiButton'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '' })
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setForm({ full_name: data.full_name || '', phone: data.phone || '' })
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  async function save() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update(form).eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <div className="text-center py-20 text-zuki-muted">Loading...</div>

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="font-display text-3xl font-bold text-zuki-charcoal mb-8">My Profile</h1>

      <div className="bg-white rounded-2xl border border-zuki-border p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-zuki-charcoal mb-2">Full Name</label>
          <input
            type="text"
            value={form.full_name}
            onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-zuki-border bg-zuki-cream focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zuki-charcoal mb-2">Phone Number</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            placeholder="0971 234 567"
            className="w-full px-4 py-3 rounded-xl border border-zuki-border bg-zuki-cream focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 text-sm"
          />
        </div>

        <ZukiButton onClick={save} loading={saving} className="w-full">
          {saved ? '✓ Saved!' : 'Save Changes'}
        </ZukiButton>
      </div>
    </div>
  )
}
