import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { messages, context } = await req.json()

  const systemPrompt = `You are Zuki AI, a warm and knowledgeable assistant built into Zuki — a cake ordering platform for Zambia.

You help bakers and clients with:
- Baking questions (recipes, techniques, substitutions, troubleshooting, flavour combinations)
- Platform questions (how to place orders, track status, manage payments)
- Business insights for bakers (pricing, order management, customer service)
- Generating sales summaries and report insights when given data
- Any general question the user has

Always be warm, friendly, and encouraging. Speak like a knowledgeable, helpful friend. Keep responses concise and practical. Use ZMW (Zambian Kwacha, K) for any currency mentions.
${context ? `\nCurrent context:\n${context}` : ''}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.slice(-10),
  })

  const reply = response.content[0].type === 'text' ? response.content[0].text : ''
  return NextResponse.json({ reply })
}
