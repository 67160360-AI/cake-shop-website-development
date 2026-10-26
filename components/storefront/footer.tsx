import React from 'react'
import Link from 'next/link'
import { Heart, MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-[#35231f]/10 bg-[#f6f0e6] text-[#35231f] pt-16 pb-12">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-[#35231f]/10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-[#35231f] text-base font-serif text-[#fbf8f3]">
                L
              </span>
              <span className="font-serif text-xl font-bold tracking-tight">Lune Bakery</span>
            </div>
            <p className="text-xs leading-relaxed text-[#35231f]/70">
              ร้านเบเกอรี่ขนมอบสดใหม่สไตล์ Modern Artisanal คัดสรรวัตถุดิบนำเข้าพรีเมียม เพื่อให้ทุกคำหวานคือช่วงเวลาที่น่าจดจำที่สุดของคุณ
            </p>
            <div className="pt-2 text-xs text-[#b76b67] font-medium flex items-center gap-1.5">
              <Heart className="size-3.5 fill-[#b76b67]" />
              อบสดใหม่ด้วยความตั้งใจในกรุงเทพฯ
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-semibold tracking-wider uppercase text-[#35231f]">
              เมนูแนะนำ
            </h3>
            <ul className="space-y-2 text-xs text-[#35231f]/75">
              <li>
                <Link href="/products?category=Birthday+cakes" className="hover:text-[#b76b67] transition-colors">
                  เค้กวันเกิด (Birthday Cakes)
                </Link>
              </li>
              <li>
                <Link href="/products?category=Chocolate+cakes" className="hover:text-[#b76b67] transition-colors">
                  เค้กช็อกโกแลตฟัดจ์เข้มข้น
                </Link>
              </li>
              <li>
                <Link href="/products?category=Cheesecakes" className="hover:text-[#b76b67] transition-colors">
                  ชีสเค้กยูซุ & นิวยอร์กชีสเค้ก
                </Link>
              </li>
              <li>
                <Link href="/products?category=Custom+cakes" className="hover:text-[#b76b67] transition-colors">
                  เค้กสั่งทำพิเศษ (Custom Design)
                </Link>
              </li>
              <li>
                <Link href="/order-lookup" className="hover:text-[#b76b67] transition-colors font-semibold text-[#b76b67]">
                  🔍 ตรวจสอบสถานะคำสั่งซื้อ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-semibold tracking-wider uppercase text-[#35231f]">
              ข้อมูลการติดต่อ
            </h3>
            <ul className="space-y-2.5 text-xs text-[#35231f]/75">
              <li className="flex items-start gap-2">
                <MapPin className="size-4 text-[#b76b67] shrink-0 mt-0.5" />
                <span>49 สุขุมวิท ซอย 49, แขวงคลองตันเหนือ, วัฒนา, กทม. 10110</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="size-4 text-[#b76b67] shrink-0" />
                <span>เปิดบริการทุกวัน: 08:30 - 19:30 น.</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-[#b76b67] shrink-0" />
                <span>02-890-1234, 081-234-5678</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-[#b76b67] shrink-0" />
                <span>hello@lunebakery.com</span>
              </li>
            </ul>
          </div>

          {/* Delivery & Policies */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-semibold tracking-wider uppercase text-[#35231f]">
              การจัดส่ง & นโยบาย
            </h3>
            <p className="text-xs text-[#35231f]/70 leading-relaxed">
              จัดส่งด้วยรถยนต์ควบคุมอุณหภูมิเฉพาะ เพื่อรักษาความเย็นและรูปทรงเค้กให้สมบูรณ์แบบที่สุดถึงมือคุณ
            </p>
            <div className="pt-2">
              <div className="p-3 bg-white/70 rounded-xl border border-[#35231f]/10 text-[11px] space-y-1">
                <p className="font-semibold text-[#35231f]">เงื่อนไขการสั่งซื้อ:</p>
                <p className="text-[#35231f]/65">แนะนำสั่งจองล่วงหน้าอย่างน้อย 1 วัน สำหรับเค้กสั่งทำพิเศษ 2-3 วัน</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#35231f]/50">
          <p>© {new Date().getFullYear()} Lune Bakery Co., Ltd. สงวนลิขสิทธิ์ทั้งหมด</p>
          <div className="flex items-center gap-6">
            <Link href="/admin/login" className="flex items-center gap-1.5 hover:text-[#35231f] transition-colors">
              <ShieldCheck className="size-3.5 text-[#b76b67]" />
              <span>เข้าสู่ระบบผู้ดูแล (Admin Login)</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
