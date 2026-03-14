'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ZukiButton } from '@/components/zuki/ZukiButton'
import { Check, ExternalLink } from 'lucide-react'

export default function BakerStorefrontPage() {
  const [bakery, setBakery] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', logo_url: '', cover_url: '', whatsapp_number: ''
  })
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('bakeries').select('*').eq('owner_id', user.id).single()
      if (data) {
        setBakery(data)
        setForm({
          name: data.name || '',
          description: data.description || '',
          logo_url: data.logo_url || '',
          cover_url: data.cover_url || '',
          whatsapp_number: data.whatsapp_number || '',
        })
      }
      setLoading(false)
    }
    load()
  }, [supabase])

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
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-zuki-charcoal">Storefront</h1>
          <p className="text-zuki-muted text-sm">Edit your public bakery profile</p>
        </div>
        {bakery?.slug && (
          <a href={`/bakery/${bakery.slug}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-zuki-blue hover:underline">
            <ExternalLink className="w-4 h-4" /> View Live
          </a>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-zuki-border p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-zuki-charcoal mb-2">Bakery Name</label>
          <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
        </div>

        <div>
          <label className="block text-sm font-medium text-zuki-charcoal mb-2">Description</label>
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            rows={4} placeholder="Tell clients about your bakery..."
            className="w-full px-4 py-3 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-zuki-charcoal mb-2">Logo URL</label>
          <input type="url" value={form.logo_url} onChange={e => setForm(p => ({ ...p, logo_url: e.target.value }))}
            placeholder="https://..."
            className="w-full px-4 py-3 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
          <p className="text-xs text-zuki-muted mt-1">Upload your logo to Supabase Storage and paste the URL here</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-zuki-charcoal mb-2">Cover Photo URL</label>
          <input type="url" value={form.cover_url} onChange={e => setForm(p => ({ ...p, cover_url: e.target.value }))}
            placeholder="https://..."
            className="w-full px-4 py-3 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
        </div>

        <div>
          <label className="block text-sm font-medium text-zuki-charcoal mb-2">WhatsApp Number</label>
          <input type="tel" value={form.whatsapp_number} onChange={e => setForm(p => ({ ...p, whatsapp_number: e.target.value }))}
            placeholder="260971234567"
            className="w-full px-4 py-3 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
          <p className="text-xs text-zuki-muted mt-1">With country code. Clients use this to share reference photos.</p>
        </div>

        <ZukiButton onClick={save} loading={saving} className="w-full">
          {saved ? <><Check className="w-4 h-4 mr-2" />Saved!</> : 'Save Changes'}
        </ZukiButton>
      </div>
    </div>
  )
}
