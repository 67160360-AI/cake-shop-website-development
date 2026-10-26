'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Search,
  ShoppingCart,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Calendar,
  X,
  Filter,
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  // Order Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [statusUpdateMessage, setStatusUpdateMessage] = useState('')

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (search.trim()) params.append('search', search.trim())

      const res = await fetch(`/api/orders?${params.toString()}`)
      const data = await res.json()
      if (data.orders) setOrders(data.orders)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [statusFilter, search])

  const openOrderDetail = async (orderId: number) => {
    try {
      setIsDetailLoading(true)
      const res = await fetch(`/api/orders/${orderId}`)
      const data = await res.json()
      setSelectedOrder(data.order)
      setOrderItems(data.items || [])
    } catch (e) {
      console.error(e)
    } finally {
      setIsDetailLoading(false)
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder) return

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: newStatus }),
      })
      const data = await res.json()
      if (res.ok) {
        setSelectedOrder(data.order)
        setStatusUpdateMessage('อัปเดตสถานะสำเร็จ!')
        setTimeout(() => setStatusUpdateMessage(''), 2500)
        loadOrders()
      } else {
        alert(data.error || 'ไม่สามารถอัปเดตสถานะได้')
      }
    } catch (e) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return { label: 'รอชำระเงิน', bg: 'bg-amber-100 text-amber-800' }
      case 'payment_review':
        return { label: 'รอตรวจสอบสลิป', bg: 'bg-blue-100 text-blue-800' }
      case 'baking':
        return { label: 'กำลังอบเค้ก', bg: 'bg-purple-100 text-purple-800' }
      case 'shipping':
        return { label: 'กำลังจัดส่ง', bg: 'bg-indigo-100 text-indigo-800' }
      case 'completed':
        return { label: 'จัดส่งสำเร็จ', bg: 'bg-emerald-100 text-emerald-800' }
      case 'cancelled':
        return { label: 'ยกเลิกคำสั่งซื้อ', bg: 'bg-red-100 text-red-800' }
      default:
        return { label: status, bg: 'bg-gray-100 text-gray-800' }
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="จัดการคำสั่งซื้อ (Orders Management)"
        subtitle="ตรวจสอบรายการสั่งเค้ก ยืนยันการชำระเงิน และอัปเดตสถานะการอบ-จัดส่ง"
      />

      <main className="p-8 space-y-6 max-w-7xl">
        {/* Filter and Search Bar */}
        <div className="bg-white rounded-3xl p-5 border border-[#35231f]/10 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#35231f]/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาเลขที่ออเดอร์, ชื่อลูกค้า, เบอร์โทร..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-[#fbf8f3] border border-[#35231f]/15 focus:outline-none focus:ring-2 focus:ring-[#b76b67]"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-[#fbf8f3] border border-[#35231f]/15 rounded-full px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-[#b76b67]"
            >
              <option value="all">ทุกสถานะคำสั่งซื้อ</option>
              <option value="pending_payment">รอชำระเงิน</option>
              <option value="payment_review">รอตรวจสอบสลิป</option>
              <option value="baking">กำลังอบเค้ก</option>
              <option value="shipping">กำลังจัดส่ง</option>
              <option value="completed">จัดส่งสำเร็จ</option>
              <option value="cancelled">ยกเลิก</option>
            </select>
          </div>

          <span className="text-xs text-[#35231f]/60 font-medium">
            พบคำสั่งซื้อทั้งหมด <strong>{orders.length}</strong> รายการ
          </span>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-[#35231f]/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#fbf8f3] border-b border-[#35231f]/10 text-[#35231f]/70 uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-6 font-semibold">หมายเลขคำสั่งซื้อ</th>
                  <th className="py-3.5 px-4 font-semibold">ลูกค้า</th>
                  <th className="py-3.5 px-4 font-semibold">สรุปเค้กที่สั่ง</th>
                  <th className="py-3.5 px-4 font-semibold">ยอดสุทธิ</th>
                  <th className="py-3.5 px-4 font-semibold">ช่องทางชำระ</th>
                  <th className="py-3.5 px-4 font-semibold">สถานะ</th>
                  <th className="py-3.5 px-6 font-semibold text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#35231f]/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#35231f]/50">
                      กำลังโหลดข้อมูลคำสั่งซื้อ...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#35231f]/50">
                      ไม่พบคำสั่งซื้อตามเงื่อนไขที่เลือก
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => {
                    const badge = getStatusBadge(o.order_status)
                    return (
                      <tr key={o.id} className="hover:bg-[#fbf8f3] transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-[#35231f]">
                          {o.order_number}
                          <span className="block text-[10px] text-[#35231f]/50 font-sans">
                            {new Date(o.created_at).toLocaleDateString('th-TH')}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-medium text-[#35231f]">
                          {o.customer_name}
                          <span className="block text-[10px] text-[#35231f]/50">{o.customer_phone}</span>
                        </td>
                        <td className="py-4 px-4 max-w-xs truncate text-[#35231f]/75">
                          {o.items_summary || `${o.item_count} รายการ`}
                        </td>
                        <td className="py-4 px-4 font-bold text-[#35231f]">
                          ฿{o.total_amount.toLocaleString()}
                        </td>
                        <td className="py-4 px-4">
                          <span className="capitalize text-[#35231f]/70 font-medium">
                            {o.payment_method === 'promptpay' ? 'พร้อมเพย์' : o.payment_method === 'bank_transfer' ? 'โอนธนาคาร' : 'เก็บปลายทาง'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => openOrderDetail(o.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#35231f] text-white hover:bg-[#b76b67] text-[11px] font-semibold transition-colors"
                          >
                            <Eye className="size-3.5" />
                            ดูรายละเอียด
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
            <div className="relative bg-white text-[#35231f] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#35231f]/10 overflow-hidden space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#35231f]/10">
                <div>
                  <h2 className="font-serif text-xl font-bold">
                    คำสั่งซื้อ #{selectedOrder.order_number}
                  </h2>
                  <p className="text-[11px] text-[#35231f]/50">
                    สั่งซื้อเมื่อ: {new Date(selectedOrder.created_at).toLocaleString('th-TH')}
                  </p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-[#35231f]/60 hover:text-[#35231f]">
                  <X className="size-5" />
                </button>
              </div>

              {statusUpdateMessage && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="size-4" />
                  <span>{statusUpdateMessage}</span>
                </div>
              )}

              {/* Status Updater */}
              <div className="bg-[#fbf8f3] p-4 rounded-2xl border border-[#35231f]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-[#35231f]/60 block font-semibold uppercase">เปลี่ยนสถานะออเดอร์:</span>
                  <span className="text-xs font-bold text-[#b76b67]">
                    ปัจจุบัน: {getStatusBadge(selectedOrder.order_status).label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleUpdateStatus('payment_review')}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold"
                  >
                    รอตรวจสลิป
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('baking')}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold"
                  >
                    เข้าเตาอบ
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('shipping')}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-semibold"
                  >
                    ส่งรถเย็น
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('completed')}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold"
                  >
                    สำเร็จ
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('cancelled')}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-red-100 hover:bg-red-200 text-red-800 font-semibold"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>

              {/* Customer and Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#35231f]/80 bg-[#fbf8f3] p-4 rounded-2xl">
                <div>
                  <p className="font-bold text-[#35231f] mb-1">ข้อมูลผู้สั่ง & ที่อยู่:</p>
                  <p className="font-semibold text-sm">{selectedOrder.customer_name}</p>
                  <p>โทร: {selectedOrder.customer_phone}</p>
                  {selectedOrder.customer_email && <p>อีเมล: {selectedOrder.customer_email}</p>}
                  <p className="mt-1 leading-relaxed text-[#35231f]/70">{selectedOrder.shipping_address}</p>
                </div>
                <div>
                  <p className="font-bold text-[#35231f] mb-1">กำหนดการจัดส่ง:</p>
                  <p>วันที่: {selectedOrder.delivery_date}</p>
                  <p>หมายเหตุ: {selectedOrder.delivery_note || '-'}</p>
                  <p className="mt-2">วิธีชำระ: <strong className="capitalize">{selectedOrder.payment_method}</strong></p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#35231f]">
                  เค้กที่สั่งซื้อ ({orderItems.length} รายการ)
                </h4>
                <div className="divide-y divide-[#35231f]/5 border border-[#35231f]/10 rounded-2xl p-2 max-h-48 overflow-y-auto">
                  {orderItems.map((item) => (
                    <div key={item.id} className="py-2 px-2 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-bold text-[#35231f]">{item.product_name}</p>
                        <p className="text-[11px] text-[#35231f]/60">ขนาด: {item.size_option} x {item.quantity}</p>
                        {item.custom_message && (
                          <p className="text-[10px] text-[#b76b67] italic">
                            ✍️ ข้อความบนหน้าเค้ก: &quot;{item.custom_message}&quot;
                          </p>
                        )}
                      </div>
                      <span className="font-bold text-[#35231f]">
                        ฿{item.subtotal.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-[#35231f]/10 pt-3 space-y-1 text-xs text-[#35231f]/75">
                <div className="flex justify-between">
                  <span>ยอดรวมสินค้า</span>
                  <span>฿{selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>ค่าจัดส่ง</span>
                  <span>฿{selectedOrder.shipping_fee.toLocaleString()}</span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>ส่วนลด {selectedOrder.promo_code && `(${selectedOrder.promo_code})`}</span>
                    <span>-฿{selectedOrder.discount_amount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-[#35231f] pt-2 border-t border-[#35231f]/10">
                  <span>ยอดสุทธิ</span>
                  <span className="text-base text-[#b76b67]">฿{selectedOrder.total_amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-2 rounded-full bg-[#35231f] text-white text-xs font-semibold hover:bg-[#b76b67]"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
