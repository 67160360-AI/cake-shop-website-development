import { NextResponse } from 'next/server'
import { getCurrentAdminUser } from '@/lib/auth'

export async function GET() {
  const admin = await getCurrentAdminUser()
  if (!admin) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
  return NextResponse.json({ authenticated: true, user: admin })
}
