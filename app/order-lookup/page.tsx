'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Clock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'

export default function OrderLookupPage() {
  const router = useRouter()
  const [orderQuery, setOrderQuery] = useState('')
  const [error, setError] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const query = orderQuery.trim()
    if (!query) {
      setError('กรุณาระบุหมายเลขคำสั่งซื้อ (เช่น LN-20261026-1234)')
      return
    }

    try {
      setIsSearching(true)
      const res = await fetch(`/api/orders/${encodeURIComponent(query)}`)
      if (!res.ok) {
        setError('ไม่พบคำสั่งซื้อที่ระบุ กรุณาตรวจสอบตัวสะกดหรือหมายเลขคำสั่งซื้ออีกครั้ง')
        setIsSearching(false)
        return
      }

      router.push(`/order/${encodeURIComponent(query)}`)
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการตรวจสอบ กรุณาลองใหม่อีกครั้ง')
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf8f3] text-[#35231f]">
      <Navbar />

      <main className="flex-1 py-16 lg:py-24">
        <div className="mx-auto max-w-[600px] px-6 text-center">
          <div className="size-16 rounded-full bg-[#f4eae6] text-[#b76b67] grid place-items-center mx-auto mb-4">
            <Clock className="size-8" />
          </div>

          <span className="text-xs uppercase tracking-widest text-[#b76b67] font-semibold">
            Track Your Fresh Cake
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mt-2 text-[#35231f]">
            ตรวจสอบสถานะคำสั่งซื้อ
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#35231f]/70">
            กรอกหมายเลขคำสั่งซื้อของคุณ เพื่อดูสถานะการอบและการจัดส่งเค้กแบบเรียลไทม์
          </p>

          <form onSubmit={handleLookup} className="mt-8 bg-white p-6 sm:p-8 rounded-3xl border border-[#35231f]/10 shadow-sm text-left space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#35231f] mb-1.5 uppercase tracking-wide">
                หมายเลขคำสั่งซื้อ (Order Number)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  placeholder="เช่น LN-20261026-1234"
                  className="w-full text-xs font-mono uppercase tracking-wider rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] pl-4 pr-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#b76b67]"
                />
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-[#35231f]/40" />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSearching}
              className="w-full rounded-full bg-[#35231f] text-white hover:bg-[#b76b67] py-3.5 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSearching ? 'กำลังค้นหา...' : 'ค้นหาสถานะคำสั่งซื้อ'}
              <ArrowRight className="size-4" />
            </button>
          </form>

          <div className="mt-8 text-xs text-[#35231f]/60">
            หากคุณไม่พบหมายเลขคำสั่งซื้อ สามารถติดต่อสอบถามโดยตรงได้ที่ โทร <strong>02-890-1234</strong> หรือ Line: <strong>@lunebakery</strong>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
