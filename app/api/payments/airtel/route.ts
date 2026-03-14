import { NextResponse } from 'next/server'
// TODO: Implement when AIRTEL_MONEY_API_KEY is available
export async function POST() {
  return NextResponse.json(
    { message: 'Airtel Money API integration pending. Use manual confirmation flow.' },
    { status: 501 }
  )
}
