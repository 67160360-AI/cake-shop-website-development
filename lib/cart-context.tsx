'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export interface CartItem {
  id: string // unique item id (e.g. productId + sizeOption + customMessage)
  productId: number
  name: string
  price: number
  originalPrice?: number | null
  quantity: number
  sizeOption: string
  customMessage: string
  imageUrl: string
  stock: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, delta: number) => void
  clearCart: () => void
  totalCount: number
  subtotal: number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'lune_cart_v1'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      if (saved) {
        setItems(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Failed to read cart from localStorage', e)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (!isInitialized) return
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch (e) {
      console.error('Failed to save cart to localStorage', e)
    }
  }, [items, isInitialized])

  const addItem = (newItem: Omit<CartItem, 'id'>) => {
    const id = `${newItem.productId}-${newItem.sizeOption}-${newItem.customMessage.trim()}`
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id)
      if (existing) {
        const newQty = Math.min(existing.quantity + newItem.quantity, newItem.stock)
        return prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i))
      }
      return [...prev, { ...newItem, id }]
    })
    setIsCartOpen(true)
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item
          const newQty = item.quantity + delta
          if (newQty <= 0) return null
          return { ...item, quantity: Math.min(newQty, item.stock) }
        })
        .filter(Boolean) as CartItem[]
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
