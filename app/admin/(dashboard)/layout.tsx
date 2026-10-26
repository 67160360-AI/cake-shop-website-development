import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentAdminUser } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await getCurrentAdminUser()

  if (!admin) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen flex bg-[#f6f2ea] text-[#35231f]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
