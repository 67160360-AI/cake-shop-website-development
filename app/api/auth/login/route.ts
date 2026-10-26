import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyPassword, createAdminSession, checkRateLimit, recordLoginAttempt, ADMIN_COOKIE_NAME } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'คุณพยายามเข้าสู่ระบบมากเกินไป กรุณารอ 15 นาทีแล้วลองใหม่อีกครั้ง' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' }, { status: 400 })
    }

    const db = getDb()
    const user = db.prepare(`
      SELECT id, username, email, password_hash, role
      FROM users
      WHERE (email = ? OR username = ?) AND role = 'admin'
      LIMIT 1
    `).get(email.trim().toLowerCase(), email.trim()) as {
      id: number
      username: string
      email: string
      password_hash: string
      role: string
    } | undefined

    if (!user || !verifyPassword(password, user.password_hash)) {
      recordLoginAttempt(ip, false)
      return NextResponse.json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 })
    }

    recordLoginAttempt(ip, true)
    const token = createAdminSession(user.id)

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    })

    // Set HTTP-Only Secure cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' }, { status: 500 })
  }
}
