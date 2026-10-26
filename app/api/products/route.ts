import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getCurrentAdminUser } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') // 'price_asc', 'price_desc', 'newest', 'popular'
    const adminMode = searchParams.get('admin') === 'true'

    const db = getDb()
    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `
    const params: (string | number)[] = []

    if (!adminMode) {
      query += ` AND p.status = 'active'`
    }

    if (category && category !== 'All' && category !== 'All cakes') {
      query += ` AND (c.name = ? OR c.slug = ?)`
      params.push(category, category)
    }

    if (search && search.trim() !== '') {
      query += ` AND (p.name LIKE ? OR p.description LIKE ?)`
      params.push(`%${search.trim()}%`, `%${search.trim()}%`)
    }

    if (sort === 'price_asc') {
      query += ` ORDER BY p.price ASC`
    } else if (sort === 'price_desc') {
      query += ` ORDER BY p.price DESC`
    } else if (sort === 'newest') {
      query += ` ORDER BY p.created_at DESC`
    } else if (sort === 'popular') {
      query += ` ORDER BY CASE WHEN p.tag = 'Best seller' THEN 0 WHEN p.tag = 'Signature' THEN 1 ELSE 2 END, p.id DESC`
    } else {
      query += ` ORDER BY p.id ASC`
    }

    const products = db.prepare(query).all(...params)

    // Also get categories
    const categories = db.prepare('SELECT * FROM categories ORDER BY display_order ASC').all()

    return NextResponse.json({ products, categories })
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลสินค้าได้' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต (ต้องเป็นผู้ดูแลระบบ)' }, { status: 401 })
    }

    const body = await request.json()
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

    if (!name || !price || !category_id) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อสินค้า หมวดหมู่ และราคาให้ครบถ้วน' }, { status: 400 })
    }

    const db = getDb()

    // Generate unique slug
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || `cake-${Date.now()}`
    
    let slug = baseSlug
    let counter = 1
    while (db.prepare('SELECT id FROM products WHERE slug = ?').get(slug)) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const detailsJson = typeof details === 'string' ? details : JSON.stringify(details || {})

    const insertResult = db.prepare(`
      INSERT INTO products (
        name, slug, category_id, price, original_price,
        description, details_json, stock, status, tag,
        tone, image_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      name.trim(),
      slug,
      Number(category_id),
      Number(price),
      original_price ? Number(original_price) : null,
      description?.trim() || '',
      detailsJson,
      Number(stock ?? 10),
      status || 'active',
      tag || '',
      tone || 'rose',
      image_url || '/cake-hero.png'
    )

    const newProduct = db.prepare(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `).get(insertResult.lastInsertRowid)

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 })
  } catch (error) {
    console.error('Failed to create product:', error)
    return NextResponse.json({ error: 'ไม่สามารถเพิ่มสินค้าได้' }, { status: 500 })
  }
}
