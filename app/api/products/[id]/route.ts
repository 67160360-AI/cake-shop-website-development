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
    let product: any = null

    if (isNumeric) {
      product = db.prepare(`
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
      `).get(Number(id))
    } else {
      product = db.prepare(`
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.slug = ?
      `).get(id)
    }

    if (!product) {
      return NextResponse.json({ error: 'ไม่พบสินค้านี้' }, { status: 404 })
    }

    // Related products in the same category
    const related = db.prepare(`
      SELECT id, name, slug, price, original_price, image_url, tag, tone
      FROM products
      WHERE category_id = ? AND id != ? AND status = 'active'
      LIMIT 4
    `).all(product.category_id, product.id)

    return NextResponse.json({ product, related })
  } catch (error) {
    console.error('Failed to get product:', error)
    return NextResponse.json({ error: 'ไม่สามารถโหลดข้อมูลสินค้าได้' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const db = getDb()

    const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(Number(id))
    if (!existing) {
      return NextResponse.json({ error: 'ไม่พบสินค้าที่ต้องการแก้ไข' }, { status: 404 })
    }

    const {
      name,
      category_id,
      price,
      original_price,
      description,
      stock,
      status,
      tag,
      tone,
      image_url,
      details,
    } = body

    const detailsJson = typeof details === 'string' ? details : JSON.stringify(details || {})

    db.prepare(`
      UPDATE products SET
        name = COALESCE(?, name),
        category_id = COALESCE(?, category_id),
        price = COALESCE(?, price),
        original_price = ?,
        description = COALESCE(?, description),
        details_json = COALESCE(?, details_json),
        stock = COALESCE(?, stock),
        status = COALESCE(?, status),
        tag = COALESCE(?, tag),
        tone = COALESCE(?, tone),
        image_url = COALESCE(?, image_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name?.trim(),
      category_id ? Number(category_id) : null,
      price ? Number(price) : null,
      original_price !== undefined ? (original_price ? Number(original_price) : null) : null,
      description?.trim(),
      detailsJson,
      stock !== undefined ? Number(stock) : null,
      status,
      tag,
      tone,
      image_url,
      Number(id)
    )

    const updated = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(Number(id))

    return NextResponse.json({ success: true, product: updated })
  } catch (error) {
    console.error('Failed to update product:', error)
    return NextResponse.json({ error: 'ไม่สามารถอัปเดตสินค้าได้' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 })
    }

    const { id } = await params
    const productId = Number(id)
    const db = getDb()

    // Check if product is in any orders
    const orderItemCount = db.prepare(`
      SELECT COUNT(*) as count FROM order_items WHERE product_id = ?
    `).get(productId) as { count: number }

    if (orderItemCount.count > 0) {
      // Archive instead of hard delete to maintain order history
      db.prepare(`
        UPDATE products SET status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).run(productId)
      return NextResponse.json({
        success: true,
        archived: true,
        message: 'สินค้านี้มีประวัติในคำสั่งซื้อแล้ว ระบบจึงเปลี่ยนสถานะเป็น "จัดเก็บ (Archived)" เพื่อรักษาประวัติการสั่งซื้อ',
      })
    }

    // Otherwise safe to hard delete
    db.prepare('DELETE FROM products WHERE id = ?').run(productId)
    return NextResponse.json({ success: true, message: 'ลบสินค้าสำเร็จเรียบร้อยแล้ว' })
  } catch (error) {
    console.error('Failed to delete product:', error)
    return NextResponse.json({ error: 'ไม่สามารถลบสินค้าได้' }, { status: 500 })
  }
}
