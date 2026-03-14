'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import type { Message } from '@/types'

export function OrderChat({ orderId, currentUserId }: { orderId: string; currentUserId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const supabase = createClient()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase
      .from('messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setMessages(data) })

    // Mark messages as read
    supabase.from('messages').update({ is_read: true })
      .eq('order_id', orderId)
      .neq('sender_id', currentUserId)
      .then(() => {})

    const channel = supabase
      .channel(`chat-${orderId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `order_id=eq.${orderId}` },
        payload => { setMessages(prev => [...prev, payload.new as Message]) }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [orderId, currentUserId, supabase])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    if (!input.trim() || sending) return
    setSending(true)
    await supabase.from('messages').insert({
      order_id: orderId,
      sender_id: currentUserId,
      content: input.trim(),
    })
    setInput('')
    setSending(false)
  }

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-zuki-border overflow-hidden" style={{ height: '400px' }}>
      <div className="px-4 py-3 border-b border-zuki-border bg-zuki-cream">
        <p className="text-sm font-medium text-zuki-charcoal">Order Chat</p>
        <p className="text-xs text-zuki-muted">Messages are between you and the baker</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-zuki-muted text-sm">No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] group ${msg.sender_id === currentUserId ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                msg.sender_id === currentUserId
                  ? 'bg-zuki-pink text-white rounded-br-sm'
                  : 'bg-zuki-cream border border-zuki-border text-zuki-charcoal rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
              <span className="text-[10px] text-zuki-muted opacity-0 group-hover:opacity-100 transition-opacity px-1">
                {format(new Date(msg.created_at), 'HH:mm')}
              </span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-zuki-border flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-2xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 focus:border-zuki-pink"
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          className="px-4 py-2 bg-zuki-pink text-white rounded-2xl text-sm font-medium hover:bg-zuki-pink-deep transition-colors disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  )
}
