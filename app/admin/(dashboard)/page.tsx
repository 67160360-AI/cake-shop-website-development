'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Cake,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>({
    totalProducts: 0,
    activeProducts: 0,
    outOfStockProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoading(true)
        const res = await fetch('/api/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data.stats)
          setRecentOrders(data.recentOrders || [])
          setLowStockProducts(data.lowStockProducts || [])
        }
      } catch (e) {
        console.error('Failed to load stats', e)
      } finally {
        setIsLoading(false)
      }
    }
    loadStats()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return { label: 'รอชำระเงิน', bg: 'bg-amber-100 text-amber-800' }
      case 'payment_review':
        return { label: 'รอตรวจสอบ', bg: 'bg-blue-100 text-blue-800' }
      case 'baking':
        return { label: 'กำลังอบเค้ก', bg: 'bg-purple-100 text-purple-800' }
      case 'shipping':
        return { label: 'กำลังส่ง', bg: 'bg-indigo-100 text-indigo-800' }
      case 'completed':
        return { label: 'จัดส่งสำเร็จ', bg: 'bg-emerald-100 text-emerald-800' }
      case 'cancelled':
        return { label: 'ยกเลิก', bg: 'bg-red-100 text-red-800' }
      default:
        return { label: status, bg: 'bg-gray-100 text-gray-800' }
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="ภาพรวมร้านค้า (Dashboard)"
        subtitle="สรุปข้อมูลสถิติยอดขาย สต็อกสินค้า และคำสั่งซื้อล่าสุดจากฐานข้อมูลจริง"
      />

      <main className="p-8 space-y-8 max-w-7xl">
        {/* Quick Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-[#35231f]/70 font-medium">ระบบเชื่อมต่อฐานข้อมูล SQLite แบบเรียลไทม์</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/products?new=true"
              className="inline-flex items-center gap-2 bg-[#35231f] hover:bg-[#b76b67] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="size-4" /> เพิ่มสินค้าใหม่
            </Link>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 bg-white hover:bg-[#fbf8f3] border border-[#35231f]/15 text-[#35231f] px-4 py-2 rounded-full text-xs font-semibold transition-colors"
            >
              <ShoppingCart className="size-4" /> ดูคำสั่งซื้อทั้งหมด
            </Link>
          </div>
        </div>

        {/* 6 Stats Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Revenue */}
          <div className="bg-white rounded-3xl p-6 border border-[#35231f]/10 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#35231f]/60">
                ยอดขายรวม (Revenue)
              </span>
              <span className="grid size-10 place-items-center rounded-2xl bg-[#fbf5f4] text-[#b76b67]">
                <TrendingUp className="size-5" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold text-[#35231f]">
                ฿{stats.totalRevenue.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-[#35231f]/50">
              * คำนวณจากคำสั่งซื้อที่ยืนยันการชำระเงินแล้ว
            </p>
          </div>

          {/* Pending Orders */}
          <div className="bg-white rounded-3xl p-6 border border-[#35231f]/10 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#35231f]/60">
                ออเดอร์รอดำเนินการ
              </span>
              <span className="grid size-10 place-items-center rounded-2xl bg-amber-50 text-amber-700">
                <Clock className="size-5" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold text-amber-800">
                {stats.pendingOrders}
              </span>
              <span className="text-xs text-[#35231f]/60">รายการ</span>
            </div>
            <p className="text-[11px] text-[#35231f]/50">
              รอตรวจสอบสลิป หรือรอเตรียมเข้าเตาอบ
            </p>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-3xl p-6 border border-[#35231f]/10 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#35231f]/60">
                คำสั่งซื้อทั้งหมด
              </span>
              <span className="grid size-10 place-items-center rounded-2xl bg-blue-50 text-blue-700">
                <ShoppingCart className="size-5" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold text-[#35231f]">
                {stats.totalOrders}
              </span>
              <span className="text-xs text-[#35231f]/60">คำสั่งซื้อ</span>
            </div>
            <p className="text-[11px] text-[#35231f]/50">
              บันทึกในฐานข้อมูล orders
            </p>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-3xl p-6 border border-[#35231f]/10 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#35231f]/60">
                เค้กทั้งหมดในระบบ
              </span>
              <span className="grid size-10 place-items-center rounded-2xl bg-purple-50 text-purple-700">
                <Cake className="size-5" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold text-[#35231f]">
                {stats.totalProducts}
              </span>
              <span className="text-xs text-[#35231f]/60">เมนู</span>
            </div>
            <p className="text-[11px] text-[#35231f]/50">
              พร้อมจำหน่าย: <strong>{stats.activeProducts}</strong> เมนู
            </p>
          </div>

          {/* Out of Stock */}
          <div className="bg-white rounded-3xl p-6 border border-[#35231f]/10 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#35231f]/60">
                สินค้าหมดสต็อก
              </span>
              <span className="grid size-10 place-items-center rounded-2xl bg-red-50 text-red-600">
                <AlertTriangle className="size-5" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold text-red-600">
                {stats.outOfStockProducts}
              </span>
              <span className="text-xs text-[#35231f]/60">เมนู</span>
            </div>
            <p className="text-[11px] text-[#35231f]/50">
              เค้กที่คงเหลือ 0 ชิ้นในคลังสินค้า
            </p>
          </div>

          {/* Store Status */}
          <div className="bg-[#35231f] text-[#fbf8f3] rounded-3xl p-6 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#e5c468]">
                สถานะหน้าร้าน (Live Status)
              </span>
              <Sparkles className="size-5 text-[#e5c468]" />
            </div>
            <p className="font-serif text-xl font-bold">
              Lune Bakery เปิดทำการ
            </p>
            <p className="text-[11px] text-white/70">
              รับคำสั่งซื้ออัตโนมัติตลอด 24 ชม. ส่งสดทุกเช้า
            </p>
          </div>
        </div>

        {/* 2 Columns: Recent Orders and Low Stock Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Recent Orders (7 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-[#35231f]/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#35231f]/10">
              <h2 className="font-serif text-lg font-bold text-[#35231f]">
                คำสั่งซื้อล่าสุด (Recent Orders)
              </h2>
              <Link
                href="/admin/orders"
                className="text-xs text-[#b76b67] hover:underline flex items-center gap-1 font-semibold"
              >
                ดูทั้งหมด &rarr;
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-xs text-[#35231f]/50 py-8 text-center">
                ยังไม่มีคำสั่งซื้อในระบบ
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#35231f]/10 text-[#35231f]/60">
                      <th className="pb-3 font-semibold">หมายเลข</th>
                      <th className="pb-3 font-semibold">ลูกค้า</th>
                      <th className="pb-3 font-semibold">ยอดเงิน</th>
                      <th className="pb-3 font-semibold">สถานะ</th>
                      <th className="pb-3 font-semibold text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#35231f]/5">
                    {recentOrders.map((o) => {
                      const badge = getStatusBadge(o.order_status)
                      return (
                        <tr key={o.id} className="hover:bg-[#fbf8f3]">
                          <td className="py-3 font-mono font-medium text-[#35231f]">
                            {o.order_number}
                          </td>
                          <td className="py-3 font-medium text-[#35231f]">
                            {o.customer_name}
                            <span className="block text-[10px] text-[#35231f]/50">{o.customer_phone}</span>
                          </td>
                          <td className="py-3 font-bold text-[#35231f]">
                            ฿{o.total_amount.toLocaleString()}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <Link
                              href={`/admin/orders?order=${o.id}`}
                              className="text-xs text-[#b76b67] hover:underline font-semibold"
                            >
                              จัดการ
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Low Stock Alerts (5 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#35231f]/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#35231f]/10">
              <h2 className="font-serif text-lg font-bold text-[#35231f] flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-600" />
                เค้กที่ใกล้หมดสต็อก
              </h2>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                เหลือน้อย (&le; 5)
              </span>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-[#35231f]/50 py-8 text-center">
                เค้กทุกรายการมีสต็อกเพียงพอ
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#fbf8f3] border border-[#35231f]/5"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#35231f]">{p.name}</p>
                      <p className="text-[10px] text-[#35231f]/50">฿{p.price.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                        คงเหลือ {p.stock} ชิ้น
                      </span>
                      <Link
                        href={`/admin/products?edit=${p.id}`}
                        className="block text-[10px] text-[#b76b67] hover:underline mt-0.5"
                      >
                        เติมสต็อก &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
