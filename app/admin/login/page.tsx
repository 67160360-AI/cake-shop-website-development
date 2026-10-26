'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'เข้าสู่ระบบไม่สำเร็จ')
        setIsLoading(false)
        return
      }

      // Success -> Redirect to Admin Overview
      router.push('/admin')
      router.refresh()
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#241714] text-[#fbf8f3] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-40 -left-40 size-96 rounded-full bg-[#b76b67]/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 size-96 rounded-full bg-[#d4af37]/15 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md z-10">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-grid size-14 place-items-center rounded-2xl bg-[#35231f] border border-white/15 text-2xl font-serif text-[#fbf8f3] mb-4 shadow-xl">
            L
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
            Lune Bakery Admin
          </h1>
          <p className="text-xs text-white/60 mt-1">
            ระบบจัดการร้านและคลังสินค้าหลังบ้าน (ผู้ดูแลระบบ)
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#2f1f1b]/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10 text-xs font-semibold text-[#e5c468]">
            <ShieldCheck className="size-4" />
            <span>เข้าสู่ระบบเฉพาะผู้ดูแลร้านที่ได้รับอนุญาต</span>
          </div>

          {error && (
            <div className="p-3.5 bg-red-500/15 border border-red-500/30 rounded-xl flex items-center gap-2.5 text-xs text-red-200">
              <AlertCircle className="size-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                อีเมลหรือชื่อผู้ใช้ (Email / Username)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lunebakery.com"
                  className="w-full text-xs rounded-xl border border-white/15 bg-black/30 px-3.5 py-3 pl-10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#b76b67]"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs rounded-xl border border-white/15 bg-black/30 px-3.5 py-3 pl-10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#b76b67]"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#b76b67] to-[#9b514d] text-white py-3.5 text-xs font-bold hover:brightness-110 transition-all shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <span>กำลังตรวจสอบสิทธิ์...</span>
              ) : (
                <>
                  เข้าสู่ระบบแอดมิน
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* Safe Initial Credentials Hint for Local Demo */}
          <div className="pt-2 border-t border-white/10 text-[11px] text-white/50 space-y-1">
            <p className="font-semibold text-white/70">ข้อมูลบัญชีเริ่มต้นสำหรับทดสอบระบบ:</p>
            <p>อีเมล: <code className="text-[#e5c468] font-mono">admin@lunebakery.com</code></p>
            <p>รหัสผ่าน: <code className="text-[#e5c468] font-mono">AdminLune2026!</code></p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-xs text-white/60 hover:text-white transition-colors underline underline-offset-4"
          >
            &larr; กลับไปยังหน้าร้าน Lune Bakery
          </Link>
        </div>
      </div>
    </div>
  )
}
