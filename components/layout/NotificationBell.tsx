'use client'
import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Notification } from '@/types'

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const unread = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => { if (data) setNotifications(data) })

    const channel = supabase
      .channel(`notifs-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        payload => {
          setNotifications(prev => [payload.new as Notification, ...prev])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase])

  async function markRead(id: string, link?: string | null) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    if (link) {
      setOpen(false)
      router.push(link)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-2xl hover:bg-zuki-cream transition-colors"
      >
        <Bell className="w-5 h-5 text-zuki-charcoal" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-zuki-pink rounded-full text-white text-[9px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-zuki-lg border border-zuki-border z-20 overflow-hidden">
            <div className="px-4 py-3 border-b border-zuki-border flex items-center justify-between">
              <p className="font-display font-semibold text-sm">Notifications</p>
              {unread > 0 && (
                <button
                  onClick={() => {
                    notifications.forEach(n => !n.is_read && markRead(n.id))
                  }}
                  className="text-xs text-zuki-pink hover:text-zuki-pink-deep"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-center text-zuki-muted text-sm py-8">No notifications yet</p>
              ) : (
                notifications.map(n => (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id, n.link)}
                    className={`w-full text-left px-4 py-3 hover:bg-zuki-cream transition-colors border-b border-zuki-border last:border-0 ${!n.is_read ? 'bg-zuki-pink/5' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.is_read && <div className="w-2 h-2 rounded-full bg-zuki-pink mt-1.5 flex-shrink-0" />}
                      <div>
                        <p className={`text-sm font-medium ${!n.is_read ? 'text-zuki-charcoal' : 'text-zuki-muted'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-zuki-muted mt-0.5 line-clamp-2">{n.body}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
