import { NextResponse } from 'next/server'
// TODO: Implement when MTN_MOMO_API_KEY is available
export async function POST() {
  return NextResponse.json(
    { message: 'MTN Mobile Money API integration pending. Use manual confirmation flow.' },
    { status: 501 }
  )
}
