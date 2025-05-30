"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { ShoppingCart, MapPin, CalendarDays, FileText, Package, Send } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { useCart } from '@/hooks/use-cart'
import Image from 'next/image'

interface ShippingAddress {
  id: string
  company?: string
  site_name?: string
  postal_code: string
  prefecture: string
  city: string
  address1: string
  phone: string
  is_default: boolean
  created_at: string
}

export default function OrderCheckPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { items, clearCart } = useCart()
  const [address, setAddress] = useState<ShippingAddress | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const addressId = searchParams.get('addressId')
  const note = searchParams.get('note') || ''
  const deliveryDate = searchParams.get('deliveryDate') || ''

  useEffect(() => {
    fetchAddress()
  }, [addressId])

  const fetchAddress = async () => {
    if (!addressId) {
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('id', addressId)
      .eq('user_id', user.id)
      .single()

    setAddress(data)
    setLoading(false)
  }

  const handleSubmitOrder = async () => {
    if (!address || items.length === 0) {
      alert('注文情報が不完全です')
      return
    }

    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 今日の日付を取得（YYYYMMDD形式）
      const today = new Date()
      const dateStr = today.getFullYear().toString() + 
                     (today.getMonth() + 1).toString().padStart(2, '0') + 
                     today.getDate().toString().padStart(2, '0')

      // 今日の注文数を取得して連番を決定
      const { data: todayOrders, error: countError } = await supabase
        .from('orders')
        .select('order_number')
        .like('order_number', `ORD-${dateStr}-%`)
        .order('created_at', { ascending: false })

      if (countError) {
        console.error('注文数取得エラー:', countError)
        throw countError
      }

      // 今日の注文番号の最大値を取得して次の連番を決定
      let nextNumber = 1
      if (todayOrders && todayOrders.length > 0) {
        const lastOrderNumber = todayOrders[0].order_number
        const lastNumber = parseInt(lastOrderNumber.split('-')[2])
        nextNumber = lastNumber + 1
      }

      const orderNumber = `ORD-${dateStr}-${nextNumber.toString().padStart(3, '0')}`

      // 注文データを作成
      const orderData = {
        customer_id: user.id,
        status: 'pending',
        total_qty: items.reduce((sum, item) => sum + item.quantity, 0),
        shipping_company: address.company,
        shipping_name: address.company ?? '',
        shipping_phone: address.phone,
        shipping_postal_code: address.postal_code,
        shipping_prefecture: address.prefecture,
        shipping_city: address.city,
        shipping_address1: address.address1,
        shipping_address: `${address.prefecture}${address.city}${address.address1}`,
        order_number: orderNumber,
        delivery_date: deliveryDate,
        note: note,
        requested_at: new Date().toISOString()
      }

      // 注文を作成
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single()

      if (orderError) throw orderError

      // 注文アイテムを作成
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        note: item.product.name ? `${item.product.name} (${item.product.sku})` : null
      }))

      const { error: itemsError } = await supabase
        .from('order_lines')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // カートをクリア
      clearCart()

      // 注文完了画面へ
      router.push(`/order-success?orderId=${order.id}`)

    } catch (error: any) {
      console.error('注文エラー:', error)
      alert('注文に失敗しました: ' + (error?.message || '不明なエラー'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Navbar>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 animate-spin">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <p className="text-slate-600 font-medium">注文内容を確認中...</p>
          </div>
        </div>
      </Navbar>
    )
  }

  if (!address || items.length === 0) {
    return (
      <Navbar>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-8 text-red-600">エラー</h1>
            <p className="text-slate-600 mb-6">注文情報が不完全です。</p>
            <Button onClick={() => router.push('/cart')} className="bg-blue-600 text-white">
              カートに戻る
            </Button>
          </div>
        </div>
      </Navbar>
    )
  }

  return (
    <Navbar>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-center">注文内容確認</h1>

          {/* カート内容 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                注文商品 ({items.length}点)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                    {item.product.image_url ? (
                      <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-slate-100 to-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">{item.product.name}</h3>
                      <p className="text-sm text-slate-500">製品番号: {item.product.sku}</p>
                      <p className="text-sm text-slate-600">数量: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-right font-semibold">合計数量: {items.reduce((sum, item) => sum + item.quantity, 0)}</p>
              </div>
            </CardContent>
          </Card>

          {/* 配送先情報 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                配送先
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="font-semibold text-slate-900">{address.company}</div>
                {address.site_name && (
                  <div className="text-sm text-slate-600">{address.site_name}</div>
                )}
                <div className="text-sm text-slate-600">〒{address.postal_code}</div>
                <div className="text-sm text-slate-900">
                  {address.prefecture}{address.city}{address.address1}
                </div>
                <div className="text-sm text-slate-600">TEL: {address.phone}</div>
              </div>
            </CardContent>
          </Card>

          {/* 配送希望日 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarDays className="w-5 h-5 mr-2" />
                配送希望日
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-900 font-medium">{deliveryDate}</p>
            </CardContent>
          </Card>

          {/* 備考 */}
          {note && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  備考
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-900 whitespace-pre-wrap">{decodeURIComponent(note)}</p>
              </CardContent>
            </Card>
          )}

          {/* 注文確定ボタン */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
              disabled={submitting}
            >
              戻る
            </Button>
            <Button
              onClick={handleSubmitOrder}
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-105"
            >
              <Send className="w-5 h-5 mr-2" />
              {submitting ? '注文中...' : '注文を確定する'}
            </Button>
          </div>
        </div>
      </div>
    </Navbar>
  )
} 