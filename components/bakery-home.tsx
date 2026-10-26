'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { ArrowRight, ChevronDown, Heart, Menu, Search, ShoppingBag, Sparkles, X } from 'lucide-react'

const products = [
  { name: 'Strawberry Cloud', category: 'Birthday cakes', price: 890, tag: 'Best seller', tone: 'rose', description: 'Vanilla sponge, strawberry compote, and cloud-soft cream.' },
  { name: 'Dark Cocoa Muse', category: 'Chocolate cakes', price: 990, tag: 'New', tone: 'cocoa', description: 'Velvety dark chocolate cake with a glossy ganache finish.' },
  { name: 'Yuzu Cheesecake', category: 'Cheesecakes', price: 790, tag: 'Fresh pick', tone: 'lemon', description: 'Silky baked cheesecake brightened with Japanese yuzu.' },
]

const categories = [
  { label: 'Birthday cakes', count: '12 cakes', tone: 'bg-[#f5d8d7]', icon: '✦' },
  { label: 'Chocolate', count: '8 cakes', tone: 'bg-[#e7d4c4]', icon: '◒' },
  { label: 'Cheesecake', count: '6 cakes', tone: 'bg-[#f1e6c9]', icon: '○' },
  { label: 'Cupcakes', count: '10 cakes', tone: 'bg-[#e2e9dc]', icon: '✿' },
]

export function BakeryHome() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [activeCategory, setActiveCategory] = useState('All cakes')
  const filteredProducts = useMemo(() => activeCategory === 'All cakes' ? products : products.filter((product) => product.category === activeCategory), [activeCategory])

  return (
    <main className="min-h-screen overflow-hidden bg-[#fbf8f3] text-[#35231f]">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-[#35231f]/10 py-5">
          <a href="#top" className="flex items-center gap-3" aria-label="Lune Bakery home">
            <span className="grid size-10 place-items-center rounded-full bg-[#35231f] text-lg text-[#fbf8f3]">L</span>
            <span className="font-serif text-xl tracking-tight">Lune Bakery</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-[#35231f]/70 md:flex" aria-label="Main navigation">
            <a className="text-[#35231f]" href="#shop">Shop</a><a href="#story" className="transition-colors hover:text-[#b76b67]">Our story</a><a href="#journal" className="transition-colors hover:text-[#b76b67]">Journal</a>
          </nav>
          <div className="flex items-center gap-2">
            <button className="hidden size-10 place-items-center rounded-full transition-colors hover:bg-[#f0e8df] sm:grid" aria-label="Search"><Search className="size-[18px]" strokeWidth={1.6} /></button>
            <button onClick={() => setCartCount((count) => count + 1)} className="relative grid size-10 place-items-center rounded-full transition-colors hover:bg-[#f0e8df]" aria-label={`Shopping bag, ${cartCount} items`}><ShoppingBag className="size-[18px]" strokeWidth={1.6} />{cartCount > 0 && <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-[#b76b67] text-[10px] text-white">{cartCount}</span>}</button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="grid size-10 place-items-center rounded-full transition-colors hover:bg-[#f0e8df] md:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button>
          </div>
        </header>
        {menuOpen && <nav className="flex flex-col gap-4 border-b border-[#35231f]/10 py-5 text-sm md:hidden"><a href="#shop">Shop</a><a href="#story">Our story</a><a href="#journal">Journal</a></nav>}

        <section id="top" className="grid items-center gap-10 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-20">
          <div className="max-w-xl">
            <div className="mb-7 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-[#b76b67]"><Sparkles className="size-4" /> Baked with intention</div>
            <h1 className="font-serif text-[clamp(3.5rem,8vw,7.2rem)] leading-[0.88] tracking-[-0.06em]">A little<br /><em className="font-normal text-[#b76b67]">sweetness</em><br />for today.</h1>
            <p className="mt-8 max-w-sm text-base leading-7 text-[#35231f]/65">Small-batch cakes made to turn everyday moments into something worth remembering.</p>
            <div className="mt-9 flex flex-wrap items-center gap-4"><a href="#shop" className="inline-flex items-center gap-3 rounded-full bg-[#35231f] px-6 py-3.5 text-sm text-[#fbf8f3] transition-transform hover:-translate-y-0.5">Explore cakes <ArrowRight className="size-4" /></a><a href="#story" className="text-sm underline decoration-[#b76b67]/50 underline-offset-8 transition-colors hover:text-[#b76b67]">Meet the bakers</a></div>
          </div>
          <div className="relative aspect-[1.12] overflow-hidden rounded-[2rem] bg-[#ead4ca] lg:rounded-[3rem]"><Image src="/cake-hero.png" alt="Strawberry cream cake on a pedestal" fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 55vw" /><div className="absolute bottom-5 left-5 rounded-full bg-[#fbf8f3]/90 px-4 py-2 text-xs tracking-wide backdrop-blur-sm">Made fresh in Bangkok</div></div>
        </section>

        <section className="grid grid-cols-2 gap-3 pb-20 sm:grid-cols-4 sm:gap-5" aria-label="Cake categories">{categories.map((category) => <button key={category.label} onClick={() => { setActiveCategory(category.label); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }) }} className={`${category.tone} group rounded-2xl p-5 text-left transition-transform hover:-translate-y-1 sm:p-6`}><span className="text-3xl text-[#35231f]/60">{category.icon}</span><span className="mt-8 block text-sm font-medium">{category.label}</span><span className="mt-1 block text-xs text-[#35231f]/55">{category.count}</span></button>)}</section>

        <section id="shop" className="border-t border-[#35231f]/10 py-20"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#b76b67]">The collection</p><h2 className="font-serif text-5xl tracking-[-0.04em] sm:text-6xl">Good things,<br /><em className="font-normal text-[#b76b67]">baked daily.</em></h2></div><a href="#all" className="group flex items-center gap-2 pb-1 text-sm">View all cakes <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></a></div>
          <div className="mt-10 flex flex-wrap gap-2" role="tablist" aria-label="Product categories">{['All cakes', 'Birthday cakes', 'Chocolate cakes', 'Cheesecakes'].map((category) => <button key={category} onClick={() => setActiveCategory(category)} className={`rounded-full px-4 py-2 text-xs transition-colors ${activeCategory === category ? 'bg-[#35231f] text-[#fbf8f3]' : 'bg-[#f0e8df] text-[#35231f]/65 hover:bg-[#e7d9cc]'}`}>{category}</button>)}</div>
          <div className="mt-8 grid gap-x-5 gap-y-10 md:grid-cols-3">{filteredProducts.map((product, index) => <article key={product.name} className="group"><div className={`relative aspect-[0.9] overflow-hidden rounded-[1.5rem] ${product.tone === 'rose' ? 'bg-[#e8bebe]' : product.tone === 'cocoa' ? 'bg-[#b7957b]' : 'bg-[#efe3b9]'}`}><div className="absolute inset-8 grid place-items-center rounded-full bg-white/20 blur-2xl" /><div className="absolute inset-0 grid place-items-center"><div className="size-44 rounded-full bg-white/75 shadow-[0_24px_40px_rgba(78,42,27,0.16)]"><div className="mx-auto mt-[-8px] h-8 w-36 rounded-t-full bg-[#fff9ed]" /><div className="mx-auto mt-8 h-20 w-36 rounded-[50%] bg-[#fffaf0]" /></div></div><span className="absolute left-4 top-4 rounded-full bg-[#fbf8f3]/85 px-3 py-1.5 text-[11px] backdrop-blur-sm">{product.tag}</span><button className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-[#fbf8f3]/85 opacity-0 transition-opacity group-hover:opacity-100" aria-label={`Save ${product.name}`}><Heart className="size-4" strokeWidth={1.6} /></button></div><div className="mt-4 flex items-start justify-between gap-3"><div><p className="font-serif text-2xl">{product.name}</p><p className="mt-1 max-w-[210px] text-xs leading-5 text-[#35231f]/55">{product.description}</p></div><p className="text-sm font-medium">฿{product.price.toLocaleString()}</p></div><button onClick={() => setCartCount((count) => count + 1)} className="mt-4 flex items-center gap-2 text-xs font-medium text-[#b76b67] opacity-100 transition-all hover:gap-3">Add to bag <ArrowRight className="size-3.5" /></button></article>)}</div>
        </section>

        <section id="story" className="grid gap-10 border-t border-[#35231f]/10 py-20 md:grid-cols-2 md:items-center"><div className="rounded-[2rem] bg-[#e9e1d7] p-10 sm:p-16"><p className="font-serif text-6xl leading-none text-[#b76b67]">“</p><p className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">The best memories usually start with a little flour on the table.</p><p className="mt-8 text-xs uppercase tracking-[0.16em] text-[#35231f]/55">— Mina, founder & head baker</p></div><div className="max-w-md md:pl-10"><p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#b76b67]">Our little kitchen</p><h2 className="font-serif text-5xl leading-[0.95] tracking-[-0.04em]">Made slowly.<br />Shared gladly.</h2><p className="mt-7 text-sm leading-7 text-[#35231f]/65">We believe a cake should feel personal. Every Lune cake is baked in small batches with seasonal ingredients, thoughtful details, and plenty of time.</p><a href="#journal" className="mt-8 inline-flex items-center gap-2 text-sm underline decoration-[#b76b67]/50 underline-offset-8">Read our story <ArrowRight className="size-4" /></a></div></section>

        <footer id="journal" className="flex flex-col gap-10 border-t border-[#35231f]/10 py-10 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-[#35231f] text-sm text-[#fbf8f3]">L</span><span className="font-serif text-lg">Lune Bakery</span></div><p className="mt-4 text-xs text-[#35231f]/55">Small joys, baked daily.<br />Bangkok · Thailand</p></div><div className="flex gap-6 text-xs text-[#35231f]/60"><a href="#shop">Shop</a><a href="#story">Our story</a><a href="#contact">Contact</a></div><p className="text-xs text-[#35231f]/40">© 2026 Lune Bakery</p></footer>
      </div>
    </main>
  )
}
