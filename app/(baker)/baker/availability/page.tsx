'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ZukiButton } from '@/components/zuki/ZukiButton'
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight, X, Check } from 'lucide-react'

export default function BakerAvailabilityPage() {
  const [bakeryId, setBakeryId] = useState('')
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: bakery } = await supabase.from('bakeries').select('id').eq('owner_id', user.id).single()
      if (!bakery) return
      setBakeryId(bakery.id)

      const { data: dates } = await supabase
        .from('bakery_blocked_dates').select('blocked_date').eq('bakery_id', bakery.id)
      setBlockedDates(dates?.map(d => d.blocked_date) || [])
      setLoading(false)
    }
    load()
  }, [supabase])

  async function toggleDate(date: Date) {
    const dateStr = format(date, 'yyyy-MM-dd')
    const isBlocked = blockedDates.includes(dateStr)

    if (isBlocked) {
      await supabase.from('bakery_blocked_dates')
        .delete().eq('bakery_id', bakeryId).eq('blocked_date', dateStr)
      setBlockedDates(prev => prev.filter(d => d !== dateStr))
    } else {
      await supabase.from('bakery_blocked_dates').insert({ bakery_id: bakeryId, blocked_date: dateStr })
      setBlockedDates(prev => [...prev, dateStr])
    }
  }

  if (loading) return <div className="p-6 text-center text-zuki-muted">Loading calendar...</div>

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })
  const startDay = startOfMonth(currentMonth).getDay()

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-zuki-charcoal">Availability</h1>
        <p className="text-zuki-muted text-sm">Block dates when you&apos;re unavailable</p>
      </div>

      <div className="bg-white rounded-2xl border border-zuki-border p-6">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentMonth(m => addDays(startOfMonth(m), -1))}
            className="p-2 hover:bg-zuki-cream rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-display font-bold text-zuki-charcoal">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button onClick={() => setCurrentMonth(m => addDays(endOfMonth(m), 1))}
            className="p-2 hover:bg-zuki-cream rounded-xl transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-medium text-zuki-muted py-2">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array(startDay).fill(null).map((_, i) => <div key={i} />)}
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const isBlocked = blockedDates.includes(dateStr)
            const today = isToday(day)
            const past = day < new Date() && !today

            return (
              <button
                key={dateStr}
                onClick={() => !past && toggleDate(day)}
                disabled={past}
                className={`aspect-square rounded-xl text-sm font-medium transition-all relative flex items-center justify-center ${
                  past ? 'text-zuki-muted/30 cursor-not-allowed'
                  : isBlocked ? 'bg-zuki-error/20 text-zuki-error border-2 border-zuki-error/40'
                  : today ? 'bg-zuki-pink text-white'
                  : 'hover:bg-zuki-cream text-zuki-charcoal'
                }`}
              >
                {format(day, 'd')}
                {isBlocked && <X className="w-2 h-2 absolute top-1 right-1 text-zuki-error" />}
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex items-center gap-6 text-xs text-zuki-muted">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-zuki-pink" />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-zuki-error/20 border-2 border-zuki-error/40" />
            <span>Blocked (unavailable)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border border-zuki-border" />
            <span>Available</span>
          </div>
        </div>
      </div>

      {blockedDates.length > 0 && (
        <div className="mt-4 bg-white rounded-2xl border border-zuki-border p-5">
          <h3 className="font-medium text-zuki-charcoal text-sm mb-3">Blocked Dates ({blockedDates.length})</h3>
          <div className="flex flex-wrap gap-2">
            {blockedDates.sort().map(d => (
              <span key={d} className="inline-flex items-center gap-1 px-3 py-1 bg-zuki-error/10 text-zuki-error rounded-lg text-xs font-medium">
                {format(new Date(d), 'dd MMM yyyy')}
                <button onClick={async () => {
                  await supabase.from('bakery_blocked_dates').delete().eq('bakery_id', bakeryId).eq('blocked_date', d)
                  setBlockedDates(prev => prev.filter(bd => bd !== d))
                }}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
