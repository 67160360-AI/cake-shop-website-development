'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, subtotal, totalCount } = useCart()

  if (!isCartOpen) return null

  const freeShippingThreshold = 1200
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal)
  const shippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#fbf8f3] text-[#35231f] shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#35231f]/10">
            <div className="flex items-center gap-2">
              <ShoppingBag className="size-5 text-[#b76b67]" />
              <h2 className="font-serif text-xl font-medium">ตะกร้าของคุณ</h2>
              <span className="text-xs bg-[#f0e8df] px-2.5 py-0.5 rounded-full text-[#35231f]/70 font-medium">
                {totalCount} ชิ้น
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="size-8 grid place-items-center rounded-full hover:bg-[#f0e8df] text-[#35231f]/60 hover:text-[#35231f] transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="px-6 py-3.5 bg-[#f6eee3] border-b border-[#35231f]/5">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="flex items-center gap-1.5 text-[#35231f]">
                <Sparkles className="size-3.5 text-[#d4af37]" />
                {remainingForFreeShipping > 0 ? (
                  <>ซื้อเพิ่มอีก <strong className="text-[#b76b67]">฿{remainingForFreeShipping.toLocaleString()}</strong> เพื่อรับสิทธิ์จัดส่งฟรี</>
                ) : (
                  <span className="text-emerald-700 font-semibold">🎉 ยินดีด้วย! คุณได้รับสิทธิ์จัดส่งฟรี</span>
                )}
              </span>
              <span className="text-[#35231f]/60">{shippingProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#e8dece] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#b76b67] to-[#d4af37] transition-all duration-300 rounded-full"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#35231f]/5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                <div className="size-16 rounded-full bg-[#f0e8df] grid place-items-center mb-4 text-[#35231f]/40">
                  <ShoppingBag className="size-8" />
                </div>
                <p className="font-serif text-lg font-medium">ยังไม่มีสินค้าในตะกร้า</p>
                <p className="text-xs text-[#35231f]/60 mt-1 max-w-[240px]">
                  เลือกเค้กที่ชอบและเพิ่มลงตะกร้าเพื่อดำเนินการสั่งซื้อ
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 rounded-full bg-[#35231f] text-[#fbf8f3] px-6 py-2.5 text-xs font-medium hover:bg-[#b76b67] transition-colors"
                >
                  เลือกดูเค้กทั้งหมด
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4 items-start">
                  {/* Thumbnail */}
                  <div className="relative size-20 rounded-xl overflow-hidden bg-[#ead4ca] shrink-0 border border-[#35231f]/10">
                    <Image
                      src={item.imageUrl || '/cake-hero.png'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif text-sm font-semibold truncate leading-tight">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[#35231f]/40 hover:text-red-600 transition-colors shrink-0"
                        title="ลบออกจากตะกร้า"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-[#35231f]/60 mt-0.5">
                      ขนาด: {item.sizeOption}
                    </p>

                    {item.customMessage && (
                      <p className="text-[11px] text-[#b76b67] bg-[#f8ece9] px-2 py-0.5 rounded-md mt-1 inline-block truncate max-w-full">
                        ✍️ &quot;{item.customMessage}&quot;
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#35231f]/20 rounded-full bg-white px-2 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="size-5 grid place-items-center text-[#35231f]/70 hover:text-[#35231f]"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          disabled={item.quantity >= item.stock}
                          className="size-5 grid place-items-center text-[#35231f]/70 hover:text-[#35231f] disabled:opacity-30"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>

                      <span className="text-xs font-semibold text-[#35231f]">
                        ฿{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Summary and Checkout button */}
          {items.length > 0 && (
            <div className="border-t border-[#35231f]/10 p-6 bg-white space-y-4">
              <div className="space-y-1.5 text-xs text-[#35231f]/75">
                <div className="flex justify-between">
                  <span>ยอดรวมสินค้า</span>
                  <span className="font-medium text-[#35231f]">฿{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>ค่าจัดส่งประเมิน</span>
                  <span className="font-medium text-[#35231f]">
                    {subtotal >= freeShippingThreshold ? (
                      <span className="text-emerald-600 font-semibold">ฟรี</span>
                    ) : (
                      '฿80'
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-[#35231f] pt-2 border-t border-[#35231f]/10">
                  <span>ยอดสุทธิโดยประมาณ</span>
                  <span className="text-base text-[#b76b67]">
                    ฿{(subtotal + (subtotal >= freeShippingThreshold ? 0 : 80)).toLocaleString()}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-[#35231f] text-[#fbf8f3] py-3.5 px-6 text-sm font-medium hover:bg-[#b76b67] transition-all shadow-md active:scale-[0.99]"
              >
                ดำเนินการสั่งซื้อ (Checkout)
                <ArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
