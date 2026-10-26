import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import fs from 'node:fs'
import bcrypt from 'bcryptjs'

let dbInstance: DatabaseSync | null = null

export function getDb(): DatabaseSync {
  if (dbInstance) {
    return dbInstance
  }

  const dbDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  const dbPath = path.join(dbDir, 'bakery.db')
  const db = new DatabaseSync(dbPath)

  // Initialize schema
  initSchema(db)
  dbInstance = db
  return db
}

function initSchema(db: DatabaseSync) {
  // WAL mode and foreign keys
  db.exec('PRAGMA foreign_keys = ON;')

  // Users table (Admin accounts)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      icon TEXT DEFAULT '✦',
      tone TEXT DEFAULT 'bg-[#f5d8d7]',
      count_label TEXT DEFAULT '0 cakes',
      display_order INTEGER DEFAULT 0
    );
  `)

  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      category_id INTEGER NOT NULL,
      price REAL NOT NULL,
      original_price REAL DEFAULT NULL,
      description TEXT NOT NULL,
      details_json TEXT DEFAULT '{}',
      stock INTEGER NOT NULL DEFAULT 10,
      status TEXT NOT NULL DEFAULT 'active', -- active, draft, archived
      tag TEXT DEFAULT '', -- 'Best seller', 'New', 'Signature'
      tone TEXT DEFAULT 'rose', -- rose, cocoa, lemon, matcha, peach
      image_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
  `)

  // Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT DEFAULT '',
      shipping_address TEXT NOT NULL,
      delivery_date TEXT NOT NULL,
      delivery_note TEXT DEFAULT '',
      payment_method TEXT NOT NULL, -- promptpay, bank_transfer, cod
      payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, verified, failed
      order_status TEXT NOT NULL DEFAULT 'pending_payment', -- pending_payment, payment_review, baking, shipping, completed, cancelled
      subtotal REAL NOT NULL,
      shipping_fee REAL NOT NULL DEFAULT 0,
      discount_amount REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL,
      promo_code TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Order Items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER,
      product_name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      size_option TEXT DEFAULT '1 ปอนด์',
      custom_message TEXT DEFAULT '',
      subtotal REAL NOT NULL,
      image_url TEXT DEFAULT '',
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );
  `)

  // Store Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Promotions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS promotions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      discount_type TEXT NOT NULL, -- 'percent' or 'fixed'
      discount_value REAL NOT NULL,
      min_spend REAL NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Admin Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)

  // Login Attempts (Rate limiting / Brute force prevention)
  db.exec(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT NOT NULL,
      attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      success INTEGER NOT NULL DEFAULT 0
    );
  `)

  // Seed default data if empty
  seedInitialData(db)
}

function seedInitialData(db: DatabaseSync) {
  // Check users
  const adminUser = db.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('admin')
  if (!adminUser) {
    const defaultEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@lunebakery.com'
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'AdminLune2026!'
    const passwordHash = bcrypt.hashSync(defaultPassword, 10)

    db.prepare(`
      INSERT INTO users (username, email, password_hash, role)
      VALUES (?, ?, ?, 'admin')
    `).run('admin', defaultEmail, passwordHash)
  }

  // Check categories
  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number }
  if (catCount.count === 0) {
    const initialCategories = [
      { name: 'Birthday cakes', slug: 'birthday-cakes', icon: '✦', tone: 'bg-[#f5d8d7]', count_label: '12 cakes', display_order: 1 },
      { name: 'Chocolate cakes', slug: 'chocolate-cakes', icon: '◒', tone: 'bg-[#e7d4c4]', count_label: '8 cakes', display_order: 2 },
      { name: 'Cheesecakes', slug: 'cheesecakes', icon: '○', tone: 'bg-[#f1e6c9]', count_label: '6 cakes', display_order: 3 },
      { name: 'Fruit cakes', slug: 'fruit-cakes', icon: '✿', tone: 'bg-[#e2e9dc]', count_label: '9 cakes', display_order: 4 },
      { name: 'Cupcakes', slug: 'cupcakes', icon: '❀', tone: 'bg-[#fae6df]', count_label: '14 cakes', display_order: 5 },
      { name: 'Custom cakes', slug: 'custom-cakes', icon: '★', tone: 'bg-[#e7dfeb]', count_label: 'ตามสั่ง', display_order: 6 },
    ]

    const insertCat = db.prepare(`
      INSERT INTO categories (name, slug, icon, tone, count_label, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    for (const cat of initialCategories) {
      insertCat.run(cat.name, cat.slug, cat.icon, cat.tone, cat.count_label, cat.display_order)
    }
  }

  // Check products
  const prodCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number }
  if (prodCount.count === 0) {
    const cats = db.prepare('SELECT id, name FROM categories').all() as { id: number; name: string }[]
    const catMap = new Map(cats.map(c => [c.name, c.id]))

    const initialProducts = [
      {
        name: 'Strawberry Cloud Signature',
        slug: 'strawberry-cloud-signature',
        category: 'Birthday cakes',
        price: 890,
        original_price: 990,
        description: 'เค้กวนิลาสปอนจ์เนื้อนุ่มละมุน สอดไส้แยมสตรอว์เบอร์รี่สดเคี่ยวเอง ท็อปด้วยวิปครีมสดแท้และผลสตรอว์เบอร์รี่หวานฉ่ำ',
        details_json: JSON.stringify({
          sizes: ['0.5 ปอนด์ (฿650)', '1 ปอนด์ (฿890)', '2 ปอนด์ (฿1,490)'],
          flavors: ['Classic Vanilla Sponge', 'Pistachio Sponge'],
          shelf_life: 'ควรบริโภคภายใน 3 วัน เก็บในตู้เย็น 2-6 °C',
        }),
        stock: 12,
        status: 'active',
        tag: 'Best seller',
        tone: 'rose',
        image_url: '/cake-hero.png',
      },
      {
        name: 'Dark Cocoa Muse',
        slug: 'dark-cocoa-muse',
        category: 'Chocolate cakes',
        price: 990,
        original_price: 1100,
        description: 'ดาร์กช็อกโกแลตฟัดจ์เค้กเข้มข้น 74% ช็อกโกแลตนำเข้าจากเบลเยียม เคลือบผิวกานาชเงางาม รสชาติเข้มข้นกลมกล่อม',
        details_json: JSON.stringify({
          sizes: ['1 ปอนด์ (฿990)', '2 ปอนด์ (฿1,650)'],
          flavors: ['74% Belgian Dark Fudge', 'Salted Caramel Crunch'],
          shelf_life: 'เก็บได้ 5 วันในตู้เย็น',
        }),
        stock: 8,
        status: 'active',
        tag: 'Signature',
        tone: 'cocoa',
        image_url: '/cake-hero.png',
      },
      {
        name: 'Yuzu Blossom Cheesecake',
        slug: 'yuzu-blossom-cheesecake',
        category: 'Cheesecakes',
        price: 790,
        original_price: 850,
        description: 'ชีสเค้กอบสไตล์นิวยอร์ก ผสมน้ำส้มยูซุแท้จากญี่ปุ่น เนื้อเนียนนุ่ม หอมสดชื่น ฐานครัมเบิลเนยสดกรุบกรอบ',
        details_json: JSON.stringify({
          sizes: ['1 ปอนด์ (฿790)', '2 ปอนด์ (฿1,390)'],
          flavors: ['Japanese Yuzu Curd', 'Original Cream Cheese'],
          shelf_life: 'เก็บได้ 4 วันในตู้เย็น',
        }),
        stock: 10,
        status: 'active',
        tag: 'Fresh pick',
        tone: 'lemon',
        image_url: '/cake-hero.png',
      },
      {
        name: 'Matcha Mont Blanc',
        slug: 'matcha-mont-blanc',
        category: 'Birthday cakes',
        price: 920,
        original_price: 990,
        description: 'เค้กชาเขียวมัทฉะเกรดพิธีการจากอุจิ สอดไส้ครีมเกาลัดบดหอมหวานและถั่วแดงกวนสูตรหวานน้อย',
        details_json: JSON.stringify({
          sizes: ['1 ปอนด์ (฿920)', '2 ปอนด์ (฿1,550)'],
          flavors: ['Uji Matcha Crepe', 'Chestnut Puree'],
          shelf_life: 'เก็บได้ 3 วันในตู้เย็น',
        }),
        stock: 6,
        status: 'active',
        tag: 'New',
        tone: 'matcha',
        image_url: '/cake-hero.png',
      },
      {
        name: 'Summer Peach Chiffon',
        slug: 'summer-peach-chiffon',
        category: 'Fruit cakes',
        price: 850,
        original_price: 900,
        description: 'ชิฟฟ่อนเค้กเนื้อฟูนุ่ม สอดไส้เนื้อพีชขาวญี่ปุ่นตุ๋นน้ำผึ้งและครีมมาสคาโปเนเบาละมุนลิ้น',
        details_json: JSON.stringify({
          sizes: ['1 ปอนด์ (฿850)', '2 ปอนด์ (฿1,400)'],
          flavors: ['White Peach Mascarpone'],
          shelf_life: 'เก็บได้ 3 วันในตู้เย็น',
        }),
        stock: 7,
        status: 'active',
        tag: 'Seasonal',
        tone: 'peach',
        image_url: '/cake-hero.png',
      },
      {
        name: 'Pastel Dream Cupcakes (Box of 6)',
        slug: 'pastel-dream-cupcakes-6',
        category: 'Cupcakes',
        price: 480,
        original_price: 520,
        description: 'เซ็ตคัพเค้ก 6 ชิ้นหลากรสชาติ แต่งหน้าครีมพาสเทลน่ารัก เหมาะสำหรับงานปาร์ตี้และเป็นของขวัญวันเกิด',
        details_json: JSON.stringify({
          sizes: ['กล่อง 6 ชิ้น (฿480)', 'กล่อง 12 ชิ้น (฿890)'],
          flavors: ['Mixed Berries, Lemon Vanilla, Chocolate Fudge'],
          shelf_life: 'เก็บได้ 3 วันในตู้เย็น',
        }),
        stock: 15,
        status: 'active',
        tag: 'Popular',
        tone: 'rose',
        image_url: '/cake-hero.png',
      },
      {
        name: 'Custom Celebration Cake (ตามสั่ง)',
        slug: 'custom-celebration-cake',
        category: 'Custom cakes',
        price: 1290,
        original_price: 1450,
        description: 'เค้กวันเกิดและงานเฉลิมฉลองสั่งทำพิเศษ สามารถระบุข้อความ ธีมสี และเลือกท็อปปิ้งดอกไม้สดหรือของตกแต่งได้',
        details_json: JSON.stringify({
          sizes: ['1 ปอนด์ (฿1,290)', '2 ปอนด์ (฿1,990)', '3 ปอนด์ (฿2,790)'],
          flavors: ['Vanilla Strawberry', 'Chocolate Fudge', 'Red Velvet Cheese'],
          shelf_life: 'เก็บได้ 3-4 วันในตู้เย็น',
        }),
        stock: 5,
        status: 'active',
        tag: 'Signature',
        tone: 'rose',
        image_url: '/cake-hero.png',
      },
    ]

    const insertProd = db.prepare(`
      INSERT INTO products (name, slug, category_id, price, original_price, description, details_json, stock, status, tag, tone, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    for (const p of initialProducts) {
      const catId = catMap.get(p.category) || 1
      insertProd.run(p.name, p.slug, catId, p.price, p.original_price, p.description, p.details_json, p.stock, p.status, p.tag, p.tone, p.image_url)
    }
  }

  // Store Settings
  const defaultSettings: Record<string, string> = {
    store_name: 'Lune Bakery',
    store_tagline: 'A little sweetness for today · ขนมเค้กอบสดใหม่ทุกวัน',
    store_phone: '02-890-1234',
    store_email: 'hello@lunebakery.com',
    store_address: '49 สุขุมวิท ซอย 49, แขวงคลองตันเหนือ, เขตวัฒนา, กรุงเทพฯ 10110',
    store_hours: 'เปิดบริการทุกวัน 08:30 - 19:30 น.',
    shipping_base_fee: '80',
    shipping_free_threshold: '1200',
    promptpay_number: '081-234-5678',
    promptpay_name: 'บจก. ลูน เบเกอรี่ (Lune Bakery Co., Ltd.)',
    bank_name: 'ธนาคารกสิกรไทย (KBANK)',
    bank_account_number: '098-7-65432-1',
    bank_account_name: 'บริษัท ลูน เบเกอรี่ จำกัด',
    announcement_banner: '✨ สั่งล่วงหน้า 1 วัน จัดส่งฟรีเมื่อมียอดสั่งซื้อครบ 1,200 บาท ทั่วกรุงเทพฯ',
  }

  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO store_settings (key, value) VALUES (?, ?)
  `)
  for (const [key, value] of Object.entries(defaultSettings)) {
    insertSetting.run(key, value)
  }

  // Promotions
  const promoCount = db.prepare('SELECT COUNT(*) as count FROM promotions').get() as { count: number }
  if (promoCount.count === 0) {
    const insertPromo = db.prepare(`
      INSERT INTO promotions (code, description, discount_type, discount_value, min_spend, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    insertPromo.run('LUNE10', 'ส่วนลด 10% สำหรับยอดสั่งซื้อ 800 บาทขึ้นไป', 'percent', 10, 800, 1)
    insertPromo.run('SWEET100', 'ส่วนลด 100 บาท เมื่อซื้อครบ 1,000 บาท', 'fixed', 100, 1000, 1)
  }
}
