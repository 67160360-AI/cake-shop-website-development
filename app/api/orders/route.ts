import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const db = getDb()
    let query = `
      SELECT o.*, 
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
        (SELECT GROUP_CONCAT(product_name || ' x' || quantity, ', ') FROM order_items WHERE order_id = o.id) as items_summary
      FROM orders o
      WHERE 1=1
    `
    const params: (string | number)[] = []

    if (status && status !== 'all') {
      query += ` AND o.order_status = ?`
      params.push(status)
    }

    if (search && search.trim() !== '') {
      query += ` AND (o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_phone LIKE ?)`
      params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`)
    }

    query += ` ORDER BY o.id DESC`

    const orders = db.prepare(query).all(...params)

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Failed to get orders:', error)
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลคำสั่งซื้อได้' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      customer_name,
      customer_phone,
      customer_email,
      shipping_address,
      delivery_date,
      delivery_note,
      payment_method,
      items,
      promo_code,
    } = body

    if (!customer_name || !customer_phone || !shipping_address || !items || !items.length) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลชื่อ, เบอร์โทร, ที่อยู่จัดส่ง และเลือกสินค้า' },
        { status: 400 }
      )
    }

    const db = getDb()

    // Retrieve store settings for shipping calculation
    const settingsRows = db.prepare('SELECT key, value FROM store_settings').all() as { key: string; value: string }[]
    const settings = Object.fromEntries(settingsRows.map(r => [r.key, r.value]))
    const baseShippingFee = Number(settings.shipping_base_fee || 80)
    const freeShippingThreshold = Number(settings.shipping_free_threshold || 1200)

    // Verify stock and compute verified subtotal
    let verifiedSubtotal = 0
    const verifiedItems: any[] = []

    for (const item of items) {
      const product = db.prepare('SELECT id, name, price, stock, status, image_url FROM products WHERE id = ?').get(item.product_id) as any

      if (!product || product.status !== 'active') {
        return NextResponse.json(
          { error: `สินค้า "${item.product_name || 'ที่เลือก'}" ไม่มีจำหน่ายหรือไม่พบในระบบ` },
          { status: 400 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `สินค้า "${product.name}" คงเหลือเพียง ${product.stock} ชิ้น ไม่เพียงพอต่อการสั่งซื้อ` },
          { status: 400 }
        )
      }

      const itemSubtotal = product.price * item.quantity
      verifiedSubtotal += itemSubtotal
      verifiedItems.push({
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: item.quantity,
        size_option: item.size_option || '1 ปอนด์',
        custom_message: item.custom_message || '',
        subtotal: itemSubtotal,
        image_url: product.image_url,
      })
    }

    // Shipping calculation
    const shippingFee = verifiedSubtotal >= freeShippingThreshold ? 0 : baseShippingFee

    // Promo code discount verification
    let discountAmount = 0
    let validPromoCode = ''

    if (promo_code && promo_code.trim() !== '') {
      const promo = db.prepare(`
        SELECT * FROM promotions 
        WHERE code = ? AND is_active = 1
      `).get(promo_code.trim().toUpperCase()) as any

      if (promo && verifiedSubtotal >= promo.min_spend) {
        validPromoCode = promo.code
        if (promo.discount_type === 'percent') {
          discountAmount = Math.round((verifiedSubtotal * promo.discount_value) / 100)
        } else {
          discountAmount = Number(promo.discount_value)
        }
      }
    }

    const totalAmount = Math.max(0, verifiedSubtotal + shippingFee - discountAmount)

    // Generate Unique Order Number: LN-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const randomPart = Math.floor(1000 + Math.random() * 9000)
    const orderNumber = `LN-${dateStr}-${randomPart}`

    // Insert order & order_items, decrement stock in transaction
    db.exec('BEGIN TRANSACTION;')
    try {
      const orderInsert = db.prepare(`
        INSERT INTO orders (
          order_number, customer_name, customer_phone, customer_email,
          shipping_address, delivery_date, delivery_note, payment_method,
          payment_status, order_status, subtotal, shipping_fee,
          discount_amount, total_amount, promo_code, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        orderNumber,
        customer_name.trim(),
        customer_phone.trim(),
        customer_email?.trim() || '',
        shipping_address.trim(),
        delivery_date || new Date().toISOString().slice(0, 10),
        delivery_note?.trim() || '',
        payment_method || 'promptpay',
        'pending',
        'pending_payment',
        verifiedSubtotal,
        shippingFee,
        discountAmount,
        totalAmount,
        validPromoCode,
        ''
      )

      const orderId = orderInsert.lastInsertRowid

      const insertItem = db.prepare(`
        INSERT INTO order_items (
          order_id, product_id, product_name, price,
          quantity, size_option, custom_message, subtotal, image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      const updateStock = db.prepare(`
        UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `)

      for (const item of verifiedItems) {
        insertItem.run(
          orderId,
          item.product_id,
          item.product_name,
          item.price,
          item.quantity,
          item.size_option,
          item.custom_message,
          item.subtotal,
          item.image_url
        )
        // Deduct stock
        updateStock.run(item.quantity, item.product_id)
      }

      db.exec('COMMIT;')

      return NextResponse.json(
        {
          success: true,
          order_number: orderNumber,
          order_id: orderId,
          total_amount: totalAmount,
          message: 'สร้างคำสั่งซื้อสำเร็จ',
        },
        { status: 201 }
      )
    } catch (txError) {
      db.exec('ROLLBACK;')
      throw txError
    }
  } catch (error) {
    console.error('Failed to create order:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง' }, { status: 500 })
  }
}
