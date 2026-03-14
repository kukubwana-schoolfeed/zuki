'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message } from '@/types'

export function useChat(orderId: string, currentUserId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!orderId) return

    supabase.from('messages').select('*').eq('order_id', orderId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data)
        setLoading(false)
      })

    const channel = supabase.channel(`chat-${orderId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `order_id=eq.${orderId}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [orderId, supabase])

  async function sendMessage(content: string) {
    if (!content.trim()) return
    await supabase.from('messages').insert({
      order_id: orderId,
      sender_id: currentUserId,
      content: content.trim(),
    })
  }

  return { messages, loading, sendMessage }
}
