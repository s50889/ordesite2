"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface Order {
  id: string
  order_number: string
  total_qty: number
  shipping_name: string
  shipping_address1: string
  shipping_city: string
  shipping_prefecture: string
  shipping_postal_code: string
  status: string
  requested_at: string
  order_lines?: {
    id: string
    quantity: number
    product: {
      id: string
      name: string
      sku: string
    }
  }[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setLoading(false)
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        order_lines (
          id,
          quantity,
          product:products (
            id,
            name,
            sku
          )
        )
      `)
      .eq('customer_id', user.id)
      .order('requested_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  const handleCancel = async (orderId: string) => {
    if (!confirm('本当にこの注文をキャンセルしますか？')) return
    try {
      const res = await fetch(`/orders/${orderId}/cancel`, {
        method: 'PATCH',
      })
      const data = await res.json()
      if (res.ok) {
        alert('注文をキャンセルしました')
        fetchOrders()
      } else {
        alert(data.error || 'キャンセルに失敗しました')
      }
    } catch (e) {
      alert('通信エラーが発生しました')
    }
  }

  if (loading) {
    return (
      <Navbar>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">読み込み中...</div>
        </div>
      </Navbar>
    )
  }

  return (
    <Navbar>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">注文履歴</h1>
        {orders.length === 0 ? (
          <div className="text-center text-gray-500">注文履歴がありません。</div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold mb-1">注文番号: {order.order_number}</div>
                    <div className="text-sm text-gray-600 mb-1">注文日: {order.requested_at ? new Date(order.requested_at).toLocaleDateString() : '-'}</div>
                    <div className="text-sm text-gray-600 mb-1">合計数量: <span className="font-bold">{order.total_qty ?? '-'} 点</span></div>
                    {order.order_lines && order.order_lines.length > 0 && (
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">商品: </span>
                        {order.order_lines.map((line, index) => (
                          <span key={line.id}>
                            {line.product.name} (数量: {line.quantity})
                            {index < order.order_lines!.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="text-sm text-gray-600 mb-1">配送先: {order.shipping_name}（{order.shipping_postal_code} {order.shipping_prefecture}{order.shipping_city}{order.shipping_address1}）</div>
                    <div className="text-sm text-gray-600 mb-1">ステータス: {order.status}</div>
                  </div>
                  <div className="flex-shrink-0 flex flex-col gap-2 items-end">
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline">詳細を見る</Button>
                    </Link>
                    {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing') && (
                      <Button variant="destructive" onClick={() => handleCancel(order.id)}>
                        キャンセル
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Navbar>
  )
} 