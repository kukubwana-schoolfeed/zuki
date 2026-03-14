'use client'
import { useState } from 'react'
import type { AIMessage } from '@/types'

export function useAI(context?: string) {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [loading, setLoading] = useState(false)

  async function sendMessage(content: string) {
    if (!content.trim() || loading) return
    const userMsg: AIMessage = { role: 'user', content }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg], context }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble responding.' }])
    } finally {
      setLoading(false)
    }
  }

  return { messages, loading, sendMessage, setMessages }
}
