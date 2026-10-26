'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Sparkles, Tag, ShieldCheck, Truck, Clock, Heart } from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { CartDrawer } from '@/components/storefront/cart-drawer'
import { ProductCard, Product } from '@/components/storefront/product-card'
import { QuickViewModal } from '@/components/storefront/quick-view-modal'

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [promotions, setPromotions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        const [prodRes, promoRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/promotions'),
        ])
        const prodData = await prodRes.json()
        const promoData = await promoRes.json()

        if (prodData.products) setProducts(prodData.products)
        if (prodData.categories) setCategories(prodData.categories)
        if (promoData.promotions) setPromotions(promoData.promotions)
      } catch (err) {
        console.error('Failed to load homepage data', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(
        (p) => p.category_name?.toLowerCase() === activeCategory.toLowerCase()
      )

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf8f3] text-[#35231f]">
      <Navbar />
      <CartDrawer />
      <QuickViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-12 lg:py-20 border-b border-[#35231f]/10">
          <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
              {/* Left Text */}
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#f4e6e4] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#b76b67] mb-6">
                  <Sparkles className="size-3.5" />
                  <span>Artisanal Small-Batch Bakery</span>
                </div>

                <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-[#35231f]">
                  ส่งต่อความหวาน<br />
                  <em className="font-normal text-[#b76b67] not-italic">อบสดใหม่ด้วยใจ</em><br />
                  ในทุกวันสำคัญ
                </h1>

                <p className="mt-6 text-sm sm:text-base leading-relaxed text-[#35231f]/70 max-w-lg">
                  Lune Bakery คัดสรรเค้กเนื้อสัมผัสนุ่มละมุน ครีมสดแท้หวานน้อย และวัตถุดิบชั้นเลิศ ให้ทุกคำเป็นช่วงเวลาแห่งความสุขที่คุณและคนที่คุณรักไม่มีวันลืม
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-3 rounded-full bg-[#35231f] px-7 py-4 text-sm font-semibold text-[#fbf8f3] shadow-lg hover:bg-[#b76b67] transition-all hover:scale-105 active:scale-95"
                  >
                    เลือกซื้อเค้กทั้งหมด
                    <ArrowRight className="size-4" />
                  </Link>
                  <a
                    href="#categories"
                    className="inline-flex items-center gap-2 rounded-full border border-[#35231f]/20 bg-white/60 px-6 py-4 text-sm font-semibold text-[#35231f] hover:bg-white transition-colors"
                  >
                    ดูหมวดหมู่สินค้า
                  </a>
                </div>

                {/* Micro guarantees */}
                <div className="mt-10 grid grid-cols-3 gap-4 pt-8 border-t border-[#35231f]/10 text-xs text-[#35231f]/75">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-[#b76b67]" />
                    <span>อบสดวันต่อวัน</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="size-4 text-[#b76b67]" />
                    <span>รถเย็นส่งถึงบ้าน</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-[#b76b67]" />
                    <span>วัตถุดิบพรีเมียม</span>
                  </div>
                </div>
              </div>

              {/* Right Hero Image Card */}
              <div className="relative">
                <div className="relative aspect-[1.15] overflow-hidden rounded-[2.5rem] bg-[#ead4ca] shadow-2xl border-4 border-white/80">
                  <Image
                    src="/cake-hero.png"
                    alt="Strawberry Cloud Signature Cake"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                    <div className="rounded-2xl bg-white/90 backdrop-blur-md px-5 py-3 shadow-lg">
                      <p className="text-[10px] tracking-wider uppercase font-semibold text-[#b76b67]">
                        Signature Creation
                      </p>
                      <p className="font-serif text-lg font-bold text-[#35231f]">
                        Strawberry Cloud Cake
                      </p>
                    </div>

                    <div className="rounded-full bg-[#35231f] text-white px-4 py-2 font-serif text-sm font-semibold shadow-lg">
                      ฿890
                    </div>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-3.5 shadow-xl border border-[#35231f]/10 flex items-center gap-3 animate-bounce duration-1000">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#faeae8] text-[#b76b67]">
                    <Heart className="size-5 fill-[#b76b67]" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#35231f]">100% Homemade</p>
                    <p className="text-[10px] text-[#35231f]/60">Pure Butter & Fresh Berries</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section id="categories" className="py-16 border-b border-[#35231f]/10 bg-white/40">
          <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#b76b67] font-semibold mb-2">
                  Browse by category
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#35231f]">
                  หมวดหมู่เค้กยอดนิยม
                </h2>
              </div>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#b76b67] hover:underline"
              >
                ดูเค้กทั้งหมด ({products.length} เมนู) <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.name)
                    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className={`${cat.tone || 'bg-[#f5d8d7]'} group rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer`}
                >
                  <span className="text-2xl text-[#35231f]/70 group-hover:scale-110 inline-block transition-transform">
                    {cat.icon || '✦'}
                  </span>
                  <h3 className="mt-4 text-xs sm:text-sm font-semibold text-[#35231f] leading-snug">
                    {cat.name}
                  </h3>
                  <span className="mt-1 block text-[10px] sm:text-xs text-[#35231f]/60">
                    {cat.count_label || 'เลือกชม'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section id="collection" className="py-20">
          <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#b76b67] font-semibold mb-2">
                  Curated Collection
                </p>
                <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#35231f]">
                  เมนูเค้กแนะนำประจำฤดูกาล
                </h2>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveCategory('All')}
                  className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                    activeCategory === 'All'
                      ? 'bg-[#35231f] text-white shadow-sm'
                      : 'bg-white text-[#35231f]/70 hover:bg-[#f0e8df] border border-[#35231f]/10'
                  }`}
                >
                  ทั้งหมด
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                      activeCategory === cat.name
                        ? 'bg-[#35231f] text-white shadow-sm'
                        : 'bg-white text-[#35231f]/70 hover:bg-[#f0e8df] border border-[#35231f]/10'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="animate-pulse bg-white rounded-3xl p-4 h-96 border border-[#35231f]/5">
                    <div className="bg-[#e8dece] rounded-2xl h-52 w-full" />
                    <div className="mt-4 h-4 bg-[#e8dece] rounded w-3/4" />
                    <div className="mt-2 h-3 bg-[#e8dece] rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white/60 rounded-3xl border border-[#35231f]/10">
                <p className="font-serif text-lg text-[#35231f]/60">
                  ไม่พบสินค้าในหมวดหมู่นี้
                </p>
                <button
                  onClick={() => setActiveCategory('All')}
                  className="mt-4 text-xs text-[#b76b67] underline"
                >
                  ดูเค้กทั้งหมด
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Promotions Banner Section */}
        {promotions.length > 0 && (
          <section id="promotions" className="py-12 bg-[#f4ece1] border-y border-[#35231f]/10">
            <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
              <div className="rounded-3xl bg-gradient-to-r from-[#35231f] to-[#4c352f] text-[#fbf8f3] p-8 sm:p-12 relative overflow-hidden shadow-xl">
                <div className="relative z-10 max-w-xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/30 px-3.5 py-1 text-xs text-[#e5c468] mb-4 font-medium">
                    <Tag className="size-3.5" />
                    คูปองส่วนลดพิเศษ
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
                    มอบความพิเศษให้วันเกิดและปาร์ตี้ของคุณ
                  </h2>
                  <p className="mt-3 text-xs sm:text-sm text-[#fbf8f3]/80 leading-relaxed">
                    ใส่โค้ดส่วนลดในหน้าชำระเงินเพื่อรับสิทธิ์ทันที
                  </p>

                  <div className="mt-6 flex flex-wrap gap-4">
                    {promotions.map((p) => (
                      <div
                        key={p.code}
                        className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[200px]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-base font-bold text-[#e5c468] tracking-wider">
                            {p.code}
                          </span>
                          <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full text-white">
                            {p.discount_type === 'percent' ? `ลด ${p.discount_value}%` : `ลด ฿${p.discount_value}`}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/70 mt-1">{p.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden lg:block">
                  <span className="font-serif text-[180px] font-bold">LUNE</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Story Section */}
        <section id="story" className="py-20">
          <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="rounded-[2.5rem] bg-[#efe7db] p-8 sm:p-14 border border-[#35231f]/10 shadow-inner">
                <span className="font-serif text-6xl leading-none text-[#b76b67]">“</span>
                <p className="mt-4 font-serif text-2xl sm:text-3xl leading-snug font-semibold text-[#35231f]">
                  เราเชื่อว่าเค้กที่ดีไม่ใช่แค่เรื่องของความสวยงาม แต่คือรสชาติที่จริงใจและสัมผัสความสุขที่ส่งต่อได้ถึงทุกคนรอบโต๊ะ
                </p>
                <div className="mt-8 pt-6 border-t border-[#35231f]/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold tracking-wider uppercase text-[#35231f]">
                      Mina & Team
                    </p>
                    <p className="text-[11px] text-[#35231f]/60">Head Pastry Chef & Founder</p>
                  </div>
                  <span className="font-serif text-xl text-[#b76b67] italic">Lune Bakery</span>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-xs uppercase tracking-widest text-[#b76b67] font-semibold">
                  Our Philosophy
                </p>
                <h2 className="font-serif text-4xl sm:text-5xl font-bold leading-tight">
                  ความใส่ใจในทุกขั้นตอน<br />
                  <span className="text-[#b76b67] font-normal italic">อบใหม่ทุกวัน</span>
                </h2>
                <p className="text-sm leading-relaxed text-[#35231f]/75">
                  ที่ Lune Bakery เราควบคุมคุณภาพตั้งแต่การคัดเลือกเนยสดแท้ ไม่ใช้ไขมันทรานส์ ใช้ไข่ไก่สดอารมณ์ดี และผลไม้สดตามฤดูกาล ทำให้เค้กของเรามีกลิ่นหอมเป็นเอกลักษณ์และรสชาติหวานพอดี ไม่เลี่ยน
                </p>
                <div className="pt-2">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#35231f] hover:text-[#b76b67] transition-colors underline underline-offset-8"
                  >
                    สั่งเค้กสำหรับวันสำคัญของคุณ &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
