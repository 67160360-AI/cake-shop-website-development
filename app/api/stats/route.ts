import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'

export async function GET() {
  try {
    const admin = await getCurrentAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต (สำหรับผู้ดูแลระบบ)' }, { status: 401 })
    }

    const db = getDb()

    const totalProducts = (db.prepare('SELECT COUNT(*) as count FROM products WHERE status != "archived"').get() as any).count
    const activeProducts = (db.prepare('SELECT COUNT(*) as count FROM products WHERE status = "active" AND stock > 0').get() as any).count
    const outOfStockProducts = (db.prepare('SELECT COUNT(*) as count FROM products WHERE stock = 0 OR status = "archived"').get() as any).count

    const totalOrders = (db.prepare('SELECT COUNT(*) as count FROM orders').get() as any).count
    const pendingOrders = (db.prepare(`
      SELECT COUNT(*) as count FROM orders 
      WHERE order_status IN ('pending_payment', 'payment_review')
    `).get() as any).count

    const totalRevenueResult = db.prepare(`
      SELECT SUM(total_amount) as revenue 
      FROM orders 
      WHERE payment_status IN ('paid', 'verified') OR order_status IN ('baking', 'shipping', 'completed')
    `).get() as any
    const totalRevenue = totalRevenueResult?.revenue || 0

    const recentOrders = db.prepare(`
      SELECT o.id, o.order_number, o.customer_name, o.customer_phone, o.total_amount, o.order_status, o.payment_status, o.created_at,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      ORDER BY o.id DESC
      LIMIT 6
    `).all()

    const lowStockProducts = db.prepare(`
      SELECT id, name, stock, price, image_url, tag
      FROM products
      WHERE stock <= 5 AND status = 'active'
      ORDER BY stock ASC
      LIMIT 5
    `).all()

    return NextResponse.json({
      stats: {
        totalProducts,
        activeProducts,
        outOfStockProducts,
        totalOrders,
        pendingOrders,
        totalRevenue,
      },
      recentOrders,
      lowStockProducts,
    })
  } catch (error) {
    console.error('Failed to get dashboard stats:', error)
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลสรุปได้' }, { status: 500 })
  }
}
