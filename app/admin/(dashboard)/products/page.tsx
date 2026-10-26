'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  AlertCircle,
  Check,
  X,
  Cake,
  ExternalLink,
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState('All')
  const [isLoading, setIsLoading] = useState(true)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [modalError, setModalError] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [noticeMessage, setNoticeMessage] = useState('')

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    category_id: 1,
    price: 890,
    original_price: '',
    description: '',
    stock: 10,
    status: 'active',
    tag: '',
    tone: 'rose',
    image_url: '/cake-hero.png',
  })

  // File upload state
  const [uploadingImage, setUploadingImage] = useState(false)

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/products?admin=true')
      const data = await res.json()
      if (data.products) setProducts(data.products)
      if (data.categories) setCategories(data.categories)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const openAddModal = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      category_id: categories[0]?.id || 1,
      price: 890,
      original_price: '',
      description: '',
      stock: 10,
      status: 'active',
      tag: 'New',
      tone: 'rose',
      image_url: '/cake-hero.png',
    })
    setModalError('')
    setIsModalOpen(true)
  }

  const openEditModal = (product: any) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category_id: product.category_id,
      price: product.price,
      original_price: product.original_price ? String(product.original_price) : '',
      description: product.description,
      stock: product.stock,
      status: product.status,
      tag: product.tag || '',
      tone: product.tone || 'rose',
      image_url: product.image_url,
    })
    setModalError('')
    setIsModalOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      const uploadForm = new FormData()
      uploadForm.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadForm,
      })
      const data = await res.json()
      if (!res.ok) {
        setModalError(data.error || 'ไม่สามารถอัปโหลดรูปภาพได้')
        return
      }

      setFormData((prev) => ({ ...prev, image_url: data.url }))
    } catch (err) {
      setModalError('เกิดข้อผิดพลาดในการอัปโหลดไฟล์')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError('')
    setIsSaving(true)

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok) {
        setModalError(data.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
        setIsSaving(false)
        return
      }

      setIsModalOpen(false)
      setNoticeMessage(editingProduct ? 'อัปเดตข้อมูลสินค้าสำเร็จ' : 'เพิ่มสินค้าใหม่ลงในฐานข้อมูลสำเร็จ')
      setTimeout(() => setNoticeMessage(''), 3000)
      loadProducts()
    } catch (err) {
      setModalError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProduct = async (id: number) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        setNoticeMessage(data.message || 'ลบสินค้าสำเร็จ')
        setTimeout(() => setNoticeMessage(''), 4000)
        setDeleteConfirmId(null)
        loadProducts()
      } else {
        alert(data.error || 'ไม่สามารถลบสินค้าได้')
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    }
  }

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCat === 'All' || p.category_name === selectedCat
    const matchSearch =
      !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="จัดการรายการเค้กและสต็อกสินค้า"
        subtitle="เพิ่ม ลบ แก้ไขราคา รายละเอียด และควบคุมสต็อกสินค้าจากระบบหลังบ้าน"
      />

      <main className="p-8 space-y-6 max-w-7xl">
        {noticeMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800 animate-in fade-in">
            <span className="flex items-center gap-2">
              <Check className="size-4" /> {noticeMessage}
            </span>
            <button onClick={() => setNoticeMessage('')}><X className="size-4" /></button>
          </div>
        )}

        {/* Action and Filter Bar */}
        <div className="bg-white rounded-3xl p-5 border border-[#35231f]/10 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#35231f]/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อเค้ก..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-[#fbf8f3] border border-[#35231f]/15 focus:outline-none focus:ring-2 focus:ring-[#b76b67]"
              />
            </div>

            {/* Category Select */}
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="text-xs bg-[#fbf8f3] border border-[#35231f]/15 rounded-full px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-[#b76b67]"
            >
              <option value="All">ทุกหมวดหมู่</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={openAddModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#35231f] hover:bg-[#b76b67] text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="size-4" /> เพิ่มเมนูเค้กใหม่
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-3xl border border-[#35231f]/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#fbf8f3] border-b border-[#35231f]/10 text-[#35231f]/70 uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-6 font-semibold">สินค้า</th>
                  <th className="py-3.5 px-4 font-semibold">หมวดหมู่</th>
                  <th className="py-3.5 px-4 font-semibold">ราคาขาย</th>
                  <th className="py-3.5 px-4 font-semibold">คงเหลือในสต็อก</th>
                  <th className="py-3.5 px-4 font-semibold">สถานะ</th>
                  <th className="py-3.5 px-4 font-semibold">ป้ายกำกับ</th>
                  <th className="py-3.5 px-6 font-semibold text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#35231f]/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#35231f]/50">
                      กำลังโหลดข้อมูลเค้กจากฐานข้อมูล...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#35231f]/50">
                      ไม่พบเค้กที่ตรงกับการค้นหา
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-[#fbf8f3] transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="relative size-12 rounded-xl overflow-hidden bg-[#ead4ca] shrink-0 border border-[#35231f]/10">
                          <Image src={p.image_url || '/cake-hero.png'} alt={p.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-serif font-bold text-sm text-[#35231f]">{p.name}</p>
                          <p className="text-[10px] text-[#35231f]/50 font-mono">/{p.slug}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[#35231f]/80 font-medium">
                        {p.category_name}
                      </td>
                      <td className="py-4 px-4 font-bold text-[#35231f]">
                        ฿{p.price.toLocaleString()}
                        {p.original_price && (
                          <span className="block text-[10px] text-[#35231f]/40 line-through">
                            ฿{p.original_price.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          p.stock === 0
                            ? 'bg-red-100 text-red-700'
                            : p.stock <= 5
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {p.stock === 0 ? 'หมดสต็อก' : `${p.stock} ชิ้น`}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-medium ${
                          p.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : p.status === 'draft'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-red-50 text-red-600'
                        }`}>
                          {p.status === 'active' ? 'เปิดขาย' : p.status === 'draft' ? 'แบบร่าง' : 'จัดเก็บ'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {p.tag ? (
                          <span className="text-[10px] bg-[#fbf5f4] text-[#b76b67] px-2 py-0.5 rounded-full font-medium border border-[#b76b67]/20">
                            {p.tag}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="size-8 rounded-lg bg-[#f0e8df] hover:bg-[#b76b67] text-[#35231f] hover:text-white grid place-items-center transition-colors"
                            title="แก้ไขสินค้า"
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="size-8 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white grid place-items-center transition-colors"
                            title="ลบสินค้า"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-[#35231f]/10">
              <h3 className="font-serif text-lg font-bold text-[#35231f]">ยืนยันการลบสินค้า</h3>
              <p className="text-xs text-[#35231f]/70 leading-relaxed">
                คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้? หากสินค้านี้เคยมีประวัติการสั่งซื้อ ระบบจะเปลี่ยนสถานะเป็น &quot;จัดเก็บ&quot; โดยอัตโนมัติ เพื่อรักษาประวัติคำสั่งซื้อของลูกค้า
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#f0e8df] hover:bg-[#e8dece]"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => handleDeleteProduct(deleteConfirmId)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white"
                >
                  ยืนยันลบ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Product Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
            <div className="relative bg-white text-[#35231f] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#35231f]/10 overflow-hidden space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#35231f]/10">
                <h2 className="font-serif text-xl font-bold">
                  {editingProduct ? 'แก้ไขข้อมูลเค้ก' : 'เพิ่มเมนูเค้กใหม่ลงในร้าน'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-[#35231f]/60 hover:text-[#35231f]">
                  <X className="size-5" />
                </button>
              </div>

              {modalError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">ชื่อเค้ก / สินค้า <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="เช่น Strawberry Cloud Special"
                      className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#b76b67]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">หมวดหมู่ <span className="text-red-500">*</span></label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                      className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#b76b67]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">ราคาขาย (บาท) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#b76b67]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">ราคาเดิม (ก่อนลด)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.original_price}
                      onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                      placeholder="เช่น 990"
                      className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#b76b67]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">จำนวนสต็อก <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                      className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#b76b67]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">รายละเอียดสินค้า</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="อธิบายเนื้อเค้ก ไส้ ครีม หรือรสชาติ..."
                    className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#b76b67]"
                  />
                </div>

                {/* Image Upload / URL */}
                <div>
                  <label className="block text-xs font-bold mb-1">รูปภาพสินค้า</label>
                  <div className="flex gap-4 items-center">
                    <div className="relative size-16 rounded-xl overflow-hidden bg-[#ead4ca] shrink-0 border border-[#35231f]/15">
                      <Image src={formData.image_url || '/cake-hero.png'} alt="Preview" fill className="object-cover" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="URL ของรูปภาพ หรือคลิกอัปโหลดด้านล่าง"
                        className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3 py-2 focus:outline-none"
                      />
                      <label className="inline-flex items-center gap-2 cursor-pointer bg-[#f0e8df] hover:bg-[#e8dece] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#35231f]">
                        <Upload className="size-3.5" />
                        {uploadingImage ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปจากคอมพิวเตอร์'}
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold mb-1">สถานะ</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3 py-2.5"
                    >
                      <option value="active">เปิดขาย (Active)</option>
                      <option value="draft">แบบร่าง (Draft)</option>
                      <option value="archived">จัดเก็บ (Archived)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">ป้ายกำกับ (Tag)</label>
                    <input
                      type="text"
                      value={formData.tag}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                      placeholder="เช่น Best seller, New, Signature"
                      className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3 py-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">โทนสีการ์ด</label>
                    <select
                      value={formData.tone}
                      onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                      className="w-full text-xs rounded-xl border border-[#35231f]/20 bg-[#fbf8f3] px-3 py-2.5"
                    >
                      <option value="rose">Rose (ชมพูพาสเทล)</option>
                      <option value="cocoa">Cocoa (น้ำตาลช็อกโกแลต)</option>
                      <option value="lemon">Lemon (เหลืองนวล)</option>
                      <option value="matcha">Matcha (เขียวมัทฉะ)</option>
                      <option value="peach">Peach (ส้มพีช)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#35231f]/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#f0e8df] hover:bg-[#e8dece]"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#35231f] hover:bg-[#b76b67] text-white shadow-md disabled:opacity-50"
                  >
                    {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลสินค้า'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
