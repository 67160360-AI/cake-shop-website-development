'use client'

import React from 'react'
import { ShieldCheck, User } from 'lucide-react'

interface AdminHeaderProps {
  title: string
  subtitle?: string
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  return (
    <header className="h-20 bg-white border-b border-[#35231f]/10 px-8 flex items-center justify-between">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#35231f]">{title}</h1>
        {subtitle && <p className="text-xs text-[#35231f]/60 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 bg-[#fbf8f3] border border-[#35231f]/10 px-3.5 py-1.5 rounded-full text-xs text-[#35231f]">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium">แอดมิน (Super Admin)</span>
          <ShieldCheck className="size-3.5 text-[#b76b67]" />
        </div>
      </div>
    </header>
  )
}
