'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, ShieldCheck, Tag, AlertCircle, ShoppingBag, Truck, CreditCard } from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { useCart } from '@/lib/cart-context'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()

  // Form State
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [deliveryNote, setDeliveryNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('promptpay')

  // Promo Code State
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<any>(null)
  const [promoError, setPromoError] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Set default delivery date to tomorrow
  useEffect(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setDeliveryDate(tomorrow.toISOString().split('T')[0])
  }, [])

  // Calculate fees
  const freeShippingThreshold = 1200
  const baseShippingFee = 80
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : baseShippingFee
  const totalAmount = Math.max(0, subtotal + shippingFee - promoDiscount)

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return
    setPromoError('')
    try {
      const res = await fetch(`/api/promotions?code=${encodeURIComponent(promoInput.trim().toUpperCase())}`)
      const data = await res.json()
      if (!res.ok || !data.promotion) {
        setPromoError(data.error || 'ไม่พบคูปองนี้ หรือหมดอายุแล้ว')
        setAppliedPromo(null)
        setPromoDiscount(0)
        return
      }

      const promo = data.promotion
      if (subtotal < promo.min_spend) {
        setPromoError(`ยอดสั่งซื้อขั้นต่ำสำหรับโค้ดนี้คือ ฿${promo.min_spend.toLocaleString()}`)
        return
      }

      let discount = 0
      if (promo.discount_type === 'percent') {
        discount = Math.round((subtotal * promo.discount_value) / 100)
      } else {
        discount = Number(promo.discount_value)
      }

      setAppliedPromo(promo)
      setPromoDiscount(discount)
      setPromoError('')
    } catch (e) {
      setPromoError('เกิดข้อผิดพลาดในการตรวจสอบคูปอง')
    }
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (items.length === 0) {
      setErrorMessage('ไม่มีสินค้าในตะกร้า กรุณาเลือกสินค้าก่อนสั่งซื้อ')
      return
    }

    if (!customerName.trim() || !customerPhone.trim() || !shippingAddress.trim()) {
      setErrorMessage('กรุณากรอกชื่อผู้รับ เบอร์โทรศัพท์ และที่อยู่จัดส่งให้ครบถ้วน')
      return
    }

    try {
      setIsSubmitting(true)
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          customer_email: customerEmail.trim(),
          shipping_address: shippingAddress.trim(),
          delivery_date: deliveryDate,
          delivery_note: deliveryNote.trim(),
          payment_method: paymentMethod,
          promo_code: appliedPromo ? appliedPromo.code : '',
          items: items.map((i) => ({
            product_id: i.productId,
            product_name: i.name,
            price: i.price,
            quantity: i.quantity,
            size_option: i.sizeOption,
            custom_message: i.customMessage,
          })),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setErrorMessage(data.error || 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ')
        setIsSubmitting(false)
        return
      }

      // Clear cart
      clearCart()

      // Redirect to Order Confirmation
      router.push(`/order/${data.order_number}`)
    } catch (err) {
      console.error(err)
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง')
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fbf8f3] text-[#35231f]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
          <ShoppingBag className="size-16 text-[#35231f]/30 mb-4" />
          <h1 className="font-serif text-3xl font-bold">ตะกร้าของคุณยังว่างอยู่</h1>
          <p className="mt-2 text-xs text-[#35231f]/60 max-w-sm">
            โปรดเลือกเค้กที่ต้องการและกดสั่งซื้อเพื่อมายังหน้านี้
          </p>
          <Link
            href="/products"
            className="mt-6 rounded-full bg-[#35231f] text-white px-7 py-3.5 text-xs font-semibold hover:bg-[#b76b67] transition-colors"
          >
            เลือกซื้อเค้ก
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf8f3] text-[#35231f]">
      <Navbar />

      <main className="flex-1 py-10 lg:py-16">
        <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
          <div className="mb-8 flex items-center justify-between">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs font-medium text-[#35231f]/60 hover:text-[#35231f]"
            >
              <ArrowLeft className="size-4" /> เลือกซื้อสินค้าต่อ
            </Link>
            <span className="text-xs uppercase tracking-wider text-[#b76b67] font-semibold">
              🔒 สั่งซื้ออย่างปลอดภัย 100%
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-8 text-[#35231f]">
            ดำเนินการชำระเงินและสั่งซื้อ
          </h1>

          {errorMessage && (
            <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 flex items-center gap-3 text-xs text-red-700">
              <AlertCircle className="size-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmitOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left Column: Customer Form & Payment (7 cols) */}
              <div className="lg:col-span-7 space-y-8">
                {/* 1. Contact & Shipping */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#35231f]/10 shadow-sm space-y-5">
                  <h2 className="font-serif text-xl font-bold text-[#35231f] flex items-center gap-2 pb-3 border-b border-[#35231f]/10">
                    <span className="grid size-6 place-items-center rounded-full bg-[#35231f] text-xs text-white">1</span>
                    ข้อมูลผู้รับและการจัดส่ง
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#35231f] mb-1.5">
                        ชื่อ-นามสกุล ผู้รับ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="เช่น คุณวิภาดา สุขเจริญ"
                        className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-[#b76b67]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#35231f] mb-1.5">
                        เบอร์โทรศัพท์ติดต่อ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="เช่น 081-234-5678"
                        className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-[#b76b67]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#35231f] mb-1.5">
                      อีเมล (สำหรับส่งใบเสร็จยืนยัน)
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="เช่น customer@email.com"
                      className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-[#b76b67]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#35231f] mb-1.5">
                      ที่อยู่จัดส่งโดยละเอียด <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="ระบุเลขที่บ้าน, ซอย, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์ หรือชื่ออาคาร/ชั้น/ห้อง"
                      className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-[#b76b67]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#35231f] mb-1.5">
                        วันที่ต้องการให้จัดส่ง <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-[#b76b67]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#35231f] mb-1.5">
                        ช่วงเวลา / หมายเหตุการส่ง
                      </label>
                      <input
                        type="text"
                        value={deliveryNote}
                        onChange={(e) => setDeliveryNote(e.target.value)}
                        placeholder="เช่น จัดส่งช่วงบ่าย 14:00 - 16:00 น."
                        className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-[#b76b67]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Payment Method */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#35231f]/10 shadow-sm space-y-4">
                  <h2 className="font-serif text-xl font-bold text-[#35231f] flex items-center gap-2 pb-3 border-b border-[#35231f]/10">
                    <span className="grid size-6 place-items-center rounded-full bg-[#35231f] text-xs text-white">2</span>
                    ช่องทางการชำระเงิน
                  </h2>

                  <div className="space-y-3">
                    {/* PromptPay */}
                    <label
                      className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === 'promptpay'
                          ? 'border-[#b76b67] bg-[#fbf5f4] shadow-xs'
                          : 'border-[#35231f]/15 hover:bg-[#fbf8f3]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="promptpay"
                        checked={paymentMethod === 'promptpay'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mt-1 accent-[#b76b67]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#35231f]">
                            พร้อมเพย์ (PromptPay QR Code)
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                            แนะนำ / สะดวกที่สุด
                          </span>
                        </div>
                        <p className="text-[11px] text-[#35231f]/65 mt-1">
                          สแกนจ่ายผ่านแอปธนาคารทุกแห่งได้ทันทีหลังจากยืนยันคำสั่งซื้อ
                        </p>
                      </div>
                    </label>

                    {/* Bank Transfer */}
                    <label
                      className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === 'bank_transfer'
                          ? 'border-[#b76b67] bg-[#fbf5f4] shadow-xs'
                          : 'border-[#35231f]/15 hover:bg-[#fbf8f3]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mt-1 accent-[#b76b67]"
                      />
                      <div className="flex-1">
                        <span className="text-xs font-bold text-[#35231f]">
                          โอนเงินผ่านบัญชีธนาคาร (กสิกรไทย KBANK)
                        </span>
                        <p className="text-[11px] text-[#35231f]/65 mt-1">
                          โอนผ่านเลขบัญชีธนาคาร พร้อมแนบสลิปเพื่อตรวจสอบ
                        </p>
                      </div>
                    </label>

                    {/* Cash on Delivery */}
                    <label
                      className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-[#b76b67] bg-[#fbf5f4] shadow-xs'
                          : 'border-[#35231f]/15 hover:bg-[#fbf8f3]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mt-1 accent-[#b76b67]"
                      />
                      <div className="flex-1">
                        <span className="text-xs font-bold text-[#35231f]">
                          ชำระเงินสดปลายทาง (Cash on Delivery)
                        </span>
                        <p className="text-[11px] text-[#35231f]/65 mt-1">
                          ชำระเงินกับพนักงานจัดส่งเมื่อเค้กไปถึงมือคุณ
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#35231f]/10 shadow-sm space-y-6 sticky top-28">
                  <h2 className="font-serif text-xl font-bold text-[#35231f] pb-3 border-b border-[#35231f]/10">
                    สรุปรายการสั่งซื้อ ({items.length} รายการ)
                  </h2>

                  {/* Items List */}
                  <div className="divide-y divide-[#35231f]/5 max-h-72 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div key={item.id} className="py-3 flex gap-3 items-center">
                        <div className="relative size-14 rounded-xl overflow-hidden bg-[#ead4ca] shrink-0 border border-[#35231f]/10">
                          <Image
                            src={item.imageUrl || '/cake-hero.png'}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate text-[#35231f]">{item.name}</p>
                          <p className="text-[11px] text-[#35231f]/60">ขนาด: {item.sizeOption} x{item.quantity}</p>
                          {item.customMessage && (
                            <p className="text-[10px] text-[#b76b67] truncate italic">
                              ✍️ &quot;{item.customMessage}&quot;
                            </p>
                          )}
                        </div>
                        <span className="text-xs font-bold text-[#35231f]">
                          ฿{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Promo Code Input */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-[#35231f] mb-1">
                      โค้ดส่วนลด (Promo Code):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="เช่น LUNE10"
                        className="flex-1 text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3 py-2 uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#b76b67]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="rounded-xl bg-[#35231f] text-white px-4 py-2 text-xs font-medium hover:bg-[#b76b67] transition-colors"
                      >
                        ใช้โค้ด
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-[11px] text-red-600 mt-1">{promoError}</p>
                    )}
                    {appliedPromo && (
                      <div className="mt-2 text-[11px] text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center justify-between">
                        <span>✓ ใช้โค้ด <strong>{appliedPromo.code}</strong> สำเร็จ</span>
                        <span className="font-bold">-฿{promoDiscount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Calculations */}
                  <div className="border-t border-[#35231f]/10 pt-4 space-y-2 text-xs text-[#35231f]/75">
                    <div className="flex justify-between">
                      <span>ยอดรวมสินค้า</span>
                      <span className="font-semibold text-[#35231f]">฿{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ค่าจัดส่ง (รถควบคุมอุณหภูมิ)</span>
                      <span className="font-semibold text-[#35231f]">
                        {shippingFee === 0 ? (
                          <span className="text-emerald-700 font-bold">ฟรี</span>
                        ) : (
                          `฿${shippingFee}`
                        )}
                      </span>
                    </div>
                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>ส่วนลดจากคูปอง</span>
                        <span className="font-bold">-฿{promoDiscount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="border-t border-[#35231f]/10 pt-3 flex items-baseline justify-between text-base font-bold text-[#35231f]">
                      <span>ยอดชำระสุทธิ</span>
                      <span className="font-serif text-2xl text-[#b76b67]">
                        ฿{totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-[#35231f] text-[#fbf8f3] py-4 text-sm font-semibold hover:bg-[#b76b67] transition-all shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>กำลังประมวลผลคำสั่งซื้อ...</span>
                    ) : (
                      <>
                        ยืนยันการสั่งซื้อเค้ก
                        <CheckCircle2 className="size-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-[#35231f]/50">
                    ข้อมูลของคุณจะได้รับการปกป้องอย่างปลอดภัยตามนโยบายความเป็นส่วนตัว
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
