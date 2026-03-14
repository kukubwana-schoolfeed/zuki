import { NextResponse } from 'next/server'
// TODO: Implement when ZAMTEL_API_KEY is available
export async function POST() {
  return NextResponse.json(
    { message: 'Zamtel Kwacha API integration pending. Use manual confirmation flow.' },
    { status: 501 }
  )
}
