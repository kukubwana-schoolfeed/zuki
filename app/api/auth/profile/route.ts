import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { fullName, phone, role: requestedRole } = body

  // Admin always wins regardless of stored role
  const isAdmin = user.email === process.env.ADMIN_EMAIL
  if (isAdmin) {
    const adminClient = createAdminClient()
    await adminClient.from('profiles').upsert({
      id: user.id,
      role: 'admin',
      full_name: fullName || user.user_metadata?.full_name || '',
      phone: phone || user.user_metadata?.phone || null,
    })
    return NextResponse.json({ role: 'admin' })
  }

  // For everyone else: read the existing profile first so we never clobber an existing role
  const adminClient = createAdminClient()
  const { data: existing } = await adminClient
    .from('profiles')
    .select('role, full_name, phone')
    .eq('id', user.id)
    .single()

  // Use provided role (sign-up flow) → existing role (sign-in flow) → default 'client'
  const role = requestedRole || existing?.role || 'client'

  await adminClient.from('profiles').upsert({
    id: user.id,
    role,
    full_name: fullName || existing?.full_name || user.user_metadata?.full_name || '',
    phone: phone || existing?.phone || user.user_metadata?.phone || null,
  })

  return NextResponse.json({ role })
}
