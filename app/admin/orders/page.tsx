'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft, Eye, Package, MapPin, Calendar, User, Building } from 'lucide-react'
import Link from 'next/link'

// Dynamic rendering を強制してSSG時のエラーを回避
export const dynamic = 'force-dynamic'

interface Order {
  id: string
  order_number: string | null
  customer_id: string | null
  status: string | null
  created_at: string | null
  shipping_name: string | null
  shipping_email: string | null
  shipping_phone: string | null
  shipping_postal_code: string | null
  shipping_prefecture: string | null
  shipping_city: string | null
  shipping_address: string | null
  shipping_company: string | null
  delivery_date: string | null
  note: string | null
  cancelled_by?: string | null
  cancelled_at?: string | null
  total_qty: number | null
  customer: {
    full_name: string | null
    email: string
    company_name: string | null
  } | null
  cancelled_user?: {
    full_name: string | null
    email: string
  } | null
  order_lines: Array<{
    id: string
    quantity: number | null
    product: {
      id: string
      sku: string | null
      name: string | null
    }
  }>
}

const statusOptions = [
  { value: 'pending', label: '注文確認中', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: '注文確定', color: 'bg-blue-100 text-blue-800' },
  { value: 'processing', label: '処理中', color: 'bg-purple-100 text-purple-800' },
  { value: 'shipped', label: '発送済み', color: 'bg-green-100 text-green-800' },
  { value: 'delivered', label: '配送完了', color: 'bg-gray-100 text-gray-800' },
  { value: 'cancelled', label: 'キャンセル', color: 'bg-red-100 text-red-800' },
]

export default function OrdersManagePage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const supabase = createClient()
    
    try {
      // 基本的な注文情報を取得
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (ordersError) {
        throw ordersError
      }

      // 各注文に対して関連データを取得
      const ordersWithDetails = await Promise.all(
        ordersData.map(async (order) => {
          // 顧客情報を取得
          const { data: customerData } = await supabase
            .from('user_profiles')
            .select('full_name, email, company_name')
            .eq('id', order.customer_id)
            .single()

          // キャンセル者情報を取得（該当する場合）
          let cancelledUserData = null
          if (order.cancelled_by) {
            const { data } = await supabase
              .from('user_profiles')
              .select('full_name, email')
              .eq('id', order.cancelled_by)
              .single()
            cancelledUserData = data
          }

          // 注文明細を取得
          const { data: orderLinesData } = await supabase
            .from('order_lines')
            .select(`
              id,
              quantity,
              product:products(
                id,
                sku,
                name
              )
            `)
            .eq('order_id', order.id)

          return {
            ...order,
            customer: customerData,
            cancelled_user: cancelledUserData,
            order_lines: orderLinesData || []
          }
        })
      )

      setOrders(ordersWithDetails)
    } catch (error: any) {
      console.error('注文取得エラー:', error)
      toast.error('注文の取得に失敗しました')
    }
    
    setLoading(false)
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) {
      console.error('ステータス更新エラー:', error)
      toast.error('ステータスの更新に失敗しました')
    } else {
      toast.success('ステータスを更新しました')
      fetchOrders()
    }
  }

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status)
    return statusOption || { value: status, label: status, color: 'bg-gray-100 text-gray-800' }
  }

  const filteredOrders = selectedStatus === 'all' 
    ? orders.filter(order => order.status !== 'cancelled') // キャンセル注文を除外
    : orders.filter(order => order.status === selectedStatus)

  if (loading) {
    return (
      <Navbar>
        <div className="p-8">
          <div className="text-center">読み込み中...</div>
        </div>
      </Navbar>
    )
  }

  return (
    <Navbar>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                ダッシュボードに戻る
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">注文管理</h1>
          </div>
          <Link href="/admin/orders/cancelled">
            <Button variant="outline" className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100">
              <Package className="h-4 w-4 mr-2" />
              キャンセル注文管理
              <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {orders.filter(order => order.status === 'cancelled').length}
              </span>
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          {/* フィルター */}
          <Card>
            <CardHeader>
              <CardTitle>注文フィルター</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="ステータスを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべてのステータス</SelectItem>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-sm text-muted-foreground flex items-center">
                  {filteredOrders.length}件の注文
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 注文一覧テーブル */}
          <Card>
            <CardHeader>
              <CardTitle>注文一覧</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredOrders.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  注文がありません
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">注文番号</th>
                        <th className="text-left p-3 font-medium">注文日時</th>
                        <th className="text-left p-3 font-medium">顧客情報</th>
                        <th className="text-left p-3 font-medium">配送先</th>
                        <th className="text-left p-3 font-medium">商品数</th>
                        <th className="text-left p-3 font-medium">ステータス</th>
                        <th className="text-left p-3 font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="font-medium text-blue-600">
                              {order.order_number}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              {new Date(order.created_at).toLocaleDateString('ja-JP')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(order.created_at).toLocaleTimeString('ja-JP')}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium">
                                {order.customer?.full_name || order.shipping_name}
                              </span>
                            </div>
                            {order.customer?.company_name && (
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-gray-400" />
                                <span className="text-xs text-gray-600">
                                  {order.customer.company_name}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              {order.shipping_company && (
                                <div className="font-medium text-gray-900 mb-1">
                                  {order.shipping_company}
                                </div>
                              )}
                              <div className="text-gray-600">
                                {order.shipping_prefecture}{order.shipping_city}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium">
                                {order.total_qty || order.order_lines.reduce((sum, line) => sum + line.quantity, 0)}点
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <Select
                              value={order.status}
                              onValueChange={(value) => updateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    <span className={`px-2 py-1 rounded-full text-xs ${option.color}`}>
                                      {option.label}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-3">
                            <Link href={`/admin/orders/${order.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                詳細
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>


        </div>
      </div>
    </Navbar>
  )
} 