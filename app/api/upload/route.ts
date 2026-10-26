import { NextResponse } from 'next/server'
import path from 'node:path'
import fs from 'node:fs'
import { getCurrentAdminUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต (สำหรับผู้ดูแลระบบ)' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'ไม่พบไฟล์รูปภาพ' }, { status: 400 })
    }

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'รูปแบบไฟล์ไม่ถูกต้อง รองรับเฉพาะ JPEG, PNG, WEBP, GIF, SVG' },
        { status: 400 }
      )
    }

    // Limit size: 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'ขนาดไฟล์รูปภาพต้องไม่เกิน 5MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const ext = path.extname(file.name) || '.jpg'
    const cleanFileName = `cake-${Date.now()}-${Math.floor(Math.random() * 10000)}${ext}`
    const filePath = path.join(uploadsDir, cleanFileName)

    fs.writeFileSync(filePath, buffer)

    return NextResponse.json({
      success: true,
      url: `/uploads/${cleanFileName}`,
      filename: cleanFileName,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ' }, { status: 500 })
  }
}
