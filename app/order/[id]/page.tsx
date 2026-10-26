'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { CheckCircle2, Clock, Printer, ArrowRight, ShieldCheck, Phone, MapPin, AlertCircle, Sparkles } from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'

export default function OrderConfirmationPage() {
  const params = useParams()
  const id = params?.id as string
  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [storeSettings, setStoreSettings] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadOrder() {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/orders/${id}`)
        if (!res.ok) {
          throw new Error('Order not found')
        }
        const data = await res.json()
        setOrder(data.order)
        setItems(data.items || [])
        setStoreSettings(data.store_settings || {})
      } catch (err) {
        setError('ไม่พบข้อมูลคำสั่งซื้อนี้ กรุณาตรวจสอบหมายเลขคำสั่งซื้ออีกครั้ง')
      } finally {
        setIsLoading(false)
      }
    }
    if (id) loadOrder()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fbf8f3] text-[#35231f]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-24">
          <div className="flex items-center gap-2 text-sm text-[#b76b67] font-medium">
            <Sparkles className="size-5 animate-spin" />
            <span>กำลังโหลดข้อมูลคำสั่งซื้อ...</span>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fbf8f3] text-[#35231f]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center">
          <AlertCircle className="size-14 text-amber-600 mb-3" />
          <h1 className="font-serif text-2xl font-bold">ไม่พบคำสั่งซื้อ</h1>
          <p className="mt-2 text-xs text-[#35231f]/60 max-w-sm">{error}</p>
          <Link
            href="/"
            className="mt-6 rounded-full bg-[#35231f] text-white px-6 py-2.5 text-xs font-semibold hover:bg-[#b76b67]"
          >
            กลับสู่หน้าหลัก
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return { label: 'รอชำระเงิน', bg: 'bg-amber-100 text-amber-800 border-amber-200' }
      case 'payment_review':
        return { label: 'รอตรวจสอบการชำระเงิน', bg: 'bg-blue-100 text-blue-800 border-blue-200' }
      case 'baking':
        return { label: 'กำลังอบและจัดเตรียมเค้ก', bg: 'bg-purple-100 text-purple-800 border-purple-200' }
      case 'shipping':
        return { label: 'กำลังจัดส่งโดยรถควบคุมอุณหภูมิ', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' }
      case 'completed':
        return { label: 'จัดส่งสำเร็จเรียบร้อย', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
      case 'cancelled':
        return { label: 'ยกเลิกคำสั่งซื้อ', bg: 'bg-red-100 text-red-800 border-red-200' }
      default:
        return { label: status, bg: 'bg-gray-100 text-gray-800 border-gray-200' }
    }
  }

  const statusBadge = getStatusBadge(order.order_status)

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf8f3] text-[#35231f]">
      <Navbar />

      <main className="flex-1 py-12 lg:py-16">
        <div className="mx-auto max-w-[860px] px-6 sm:px-8">
          {/* Success Banner */}
          <div className="text-center mb-10">
            <div className="size-16 rounded-full bg-[#f4eae6] text-[#b76b67] grid place-items-center mx-auto mb-4 shadow-sm">
              <CheckCircle2 className="size-9" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#b76b67]">
              Order Placed Successfully
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold mt-1 text-[#35231f]">
              ขอบคุณสำหรับคำสั่งซื้อเค้กของคุณ!
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#35231f]/70">
              หมายเลขคำสั่งซื้อของคุณคือ <strong className="font-mono text-[#35231f]">{order.order_number}</strong>
            </p>
          </div>

          {/* Receipt Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#35231f]/10 shadow-lg space-y-8 print:shadow-none print:border-none">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#35231f]/10">
              <div>
                <span className="text-[11px] text-[#35231f]/60 block">สถานะปัจจุบัน:</span>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.bg}`}>
                  ● {statusBadge.label}
                </span>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[11px] text-[#35231f]/60 block">วันที่สั่งซื้อ:</span>
                <span className="text-xs font-medium text-[#35231f]">
                  {new Date(order.created_at).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
            </div>

            {/* Payment Section for Pending */}
            {order.order_status === 'pending_payment' && (
              <div className="bg-[#fcf8f3] rounded-2xl p-6 border border-[#b76b67]/20 space-y-4">
                <h3 className="font-serif text-base font-bold text-[#35231f] flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[#b76b67]"></span>
                  ข้อมูลการชำระเงิน
                </h3>

                {order.payment_method === 'promptpay' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    <div className="text-center sm:text-left space-y-1 text-xs text-[#35231f]/75">
                      <p className="font-bold text-sm text-[#35231f]">พร้อมเพย์ (PromptPay)</p>
                      <p>หมายเลข: <strong className="font-mono text-sm text-[#b76b67]">{storeSettings.promptpay_number || '081-234-5678'}</strong></p>
                      <p>ชื่อบัญชี: {storeSettings.promptpay_name || 'บจก. ลูน เบเกอรี่'}</p>
                      <p className="pt-2 text-[11px] text-[#35231f]/60">
                        * สแกน QR Code ด้วยแอปธนาคารใดก็ได้ แล้วแจ้งสลิปโอนเงินทางไลน์ร้าน
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-[#35231f]/10 shadow-xs">
                      {/* Stylized QR Code Placeholder */}
                      <div className="size-36 bg-[#35231f] rounded-lg p-2 flex flex-col justify-between items-center text-white text-[10px]">
                        <div className="w-full flex justify-between">
                          <span className="size-6 bg-white rounded-xs"></span>
                          <span className="size-6 bg-white rounded-xs"></span>
                        </div>
                        <span className="font-mono font-bold tracking-widest text-[#fbf8f3] text-xs">฿{order.total_amount.toLocaleString()}</span>
                        <div className="w-full flex justify-between">
                          <span className="size-6 bg-white rounded-xs"></span>
                          <span className="text-[8px] text-white/70">PROMPTPAY</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#35231f]/60 mt-1 font-mono">
                        PromptPay: {storeSettings.promptpay_number || '081-234-5678'}
                      </span>
                    </div>
                  </div>
                ) : order.payment_method === 'bank_transfer' ? (
                  <div className="text-xs space-y-2 text-[#35231f]/80">
                    <p>ธนาคาร: <strong>{storeSettings.bank_name || 'ธนาคารกสิกรไทย (KBANK)'}</strong></p>
                    <p>เลขที่บัญชี: <strong className="font-mono text-sm text-[#b76b67]">{storeSettings.bank_account_number || '098-7-65432-1'}</strong></p>
                    <p>ชื่อบัญชี: <strong>{storeSettings.bank_account_name || 'บริษัท ลูน เบเกอรี่ จำกัด'}</strong></p>
                    <p>ยอดชำระที่ต้องโอน: <strong className="text-sm text-[#b76b67]">฿{order.total_amount.toLocaleString()}</strong></p>
                  </div>
                ) : (
                  <p className="text-xs text-[#35231f]/80">
                    ชำระด้วยเงินสดปลายทาง (Cash on Delivery) จำนวน <strong>฿{order.total_amount.toLocaleString()}</strong> เมื่อได้รับสินค้า
                  </p>
                )}
              </div>
            )}

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[#35231f]/80 bg-[#fbf8f3] p-5 rounded-2xl">
              <div>
                <p className="font-bold text-[#35231f] mb-1 flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-[#b76b67]" />
                  ที่อยู่จัดส่งเค้ก:
                </p>
                <p className="font-semibold text-[#35231f]">{order.customer_name}</p>
                <p>{order.customer_phone}</p>
                <p className="mt-1 leading-relaxed">{order.shipping_address}</p>
              </div>

              <div>
                <p className="font-bold text-[#35231f] mb-1 flex items-center gap-1.5">
                  <Clock className="size-3.5 text-[#b76b67]" />
                  กำหนดวันเวลาจัดส่ง:
                </p>
                <p className="font-semibold text-[#35231f]">
                  {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('th-TH', { dateStyle: 'long' }) : '-'}
                </p>
                {order.delivery_note && (
                  <p className="mt-1 text-[11px] text-[#35231f]/70">
                    หมายเหตุ: {order.delivery_note}
                  </p>
                )}
              </div>
            </div>

            {/* Order Items Table */}
            <div>
              <h3 className="font-serif text-base font-bold text-[#35231f] mb-3">
                รายการสินค้าที่สั่งซื้อ
              </h3>
              <div className="border border-[#35231f]/10 rounded-2xl overflow-hidden divide-y divide-[#35231f]/10">
                {items.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 rounded-xl overflow-hidden bg-[#ead4ca] shrink-0 border border-[#35231f]/10">
                        <Image
                          src={item.image_url || '/cake-hero.png'}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#35231f]">{item.product_name}</p>
                        <p className="text-[11px] text-[#35231f]/60">ขนาด: {item.size_option} x {item.quantity}</p>
                        {item.custom_message && (
                          <p className="text-[10px] text-[#b76b67] italic">
                            ✍️ ข้อความบนเค้ก: &quot;{item.custom_message}&quot;
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#35231f] shrink-0">
                      ฿{item.subtotal.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Calculations */}
            <div className="border-t border-[#35231f]/10 pt-4 space-y-2 text-xs text-[#35231f]/80">
              <div className="flex justify-between">
                <span>ยอดรวมสินค้า</span>
                <span className="font-semibold text-[#35231f]">฿{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>ค่าจัดส่ง</span>
                <span className="font-semibold text-[#35231f]">
                  {order.shipping_fee === 0 ? 'ฟรี' : `฿${order.shipping_fee.toLocaleString()}`}
                </span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>ส่วนลด {order.promo_code && `(${order.promo_code})`}</span>
                  <span className="font-bold">-฿{order.discount_amount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-[#35231f]/10 pt-3 flex items-baseline justify-between text-base font-bold text-[#35231f]">
                <span>ยอดชำระสุทธิ</span>
                <span className="font-serif text-2xl text-[#b76b67]">
                  ฿{order.total_amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3 print:hidden">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 rounded-full border border-[#35231f]/20 bg-white hover:bg-[#fbf8f3] py-3 text-xs font-semibold text-[#35231f] transition-colors"
              >
                <Printer className="size-4" /> พิมพ์ใบเสร็จคำสั่งซื้อ
              </button>
              <Link
                href="/"
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#35231f] text-white hover:bg-[#b76b67] py-3 text-xs font-semibold transition-colors"
              >
                กลับหน้าหลัก <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
