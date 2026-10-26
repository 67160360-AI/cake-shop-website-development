'use client'

import React, { useState, useEffect } from 'react'
import {
  Save,
  Tag,
  Store,
  Truck,
  CreditCard,
  Plus,
  Check,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    store_name: '',
    store_tagline: '',
    store_phone: '',
    store_email: '',
    store_address: '',
    store_hours: '',
    shipping_base_fee: '80',
    shipping_free_threshold: '1200',
    promptpay_number: '',
    promptpay_name: '',
    bank_name: '',
    bank_account_number: '',
    bank_account_name: '',
  })

  const [promotions, setPromotions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [message, setMessage] = useState('')

  // New Promo form state
  const [newPromo, setNewPromo] = useState({
    code: '',
    description: '',
    discount_type: 'percent',
    discount_value: 10,
    min_spend: 800,
  })
  const [isSavingPromo, setIsSavingPromo] = useState(false)

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [setRes, promoRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/promotions'),
      ])
      const setData = await setRes.json()
      const promoData = await promoRes.json()

      if (setData.settings) setSettings(setData.settings)
      if (promoData.promotions) setPromotions(promoData.promotions)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSavingSettings(true)
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        setMessage('บันทึกการตั้งค่าร้านค้าเรียบร้อยแล้ว')
        setTimeout(() => setMessage(''), 3000)
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึก')
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleAddPromotion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPromo.code.trim()) return

    try {
      setIsSavingPromo(true)
      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPromo),
      })
      const data = await res.json()
      if (res.ok) {
        setPromotions(data.promotions)
        setNewPromo({
          code: '',
          description: '',
          discount_type: 'percent',
          discount_value: 10,
          min_spend: 800,
        })
        setMessage('สร้างโค้ดส่วนลดใหม่สำเร็จ')
        setTimeout(() => setMessage(''), 3000)
      } else {
        alert(data.error || 'ไม่สามารถเพิ่มโปรโมชั่นได้')
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาด')
    } finally {
      setIsSavingPromo(false)
    }
  }

  const handleTogglePromo = async (promo: any) => {
    try {
      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...promo,
          is_active: promo.is_active ? 0 : 1,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setPromotions(data.promotions)
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="ตั้งค่าร้านค้า & โปรโมชั่น (Store Settings)"
        subtitle="จัดการข้อมูลติดต่อร้าน ค่าจัดส่ง บัญชีชำระเงิน และรหัสคูปองส่วนลด"
      />

      <main className="p-8 space-y-8 max-w-7xl">
        {message && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
            <Check className="size-4" />
            <span>{message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: General Settings (7 cols) */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#35231f]/10 shadow-xs space-y-6">
              <h2 className="font-serif text-lg font-bold text-[#35231f] flex items-center gap-2 pb-3 border-b border-[#35231f]/10">
                <Store className="size-5 text-[#b76b67]" />
                ข้อมูลร้านค้าและการติดต่อ
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">ชื่อร้าน</label>
                  <input
                    type="text"
                    value={settings.store_name || ''}
                    onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                    className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3.5 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">เบอร์โทรศัพท์ร้าน</label>
                  <input
                    type="text"
                    value={settings.store_phone || ''}
                    onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
                    className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3.5 py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">อีเมลติดต่อ</label>
                <input
                  type="email"
                  value={settings.store_email || ''}
                  onChange={(e) => setSettings({ ...settings, store_email: e.target.value })}
                  className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3.5 py-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">ที่ตั้งร้าน / ครัวเบเกอรี่</label>
                <textarea
                  rows={2}
                  value={settings.store_address || ''}
                  onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
                  className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3.5 py-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">เวลาทำการ</label>
                <input
                  type="text"
                  value={settings.store_hours || ''}
                  onChange={(e) => setSettings({ ...settings, store_hours: e.target.value })}
                  className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3.5 py-2.5"
                />
              </div>

              {/* Shipping settings */}
              <h3 className="font-serif text-base font-bold text-[#35231f] flex items-center gap-2 pt-3 border-t border-[#35231f]/10">
                <Truck className="size-4 text-[#b76b67]" />
                การตั้งค่าค่าจัดส่ง (Delivery Fees)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">ค่าจัดส่งพื้นฐาน (บาท)</label>
                  <input
                    type="number"
                    value={settings.shipping_base_fee || '80'}
                    onChange={(e) => setSettings({ ...settings, shipping_base_fee: e.target.value })}
                    className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3.5 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">ยอดขั้นต่ำสำหรับส่งฟรี (บาท)</label>
                  <input
                    type="number"
                    value={settings.shipping_free_threshold || '1200'}
                    onChange={(e) => setSettings({ ...settings, shipping_free_threshold: e.target.value })}
                    className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3.5 py-2.5"
                  />
                </div>
              </div>

              {/* Payment account settings */}
              <h3 className="font-serif text-base font-bold text-[#35231f] flex items-center gap-2 pt-3 border-t border-[#35231f]/10">
                <CreditCard className="size-4 text-[#b76b67]" />
                ข้อมูลบัญชีรับเงิน (PromptPay & Bank)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">เบอร์ / เลขพร้อมเพย์</label>
                  <input
                    type="text"
                    value={settings.promptpay_number || ''}
                    onChange={(e) => setSettings({ ...settings, promptpay_number: e.target.value })}
                    className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3.5 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">ชื่อบัญชีพร้อมเพย์</label>
                  <input
                    type="text"
                    value={settings.promptpay_name || ''}
                    onChange={(e) => setSettings({ ...settings, promptpay_name: e.target.value })}
                    className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3.5 py-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">เลขที่บัญชีธนาคาร</label>
                  <input
                    type="text"
                    value={settings.bank_account_number || ''}
                    onChange={(e) => setSettings({ ...settings, bank_account_number: e.target.value })}
                    className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3.5 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">ชื่อธนาคาร</label>
                  <input
                    type="text"
                    value={settings.bank_name || ''}
                    onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
                    className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3.5 py-2.5"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-[#35231f] text-white hover:bg-[#b76b67] py-3.5 text-xs font-bold transition-all shadow-md disabled:opacity-50"
                >
                  <Save className="size-4" />
                  {isSavingSettings ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าร้านค้า'}
                </button>
              </div>
            </form>
          </div>

          {/* Right: Promotions Manager (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Create Promo Card */}
            <form onSubmit={handleAddPromotion} className="bg-white rounded-3xl p-6 sm:p-7 border border-[#35231f]/10 shadow-xs space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#35231f] flex items-center gap-2 pb-2 border-b border-[#35231f]/10">
                <Tag className="size-4 text-[#b76b67]" />
                สร้างโค้ดส่วนลดใหม่
              </h2>

              <div>
                <label className="block text-xs font-bold mb-1">รหัสคูปอง (Code)</label>
                <input
                  type="text"
                  required
                  value={newPromo.code}
                  onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                  placeholder="เช่น CAKEDAY20"
                  className="w-full text-xs uppercase font-mono tracking-wider rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3.5 py-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">ประเภทส่วนลด</label>
                  <select
                    value={newPromo.discount_type}
                    onChange={(e) => setNewPromo({ ...newPromo, discount_type: e.target.value })}
                    className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3 py-2.5"
                  >
                    <option value="percent">เปอร์เซ็นต์ (%)</option>
                    <option value="fixed">จำนวนเงิน (฿)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">มูลค่าส่วนลด</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newPromo.discount_value}
                    onChange={(e) => setNewPromo({ ...newPromo, discount_value: Number(e.target.value) })}
                    className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3 py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">ยอดสั่งซื้อขั้นต่ำ (บาท)</label>
                <input
                  type="number"
                  min={0}
                  value={newPromo.min_spend}
                  onChange={(e) => setNewPromo({ ...newPromo, min_spend: Number(e.target.value) })}
                  className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3.5 py-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">คำอธิบาย</label>
                <input
                  type="text"
                  value={newPromo.description}
                  onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                  placeholder="เช่น ลด 10% สำหรับยอด 800 บาทขึ้นไป"
                  className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3.5 py-2.5"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingPromo}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-[#35231f] text-white hover:bg-[#b76b67] py-3 text-xs font-bold transition-all shadow-sm"
              >
                <Plus className="size-4" /> เพิ่มโค้ดส่วนลด
              </button>
            </form>

            {/* Existing Promo List */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#35231f]/10 shadow-xs space-y-4">
              <h3 className="font-serif text-base font-bold text-[#35231f]">
                โค้ดส่วนลดทั้งหมดในระบบ ({promotions.length})
              </h3>

              <div className="space-y-3">
                {promotions.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-[#fbf8f3] border border-[#35231f]/10 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#35231f]">{p.code}</span>
                        <span className="text-[10px] bg-[#b76b67]/15 text-[#b76b67] font-semibold px-2 py-0.5 rounded-full">
                          {p.discount_type === 'percent' ? `ลด ${p.discount_value}%` : `ลด ฿${p.discount_value}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#35231f]/60 mt-1">{p.description}</p>
                      <p className="text-[10px] text-[#35231f]/40">ขั้นต่ำ: ฿{p.min_spend.toLocaleString()}</p>
                    </div>

                    <button
                      onClick={() => handleTogglePromo(p)}
                      className={`px-3 py-1 text-[11px] rounded-full font-bold transition-colors ${
                        p.is_active
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {p.is_active ? 'เปิดใช้งาน ✓' : 'ปิดใช้งาน'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
