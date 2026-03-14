import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bakeryName, period, ordersData } = await req.json()

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `Generate a professional sales summary for bakery: ${bakeryName}, Period: ${period}, Data: ${JSON.stringify(ordersData)}

Return JSON ONLY — no markdown, no extra text:
{
  "summary": { "totalOrders": number, "totalRevenue": number, "averageOrderValue": number, "completedOrders": number, "cancelledOrders": number },
  "topItems": [{ "name": string, "count": number, "revenue": number }],
  "paymentMethods": [{ "method": string, "count": number, "total": number }],
  "highlights": [string],
  "recommendations": [string]
}`,
    }],
  })

  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const report = JSON.parse(cleaned)
    return NextResponse.json({ report })
  } catch {
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
