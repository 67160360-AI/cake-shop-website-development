import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const db = getDb()

    if (code) {
      const promo = db.prepare(`
        SELECT * FROM promotions WHERE code = ? AND is_active = 1
      `).get(code.trim().toUpperCase())

      if (!promo) {
        return NextResponse.json({ error: 'ไม่พบคูปองส่วนลดนี้ หรือหมดอายุแล้ว' }, { status: 404 })
      }
      return NextResponse.json({ promotion: promo })
    }

    // List all for admin, or active for public
    const admin = await getCurrentAdminUser()
    let query = 'SELECT * FROM promotions ORDER BY id DESC'
    if (!admin) {
      query = 'SELECT id, code, description, discount_type, discount_value, min_spend FROM promotions WHERE is_active = 1'
    }

    const promotions = db.prepare(query).all()
    return NextResponse.json({ promotions })
  } catch (error) {
    console.error('Failed to get promotions:', error)
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลโปรโมชั่นได้' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 })
    }

    const body = await request.json()
    const { code, description, discount_type, discount_value, min_spend, is_active } = body

    if (!code || !discount_value) {
      return NextResponse.json({ error: 'กรุณากรอกรหัสคูปองและมูลค่าส่วนลด' }, { status: 400 })
    }

    const db = getDb()
    db.prepare(`
      INSERT INTO promotions (code, description, discount_type, discount_value, min_spend, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(code) DO UPDATE SET
        description = excluded.description,
        discount_type = excluded.discount_type,
        discount_value = excluded.discount_value,
        min_spend = excluded.min_spend,
        is_active = excluded.is_active
    `).run(
      code.trim().toUpperCase(),
      description || '',
      discount_type || 'percent',
      Number(discount_value),
      Number(min_spend || 0),
      is_active !== undefined ? (is_active ? 1 : 0) : 1
    )

    const promotions = db.prepare('SELECT * FROM promotions ORDER BY id DESC').all()
    return NextResponse.json({ success: true, promotions })
  } catch (error) {
    console.error('Failed to save promotion:', error)
    return NextResponse.json({ error: 'ไม่สามารถบันทึกโปรโมชั่นได้' }, { status: 500 })
  }
}
