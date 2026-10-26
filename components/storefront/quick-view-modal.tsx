'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, Check } from 'lucide-react'
import { Product } from './product-card'
import { useCart } from '@/lib/cart-context'
import { useRouter } from 'next/navigation'

interface QuickViewModalProps {
  product: Product | null
  onClose: () => void
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const [selectedSize, setSelectedSize] = useState('1 ปอนด์')
  const [customMessage, setCustomMessage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!product) return null

  let parsedDetails: any = {}
  try {
    if (product.details_json) {
      parsedDetails = JSON.parse(product.details_json)
    }
  } catch (e) {
    parsedDetails = {}
  }

  const sizes = parsedDetails.sizes || ['0.5 ปอนด์', '1 ปอนด์', '2 ปอนด์']
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

    setIsSuccess(true)
    setTimeout(() => {
      setIsSuccess(false)
      onClose()
    }, 800)
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

    onClose()
    router.push('/checkout')
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-2xl rounded-3xl bg-[#fbf8f3] text-[#35231f] shadow-2xl border border-[#35231f]/10 overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 size-9 rounded-full bg-white/80 hover:bg-white text-[#35231f] shadow-sm grid place-items-center transition-colors"
          >
            <X className="size-4" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image Side */}
            <div className="relative aspect-square md:aspect-auto md:h-full bg-[#ead4ca] min-h-[260px]">
              <Image
                src={product.image_url || '/cake-hero.png'}
                alt={product.name}
                fill
                className="object-cover"
              />
              {product.tag && (
                <span className="absolute top-4 left-4 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-medium text-[#35231f] shadow-xs flex items-center gap-1.5">
                  <Sparkles className="size-3 text-[#b76b67]" />
                  {product.tag}
                </span>
              )}
            </div>

            {/* Info Side */}
            <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#b76b67] font-medium">
                  {product.category_name || 'Artisanal Collection'}
                </p>
                <h2 className="font-serif text-2xl font-bold mt-1 text-[#35231f]">
                  {product.name}
                </h2>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-serif text-2xl font-bold text-[#35231f]">
                    ฿{product.price.toLocaleString()}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-sm text-[#35231f]/40 line-through">
                      ฿{product.original_price.toLocaleString()}
                    </span>
                  )}
                  <span className="text-xs text-[#35231f]/60 ml-2">
                    (คงเหลือ {product.stock} ชิ้น)
                  </span>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-[#35231f]/70">
                  {product.description}
                </p>

                {/* Size Selector */}
                <div className="mt-5">
                  <label className="block text-xs font-semibold text-[#35231f] mb-2">
                    เลือกขนาดเค้ก:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s: string) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1.5 text-xs rounded-xl font-medium border transition-colors ${
                          selectedSize === s
                            ? 'bg-[#35231f] text-white border-[#35231f]'
                            : 'bg-white text-[#35231f]/80 border-[#35231f]/15 hover:border-[#35231f]/40'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Message Input */}
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-[#35231f] mb-1">
                    ข้อความเขียนบนหน้าเค้ก (ไม่บังคับ):
                  </label>
                  <input
                    type="text"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="เช่น Happy Birthday Sarah (ไม่เกิน 30 ตัวอักษร)"
                    maxLength={40}
                    className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-white px-3 py-2 text-[#35231f] focus:outline-none focus:ring-2 focus:ring-[#b76b67]"
                  />
                </div>

                {/* Quantity */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#35231f]">จำนวน:</span>
                  <div className="flex items-center border border-[#35231f]/20 rounded-full bg-white px-2 py-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="size-6 grid place-items-center text-[#35231f]/70 hover:text-[#35231f]"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-semibold">{quantity}</span>
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
              <div className="space-y-2 pt-2">
                <div className="flex gap-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="flex-1 flex items-center justify-center gap-2 rounded-full border border-[#35231f] bg-white text-[#35231f] hover:bg-[#35231f]/5 py-3 text-xs font-semibold transition-all disabled:opacity-40"
                  >
                    {isSuccess ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <Check className="size-4" /> เพิ่มแล้ว
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
                    className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#35231f] text-white hover:bg-[#b76b67] py-3 text-xs font-semibold transition-all shadow-md disabled:opacity-40"
                  >
                    สั่งซื้อทันที
                    <ArrowRight className="size-4" />
                  </button>
                </div>

                <div className="text-center">
                  <Link
                    href={`/products/${product.slug || product.id}`}
                    onClick={onClose}
                    className="text-[11px] text-[#b76b67] hover:underline"
                  >
                    ดูรายละเอียดสินค้าแบบเต็มหน้า &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
