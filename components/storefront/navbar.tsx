'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Menu, X, Search, Shield, Clock } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

interface NavbarProps {
  onSearchClick?: () => void
}

export function Navbar({ onSearchClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { totalCount, setIsCartOpen } = useCart()

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#35231f] text-[#fbf8f3] text-[11px] sm:text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <span className="inline-block size-1.5 rounded-full bg-[#d4af37] animate-pulse"></span>
        <span>✨ สั่งล่วงหน้า 1 วัน จัดส่งฟรีเมื่อมียอดสั่งซื้อครบ 1,200 บาท ทั่วกรุงเทพฯ</span>
      </div>

      <header className="sticky top-0 z-40 bg-[#fbf8f3]/90 backdrop-blur-md border-b border-[#35231f]/10 transition-all">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <span className="grid size-10 place-items-center rounded-full bg-[#35231f] text-lg font-serif text-[#fbf8f3] transition-transform duration-300 group-hover:scale-105">
                L
              </span>
              <div>
                <span className="font-serif text-xl tracking-tight block font-semibold text-[#35231f]">
                  Lune Bakery
                </span>
                <span className="text-[10px] tracking-[0.18em] uppercase text-[#b76b67] block -mt-1 font-medium">
                  Artisanal Cakes
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8 text-sm text-[#35231f]/75 font-medium">
              <Link href="/" className="hover:text-[#b76b67] transition-colors">
                หน้าแรก
              </Link>
              <Link href="/products" className="hover:text-[#b76b67] transition-colors">
                เค้กทั้งหมด
              </Link>
              <a href="/#categories" className="hover:text-[#b76b67] transition-colors">
                หมวดหมู่
              </a>
              <a href="/#promotions" className="hover:text-[#b76b67] transition-colors">
                โปรโมชั่น
              </a>
              <Link href="/order-lookup" className="hover:text-[#b76b67] transition-colors flex items-center gap-1.5 text-[#35231f]">
                <Clock className="size-3.5 text-[#b76b67]" />
                ติดตามสถานะคำสั่งซื้อ
              </Link>
              <a href="/#story" className="hover:text-[#b76b67] transition-colors">
                เกี่ยวกับเรา
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {onSearchClick && (
                <button
                  onClick={onSearchClick}
                  className="size-10 grid place-items-center rounded-full transition-colors hover:bg-[#f0e8df] text-[#35231f]/80"
                  aria-label="ค้นหาสินค้า"
                >
                  <Search className="size-5" strokeWidth={1.75} />
                </button>
              )}

              {/* Shopping Bag Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 rounded-full bg-[#35231f] text-[#fbf8f3] px-4 py-2.5 text-xs font-medium shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                aria-label={`ตะกร้าสินค้า ${totalCount} ชิ้น`}
              >
                <ShoppingBag className="size-4" strokeWidth={2} />
                <span className="hidden sm:inline">ตะกร้า</span>
                {totalCount > 0 && (
                  <span className="ml-0.5 rounded-full bg-[#b76b67] px-1.5 py-0.2 text-[10px] font-bold text-white min-w-4 text-center">
                    {totalCount}
                  </span>
                )}
              </button>

              {/* Admin Portal Link */}
              <Link
                href="/admin"
                className="hidden md:grid size-10 place-items-center rounded-full text-[#35231f]/60 hover:text-[#35231f] hover:bg-[#f0e8df] transition-colors"
                title="ระบบจัดการร้าน (Admin)"
              >
                <Shield className="size-4" strokeWidth={1.8} />
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden size-10 grid place-items-center rounded-full text-[#35231f] hover:bg-[#f0e8df] transition-colors"
                aria-label={mobileMenuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
              >
                {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#35231f]/10 bg-[#fbf8f3] px-6 py-6 space-y-4 text-sm font-medium animate-in fade-in slide-in-from-top-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#35231f] hover:text-[#b76b67]"
            >
              หน้าแรก
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#35231f] hover:text-[#b76b67]"
            >
              เค้กทั้งหมด (Shop All)
            </Link>
            <a
              href="/#categories"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#35231f] hover:text-[#b76b67]"
            >
              หมวดหมู่สินค้า
            </a>
            <a
              href="/#promotions"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#35231f] hover:text-[#b76b67]"
            >
              โปรโมชั่นและคูปอง
            </a>
            <Link
              href="/order-lookup"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#b76b67] font-semibold"
            >
              🔍 ตรวจสอบสถานะคำสั่งซื้อ
            </Link>
            <a
              href="/#story"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#35231f] hover:text-[#b76b67]"
            >
              เรื่องราวของเรา (Our Story)
            </a>
            <div className="pt-4 border-t border-[#35231f]/10">
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center gap-2 text-xs text-[#35231f]/70 hover:text-[#35231f]"
              >
                <Shield className="size-3.5" /> ระบบจัดการร้าน (Admin Dashboard)
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
