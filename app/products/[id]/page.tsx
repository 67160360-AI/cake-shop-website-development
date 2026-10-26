'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Heart, Truck, Check } from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { CartDrawer } from '@/components/storefront/cart-drawer'
import { ProductCard, Product } from '@/components/storefront/product-card'
import { useCart } from '@/lib/cart-context'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const { addItem } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [selectedSize, setSelectedSize] = useState('1 ปอนด์')
  const [customMessage, setCustomMessage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    async function loadProduct() {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/products/${id}`)
        if (!res.ok) {
          throw new Error('Not found')
        }
        const data = await res.json()
        setProduct(data.product)
        setRelated(data.related || [])
      } catch (err) {
        console.error('Failed to load product', err)
      } finally {
        setIsLoading(false)
      }
    }
    if (id) loadProduct()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fbf8f3] text-[#35231f]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="flex items-center gap-2 text-sm font-medium text-[#b76b67]">
            <Sparkles className="size-5 animate-spin" />
            <span>กำลังโหลดข้อมูลเค้ก...</span>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fbf8f3] text-[#35231f]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center">
          <h1 className="font-serif text-3xl font-bold">ไม่พบเค้กที่คุณกำลังมองหา</h1>
          <p className="mt-2 text-xs text-[#35231f]/60 max-w-sm">
            สินค้าชิ้นนี้อาจถูกย้าย หรือไม่มีจำหน่ายในขณะนี้
          </p>
          <Link
            href="/products"
            className="mt-6 rounded-full bg-[#35231f] text-white px-6 py-3 text-xs font-semibold hover:bg-[#b76b67] transition-colors"
          >
            &larr; กลับไปหน้ารวมเค้ก
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  let parsedDetails: any = {}
  try {
    if (product.details_json) {
      parsedDetails = JSON.parse(product.details_json)
    }
  } catch (e) {
    parsedDetails = {}
  }

  const sizes = parsedDetails.sizes || ['0.5 ปอนด์', '1 ปอนด์', '2 ปอนด์']
  const flavors = parsedDetails.flavors || ['รสชาติคลาสสิกสูตรเฉพาะของ Lune Bakery']
  const shelfLife = parsedDetails.shelf_life || 'ควรบริโภคภายใน 3-4 วัน เก็บรักษาในตู้เย็น 2-6 °C'
  const isOutOfStock = product.stock <= 0 || product.status !== 'active'

  const handleAddToCart = () => {
    if (isOutOfStock) return

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.original_price,
      quantity,
      sizeOption: selectedSize,
      customMessage: customMessage.trim(),
      imageUrl: product.image_url,
      stock: product.stock,
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const handleBuyNow = () => {
    if (isOutOfStock) return

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.original_price,
      quantity,
      sizeOption: selectedSize,
      customMessage: customMessage.trim(),
      imageUrl: product.image_url,
      stock: product.stock,
    })

    router.push('/checkout')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf8f3] text-[#35231f]">
      <Navbar />
      <CartDrawer />

      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-2 text-xs text-[#35231f]/60">
            <Link href="/" className="hover:text-[#b76b67]">หน้าแรก</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-[#b76b67]">เค้กทั้งหมด</Link>
            <span>/</span>
            <span className="text-[#35231f] font-medium truncate">{product.name}</span>
          </div>

          {/* Main Detail Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Left: Product Image */}
            <div className="relative aspect-[1.1] rounded-3xl overflow-hidden bg-[#ead4ca] shadow-xl border-4 border-white/80">
              <Image
                src={product.image_url || '/cake-hero.png'}
                alt={product.name}
                fill
                priority
                className="object-cover"
              />
              {product.tag && (
                <span className="absolute top-5 left-5 rounded-full bg-white/95 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-[#35231f] shadow-md flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-[#b76b67]" />
                  {product.tag}
                </span>
              )}
            </div>

            {/* Right: Info & Actions */}
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#b76b67] font-semibold">
                  {product.category_name || 'Artisanal Cake'}
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold mt-1 text-[#35231f]">
                  {product.name}
                </h1>

                <div className="mt-4 flex items-baseline gap-3">
                  <span className="font-serif text-3xl font-bold text-[#35231f]">
                    ฿{product.price.toLocaleString()}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-base text-[#35231f]/40 line-through">
                      ฿{product.original_price.toLocaleString()}
                    </span>
                  )}
                  {!isOutOfStock ? (
                    <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
                      มีสินค้าพร้อมจัดส่ง ({product.stock} ชิ้น)
                    </span>
                  ) : (
                    <span className="text-xs text-red-600 bg-red-50 px-2.5 py-1 rounded-full font-medium">
                      สินค้าหมดชั่วคราว
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-b border-[#35231f]/10 py-5 space-y-4">
                <p className="text-xs sm:text-sm leading-relaxed text-[#35231f]/75">
                  {product.description}
                </p>

                {/* Size Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#35231f] mb-2 uppercase tracking-wide">
                    เลือกขนาดเค้ก:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s: string) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`px-4 py-2 text-xs rounded-xl font-medium border transition-colors ${
                          selectedSize === s
                            ? 'bg-[#35231f] text-white border-[#35231f] shadow-sm'
                            : 'bg-white text-[#35231f]/80 border-[#35231f]/15 hover:border-[#35231f]/40'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Message */}
                <div>
                  <label className="block text-xs font-bold text-[#35231f] mb-1.5 uppercase tracking-wide">
                    ข้อความเขียนบนหน้าเค้ก (ไม่บังคับ):
                  </label>
                  <input
                    type="text"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="เช่น Happy 25th Birthday Sarah 🎉"
                    maxLength={50}
                    className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-white px-4 py-3 text-[#35231f] focus:outline-none focus:ring-2 focus:ring-[#b76b67]"
                  />
                  <p className="text-[11px] text-[#35231f]/50 mt-1">
                    * ทางร้านจะเขียนด้วยแผ่นช็อกโกแลตฟองดองหรือบัตเตอร์ครีมอย่างประณีต
                  </p>
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-bold text-[#35231f] uppercase tracking-wide">จำนวนเค้ก:</span>
                  <div className="flex items-center border border-[#35231f]/20 rounded-full bg-white px-3 py-1.5">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="size-6 grid place-items-center text-[#35231f]/70 hover:text-[#35231f]"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                      className="size-6 grid place-items-center text-[#35231f]/70 hover:text-[#35231f] disabled:opacity-30"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full border-2 border-[#35231f] bg-white text-[#35231f] hover:bg-[#35231f]/5 py-3.5 text-xs font-bold transition-all disabled:opacity-40"
                >
                  {added ? (
                    <span className="text-emerald-700 flex items-center gap-1.5">
                      <Check className="size-4" /> เพิ่มในตะกร้าแล้ว
                    </span>
                  ) : (
                    <>
                      <ShoppingBag className="size-4" />
                      เพิ่มลงตะกร้า
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#35231f] text-white hover:bg-[#b76b67] py-3.5 text-xs font-bold transition-all shadow-md disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  สั่งซื้อทันที
                  <ArrowRight className="size-4" />
                </button>
              </div>

              {/* Product Specifications and Storage Info */}
              <div className="bg-white rounded-2xl p-5 border border-[#35231f]/10 space-y-3 text-xs text-[#35231f]/75">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="size-4 text-[#b76b67] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#35231f]">วัตถุดิบ & รสชาติ:</strong> {flavors.join(', ')}
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Truck className="size-4 text-[#b76b67] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#35231f]">การจัดส่ง:</strong> จัดส่งด้วยรถควบคุมอุณหภูมิทั่วกรุงเทพฯ แนะนำสั่งล่วงหน้า 1 วัน
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Heart className="size-4 text-[#b76b67] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#35231f]">การเก็บรักษา:</strong> {shelfLife}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Cakes */}
          {related.length > 0 && (
            <div className="mt-24 pt-16 border-t border-[#35231f]/10">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-8">
                เค้กอื่นๆ ในหมวดหมู่นี้ที่คุณอาจชื่นชอบ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
