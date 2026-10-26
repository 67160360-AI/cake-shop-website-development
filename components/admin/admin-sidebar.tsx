'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Cake, ShoppingCart, Settings, LogOut, ExternalLink, ShieldCheck } from 'lucide-react'

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (e) {
      console.error(e)
    }
  }

  const links = [
    { label: 'ภาพรวมระบบ (Overview)', href: '/admin', icon: LayoutDashboard },
    { label: 'จัดการเค้ก & สต็อก', href: '/admin/products', icon: Cake },
    { label: 'จัดการคำสั่งซื้อ', href: '/admin/orders', icon: ShoppingCart },
    { label: 'ตั้งค่าร้าน & โปรโมชั่น', href: '/admin/settings', icon: Settings },
  ]

  return (
    <aside className="w-64 bg-[#2a1b18] text-[#fbf8f3] border-r border-white/10 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-[#b76b67] text-white font-serif font-bold text-base shadow-sm">
            L
          </span>
          <div>
            <span className="font-serif font-bold text-sm tracking-tight block text-white">
              Lune Admin
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[#e5c468] block">
              Backoffice Portal
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 text-xs font-medium">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-[#b76b67] text-white font-semibold shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="size-4 shrink-0" />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="size-3.5" />
            เปิดดูหน้าร้าน (Storefront)
          </span>
          <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/60">New tab</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs text-red-300 hover:text-red-100 hover:bg-red-500/15 transition-colors"
        >
          <LogOut className="size-3.5" />
          <span>ออกจากระบบ (Logout)</span>
        </button>
      </div>
    </aside>
  )
}
