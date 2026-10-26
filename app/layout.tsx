import type { Metadata, Viewport } from 'next'
import './globals.css'
import { CartProvider } from '@/lib/cart-context'

export const metadata: Metadata = {
  title: 'Lune Bakery — ร้านเค้กออนไลน์สไตล์พรีเมียม ขนมเค้กอบสดใหม่ทุกวัน',
  description: 'ร้านขนมเค้กออนไลน์ระดับพรีเมียม สั่งเค้กวันเกิด ชีสเค้ก เค้กผลไม้ เค้กตามสั่ง จัดส่งถึงบ้านในกรุงเทพฯ และปริมณฑล',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#35231f',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" className="scroll-smooth">
      <body className="antialiased bg-[#fbf8f3] text-[#35231f] selection:bg-[#b76b67] selection:text-white">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
