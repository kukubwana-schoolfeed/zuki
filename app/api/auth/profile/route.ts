import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { fullName, phone, role: requestedRole } = body

  // Admin email check happens server-side so ADMIN_EMAIL stays private
  const isAdmin = user.email === process.env.ADMIN_EMAIL
  const role = isAdmin ? 'admin' : (requestedRole || 'client')

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    role,
    full_name: fullName || user.user_metadata?.full_name || '',
    phone: phone || user.user_metadata?.phone || null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ role })
}
