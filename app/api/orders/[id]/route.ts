import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = getDb()

    const isNumeric = /^\d+$/.test(id)
    let order: any = null

    if (isNumeric) {
      order = db.prepare('SELECT * FROM orders WHERE id = ?').get(Number(id))
    } else {
      order = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(id)
    }

    if (!order) {
      return NextResponse.json({ error: 'ไม่พบคำสั่งซื้อนี้' }, { status: 404 })
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id)
    const settingsRows = db.prepare('SELECT key, value FROM store_settings').all() as { key: string; value: string }[]
    const settings = Object.fromEntries(settingsRows.map(r => [r.key, r.value]))

    return NextResponse.json({ order, items, store_settings: settings })
  } catch (error) {
    console.error('Failed to get order:', error)
    return NextResponse.json({ error: 'ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต (สำหรับผู้ดูแลระบบ)' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { order_status, payment_status, notes } = body
    const db = getDb()

    const currentOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(Number(id)) as any
    if (!currentOrder) {
      return NextResponse.json({ error: 'ไม่พบคำสั่งซื้อ' }, { status: 404 })
    }

    // If changing to cancelled from non-cancelled, restore stock
    if (order_status === 'cancelled' && currentOrder.order_status !== 'cancelled') {
      const items = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(Number(id)) as any[]
      const restoreStock = db.prepare('UPDATE products SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      for (const item of items) {
        if (item.product_id) {
          restoreStock.run(item.quantity, item.product_id)
        }
      }
    }

    db.prepare(`
      UPDATE orders SET
        order_status = COALESCE(?, order_status),
        payment_status = COALESCE(?, payment_status),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      order_status,
      payment_status,
      notes,
      Number(id)
    )

    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(Number(id))

    return NextResponse.json({ success: true, order: updated })
  } catch (error) {
    console.error('Failed to update order:', error)
    return NextResponse.json({ error: 'ไม่สามารถแก้ไขสถานะคำสั่งซื้อได้' }, { status: 500 })
  }
}
