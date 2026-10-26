'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, Eye, Sparkles, Check } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

export interface Product {
  id: number
  name: string
  slug: string
  category_id: number
  category_name?: string
  price: number
  original_price?: number | null
  description: string
  details_json?: string
  stock: number
  status: string
  tag?: string
  tone?: string
  image_url: string
}

interface ProductCardProps {
  product: Product
  onQuickView?: (product: Product) => void
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const isOutOfStock = product.stock <= 0 || product.status !== 'active'

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) return

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.original_price,
      quantity: 1,
      sizeOption: '1 ปอนด์',
      customMessage: '',
      imageUrl: product.image_url,
      stock: product.stock,
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  // Card tone background
  const toneBg =
    product.tone === 'cocoa'
      ? 'bg-[#d8c2b3]'
      : product.tone === 'lemon'
      ? 'bg-[#ebdcb4]'
      : product.tone === 'matcha'
      ? 'bg-[#d2ded0]'
      : product.tone === 'peach'
      ? 'bg-[#eed4c8]'
      : 'bg-[#ebd3d1]'

  return (
    <div className="group flex flex-col bg-white rounded-3xl p-3.5 border border-[#35231f]/8 hover:border-[#b76b67]/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Image Container */}
      <div className={`relative aspect-[1.05] rounded-2xl overflow-hidden ${toneBg} transition-transform`}>
        <Image
          src={product.image_url || '/cake-hero.png'}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Soft radial glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

        {/* Tag */}
        {product.tag && (
          <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-[#35231f] shadow-xs flex items-center gap-1">
            <Sparkles className="size-3 text-[#b76b67]" />
            {product.tag}
          </span>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
            <span className="rounded-full bg-red-600/90 text-white text-xs font-semibold px-4 py-1.5 shadow-md">
              สินค้าหมดชั่วคราว
            </span>
          </div>
        )}

        {/* Hover Quick Action Buttons */}
        {!isOutOfStock && (
          <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
            {onQuickView && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onQuickView(product)
                }}
                className="size-9 rounded-full bg-white/90 hover:bg-white text-[#35231f] shadow-md grid place-items-center transition-transform hover:scale-110"
                title="ดูรายละเอียดเพิ่มเติม"
              >
                <Eye className="size-4" />
              </button>
            )}
            <button
              onClick={handleQuickAdd}
              className="size-9 rounded-full bg-[#35231f] hover:bg-[#b76b67] text-white shadow-md grid place-items-center transition-transform hover:scale-110"
              title="เพิ่มลงตะกร้าทันที"
            >
              {added ? <Check className="size-4 text-emerald-400" /> : <Plus className="size-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pt-4 pb-2 px-1 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs text-[#35231f]/55 mb-1">
            <span>{product.category_name || 'Artisanal Cake'}</span>
            {!isOutOfStock && (
              <span className={`text-[10px] ${product.stock <= 5 ? 'text-amber-600 font-medium' : 'text-[#35231f]/50'}`}>
                {product.stock <= 5 ? `เหลือเพียง ${product.stock} ชิ้น` : `มีสินค้า (${product.stock})`}
              </span>
            )}
          </div>

          <Link href={`/products/${product.slug || product.id}`}>
            <h3 className="font-serif text-lg font-semibold text-[#35231f] hover:text-[#b76b67] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="mt-1 text-xs text-[#35231f]/65 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[#35231f]/6 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-lg font-bold text-[#35231f]">
              ฿{product.price.toLocaleString()}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-xs text-[#35231f]/40 line-through">
                ฿{product.original_price.toLocaleString()}
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className="rounded-full bg-[#35231f]/5 hover:bg-[#35231f] text-[#35231f] hover:text-white px-3.5 py-1.5 text-xs font-medium transition-all disabled:opacity-40 disabled:hover:bg-[#35231f]/5 disabled:hover:text-[#35231f]"
          >
            {isOutOfStock ? 'สินค้าหมด' : added ? 'เพิ่มแล้ว ✓' : '+ สั่งซื้อ'}
          </button>
        </div>
      </div>
    </div>
  )
}
