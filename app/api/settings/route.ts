import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'

export async function GET() {
  try {
    const db = getDb()
    const rows = db.prepare('SELECT key, value FROM store_settings').all() as { key: string; value: string }[]
    const settings = Object.fromEntries(rows.map(r => [r.key, r.value]))
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Failed to get settings:', error)
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลการตั้งค่าได้' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 })
    }

    const body = await request.json()
    const db = getDb()

    const upsert = db.prepare(`
      INSERT INTO store_settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `)

    for (const [key, value] of Object.entries(body)) {
      upsert.run(key, String(value))
    }

    const rows = db.prepare('SELECT key, value FROM store_settings').all() as { key: string; value: string }[]
    const settings = Object.fromEntries(rows.map(r => [r.key, r.value]))

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error('Failed to update settings:', error)
    return NextResponse.json({ error: 'ไม่สามารถบันทึกการตั้งค่าได้' }, { status: 500 })
  }
}
