'use client'

import React, { useEffect, useState } from 'react'
import { Search, Filter, Sparkles, ChevronDown } from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { CartDrawer } from '@/components/storefront/cart-drawer'
import { ProductCard, Product } from '@/components/storefront/product-card'
import { QuickViewModal } from '@/components/storefront/quick-view-modal'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('popular')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Read category from URL query if present
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const catParam = params.get('category')
      if (catParam) setSelectedCategory(catParam)
    }
  }, [])

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true)
        const params = new URLSearchParams()
        if (selectedCategory !== 'All') params.append('category', selectedCategory)
        if (searchQuery.trim()) params.append('search', searchQuery.trim())
        if (sortBy) params.append('sort', sortBy)

        const res = await fetch(`/api/products?${params.toString()}`)
        const data = await res.json()
        if (data.products) setProducts(data.products)
        if (data.categories) setCategories(data.categories)
      } catch (err) {
        console.error('Failed to fetch products', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [selectedCategory, searchQuery, sortBy])

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf8f3] text-[#35231f]">
      <Navbar />
      <CartDrawer />
      <QuickViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <main className="flex-1 py-10 lg:py-16">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
          {/* Header */}
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-widest text-[#b76b67] font-semibold">
              Our Fresh Bakes
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold mt-2 text-[#35231f]">
              เค้กและขนมหวานทั้งหมด
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-[#35231f]/70 leading-relaxed">
              เลือกชมเค้กทำมือขนาดพิเศษสำหรับวันเกิด งานเฉลิมฉลอง หรือเติมความสุขในทุกๆ วัน
            </p>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-[#35231f]/10 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#35231f]/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อเค้ก หรือรสชาติ..."
                className="w-full pl-11 pr-4 py-2.5 text-xs rounded-full bg-[#fbf8f3] border border-[#35231f]/10 focus:outline-none focus:ring-2 focus:ring-[#b76b67]"
              />
            </div>

            {/* Category Pills (Horizontal scroll on mobile) */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-[#35231f] text-white'
                    : 'bg-[#fbf8f3] text-[#35231f]/70 hover:bg-[#f0e8df]'
                }`}
              >
                ทั้งหมด
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.name
                      ? 'bg-[#35231f] text-white'
                      : 'bg-[#fbf8f3] text-[#35231f]/70 hover:bg-[#f0e8df]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <span className="text-xs text-[#35231f]/60">เรียงตาม:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs bg-[#fbf8f3] border border-[#35231f]/10 rounded-full px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-[#b76b67]"
              >
                <option value="popular">ยอดนิยม & แนะนำ</option>
                <option value="price_asc">ราคา: ต่ำ &rarr; สูง</option>
                <option value="price_desc">ราคา: สูง &rarr; ต่ำ</option>
                <option value="newest">เมนูมาใหม่ล่าสุด</option>
              </select>
            </div>
          </div>

          {/* Product Count Display */}
          <div className="flex items-center justify-between mb-6 text-xs text-[#35231f]/60 px-2">
            <span>พบสินค้าทั้งหมด <strong>{products.length}</strong> รายการ</span>
            {searchQuery && (
              <span>คำค้น: &quot;{searchQuery}&quot; <button onClick={() => setSearchQuery('')} className="text-[#b76b67] underline ml-1">ล้าง</button></span>
            )}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="animate-pulse bg-white rounded-3xl p-4 h-96 border border-[#35231f]/5">
                  <div className="bg-[#e8dece] rounded-2xl h-52 w-full" />
                  <div className="mt-4 h-4 bg-[#e8dece] rounded w-3/4" />
                  <div className="mt-2 h-3 bg-[#e8dece] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 bg-white/70 rounded-3xl border border-[#35231f]/10">
              <Sparkles className="size-8 text-[#b76b67] mx-auto mb-3" />
              <p className="font-serif text-xl font-medium text-[#35231f]">
                ไม่พบเค้กที่ตรงกับเงื่อนไขการค้นหา
              </p>
              <p className="text-xs text-[#35231f]/60 mt-1">
                ลองเปลี่ยนหมวดหมู่หรือคำค้นหาอื่นดูนะครับ
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All')
                  setSearchQuery('')
                }}
                className="mt-6 rounded-full bg-[#35231f] text-white px-6 py-2.5 text-xs font-semibold hover:bg-[#b76b67] transition-colors"
              >
                ดูเค้กทั้งหมด
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
