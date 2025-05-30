import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { generateUUID } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'

export interface CartItem {
  id: string
  productId: string
  product: {
    id: string
    sku: string
    name: string
    specs: string | null
    image_url: string | null
    moq: number
  }
  quantity: number
  note?: string
}

export function useCart() {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCart()
  }, [user])

  const getCartKey = () => user ? `cart_${user.id}` : 'cart_guest'

  const loadCart = () => {
    const cartData = localStorage.getItem(getCartKey())
    setItems(cartData ? JSON.parse(cartData) : [])
    setLoading(false)
  }

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems)
    localStorage.setItem(getCartKey(), JSON.stringify(newItems))
  }

  const addToCart = async (productId: string, quantity: number = 1, note?: string) => {
    const supabase = createClient()

    // 製品情報を取得
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (!product) {
      throw new Error('製品が見つかりません')
    }

    // 製品データを適切な形式に変換
    const productData = {
      id: product.id,
      sku: product.sku || '',
      name: product.name || '',
      specs: product.specs,
      image_url: product.image_url,
      moq: product.moq || 1
    }

    // 既存のアイテムを確認
    const existingItemIndex = items.findIndex(item => item.productId === productId)

    if (existingItemIndex >= 0) {
      // 既存のアイテムの数量を更新
      const newItems = [...items]
      newItems[existingItemIndex].quantity += quantity
      saveCart(newItems)
    } else {
      // 新しいアイテムを追加
      const newItem: CartItem = {
        id: generateUUID(),
        productId,
        product: productData,
        quantity,
        note
      }
      const newItems = [...items, newItem]
      saveCart(newItems)
    }
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    const newItems = items.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity }
      }
      return item
    })
    saveCart(newItems)
  }

  const updateNote = (itemId: string, note: string) => {
    const newItems = items.map(item => {
      if (item.id === itemId) {
        return { ...item, note }
      }
      return item
    })
    saveCart(newItems)
  }

  const removeItem = (itemId: string) => {
    const newItems = items.filter(item => item.id !== itemId)
    saveCart(newItems)
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem(getCartKey())
  }

  return {
    items,
    loading,
    addToCart,
    updateQuantity,
    updateNote,
    removeItem,
    clearCart
  }
} 