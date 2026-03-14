'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ZukiButton } from '@/components/zuki/ZukiButton'
import { ZukiCard } from '@/components/zuki/ZukiCard'
import { formatZMW } from '@/lib/utils'
import { Plus, Edit, Trash2, X, Check } from 'lucide-react'
import type { MenuItem } from '@/types'

const emptyItem = {
  name: '',
  description: '',
  base_price_zmw: 0,
  image_url: '',
  is_available: true,
  flavor_options: [] as string[],
  filling_options: [] as string[],
  frosting_options: [] as string[],
  size_options: [] as string[],
  tier_options: [] as string[],
}

function OptionTags({ label, options, onChange }: {
  label: string
  options: string[]
  onChange: (opts: string[]) => void
}) {
  const [input, setInput] = useState('')

  function add() {
    if (input.trim() && !options.includes(input.trim())) {
      onChange([...options, input.trim()])
      setInput('')
    }
  }

  return (
    <div>
      <label className="block text-xs font-medium text-zuki-charcoal mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {options.map(opt => (
          <span key={opt} className="inline-flex items-center gap-1 px-2 py-1 bg-zuki-pink/10 text-zuki-pink rounded-lg text-xs">
            {opt}
            <button onClick={() => onChange(options.filter(o => o !== opt))}><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder={`Add ${label.toLowerCase()}...`}
          className="flex-1 px-3 py-1.5 rounded-xl border border-zuki-border bg-zuki-cream text-xs focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
        <button onClick={add} className="p-1.5 bg-zuki-pink text-white rounded-xl hover:bg-zuki-pink-deep transition-colors">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export default function BakerMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [bakeryId, setBakeryId] = useState('')
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: bakery } = await supabase.from('bakeries').select('id').eq('owner_id', user.id).single()
      if (!bakery) return
      setBakeryId(bakery.id)
      const { data } = await supabase.from('menu_items').select('*').eq('bakery_id', bakery.id).order('created_at', { ascending: false })
      setItems(data || [])
      setLoading(false)
    }
    load()
  }, [supabase])

  async function saveItem() {
    if (!editingItem?.name || !bakeryId) return
    setSaving(true)
    if (isNew) {
      const { data } = await supabase.from('menu_items').insert({ ...editingItem, bakery_id: bakeryId }).select().single()
      if (data) setItems(prev => [data, ...prev])
    } else {
      const { data } = await supabase.from('menu_items').update(editingItem).eq('id', editingItem.id!).select().single()
      if (data) setItems(prev => prev.map(i => i.id === data.id ? data : i))
    }
    setEditingItem(null)
    setSaving(false)
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this menu item?')) return
    await supabase.from('menu_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  async function toggleAvailable(item: MenuItem) {
    await supabase.from('menu_items').update({ is_available: !item.is_available }).eq('id', item.id)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-zuki-charcoal">Menu</h1>
          <p className="text-zuki-muted text-sm">{items.length} cake{items.length !== 1 ? 's' : ''} on your menu</p>
        </div>
        <ZukiButton onClick={() => { setEditingItem({ ...emptyItem }); setIsNew(true) }}>
          <Plus className="w-4 h-4 mr-2" /> Add Cake
        </ZukiButton>
      </div>

      {/* Edit form */}
      {editingItem && (
        <div className="bg-white rounded-2xl border-2 border-zuki-pink p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-zuki-charcoal">{isNew ? 'New Cake' : 'Edit Cake'}</h2>
            <button onClick={() => setEditingItem(null)}><X className="w-5 h-5 text-zuki-muted" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-zuki-charcoal mb-1.5">Name *</label>
              <input type="text" value={editingItem.name || ''} onChange={e => setEditingItem(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Classic Birthday Cake"
                className="w-full px-3 py-2 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zuki-charcoal mb-1.5">Base Price (ZMW) *</label>
              <input type="number" value={editingItem.base_price_zmw || 0} min={0}
                onChange={e => setEditingItem(p => ({ ...p, base_price_zmw: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30" />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-zuki-charcoal mb-1.5">Description</label>
            <textarea value={editingItem.description || ''} onChange={e => setEditingItem(p => ({ ...p, description: e.target.value }))}
              rows={2} placeholder="Describe this cake..."
              className="w-full px-3 py-2 rounded-xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <OptionTags label="Flavour Options" options={editingItem.flavor_options || []}
              onChange={v => setEditingItem(p => ({ ...p, flavor_options: v }))} />
            <OptionTags label="Filling Options" options={editingItem.filling_options || []}
              onChange={v => setEditingItem(p => ({ ...p, filling_options: v }))} />
            <OptionTags label="Frosting Options" options={editingItem.frosting_options || []}
              onChange={v => setEditingItem(p => ({ ...p, frosting_options: v }))} />
            <OptionTags label="Size Options" options={editingItem.size_options || []}
              onChange={v => setEditingItem(p => ({ ...p, size_options: v }))} />
            <OptionTags label="Tier Options" options={editingItem.tier_options || []}
              onChange={v => setEditingItem(p => ({ ...p, tier_options: v }))} />
          </div>

          <div className="flex gap-3">
            <ZukiButton onClick={saveItem} loading={saving}>
              <Check className="w-4 h-4 mr-2" /> Save
            </ZukiButton>
            <ZukiButton variant="ghost" onClick={() => setEditingItem(null)}>Cancel</ZukiButton>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-zuki-muted">Loading menu...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-zuki-border">
          <div className="text-5xl mb-4">🎂</div>
          <p className="text-zuki-muted mb-4">No menu items yet. Add your first cake!</p>
          <ZukiButton onClick={() => { setEditingItem({ ...emptyItem }); setIsNew(true) }}>
            <Plus className="w-4 h-4 mr-2" /> Add Your First Cake
          </ZukiButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <ZukiCard key={item.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-zuki-charcoal">{item.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      item.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.is_available ? 'Available' : 'Hidden'}
                    </span>
                  </div>
                  <p className="text-zuki-muted text-xs mt-0.5 line-clamp-2">{item.description}</p>
                </div>
              </div>

              <p className="font-bold text-zuki-charcoal text-lg mb-3">{formatZMW(item.base_price_zmw)}</p>

              <div className="flex flex-wrap gap-1 mb-3">
                {[...item.flavor_options, ...item.size_options].slice(0, 4).map(opt => (
                  <span key={opt} className="text-[10px] px-2 py-0.5 bg-zuki-cream rounded-lg text-zuki-muted">{opt}</span>
                ))}
                {(item.flavor_options.length + item.size_options.length) > 4 && (
                  <span className="text-[10px] px-2 py-0.5 bg-zuki-cream rounded-lg text-zuki-muted">
                    +{item.flavor_options.length + item.size_options.length - 4} more
                  </span>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-zuki-border">
                <button onClick={() => { setEditingItem(item); setIsNew(false) }}
                  className="flex items-center gap-1 text-xs text-zuki-muted hover:text-zuki-charcoal transition-colors">
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => toggleAvailable(item)}
                  className="flex items-center gap-1 text-xs text-zuki-muted hover:text-zuki-charcoal transition-colors">
                  {item.is_available ? 'Hide' : 'Show'}
                </button>
                <button onClick={() => deleteItem(item.id)}
                  className="flex items-center gap-1 text-xs text-zuki-error hover:opacity-70 transition-opacity ml-auto">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </ZukiCard>
          ))}
        </div>
      )}
    </div>
  )
}
