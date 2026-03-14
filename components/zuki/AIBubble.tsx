'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Sparkles } from 'lucide-react'
import type { AIMessage } from '@/types'

export function AIBubble({ context }: { context?: string }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg: AIMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
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
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble responding. Please try again.',
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-zuki-pink rounded-full shadow-zuki-lg flex items-center justify-center text-white"
        aria-label="Open Zuki AI"
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            {/* Mobile overlay */}
            <div className="fixed inset-0 z-40 bg-black/20 md:hidden" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed z-50 bg-white rounded-3xl shadow-zuki-lg border border-zuki-border flex flex-col overflow-hidden
                bottom-0 left-0 right-0 h-[85vh] rounded-b-none
                md:bottom-24 md:right-6 md:left-auto md:w-[360px] md:max-h-[560px] md:h-auto md:rounded-3xl"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-zuki-border bg-zuki-cream">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-zuki-pink rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-sm">Zuki AI</p>
                    <p className="text-xs text-zuki-muted">Ask me anything about baking</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-zuki-muted hover:text-zuki-charcoal transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-8 px-4">
                    <div className="w-12 h-12 bg-zuki-pink/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-6 h-6 text-zuki-pink" />
                    </div>
                    <p className="text-zuki-charcoal font-medium text-sm mb-2">Hi there! I&apos;m your Zuki assistant.</p>
                    <p className="text-zuki-muted text-xs">Ask me anything about baking, flavours, orders, or how to use the platform.</p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-zuki-pink text-white rounded-br-sm'
                        : 'bg-zuki-cream text-zuki-charcoal rounded-bl-sm border border-zuki-border'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-zuki-cream border border-zuki-border px-4 py-3 rounded-2xl rounded-bl-sm">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <div
                            key={i}
                            className="w-2 h-2 bg-zuki-pink rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <div className="p-4 border-t border-zuki-border flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask anything..."
                  className="flex-1 px-4 py-2 rounded-2xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 focus:border-zuki-pink"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 bg-zuki-pink rounded-2xl flex items-center justify-center text-white disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
