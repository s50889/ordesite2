'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { ArrowLeft, Eye, Package, MapPin, Calendar, User, Building, Search, X, AlertTriangle, Clock } from 'lucide-react'
import Link from 'next/link'

interface CancelledOrder {
  id: string
  order_number: string
  customer_id: string
  status: string
  created_at: string
  cancelled_at: string | null
  cancelled_by: string | null
  shipping_name: string
  shipping_email: string
  shipping_phone: string | null
  shipping_postal_code: string
  shipping_prefecture: string
  shipping_city: string
  shipping_address: string
  shipping_company: string | null
  delivery_date: string | null
  note: string | null
  total_qty: number
  customer: {
    full_name: string | null
    email: string
    company_name: string | null
  }
  cancelled_user?: {
    full_name: string | null
    email: string
  } | null
  order_lines: Array<{
    id: string
    quantity: number
    product: {
      id: string
      sku: string
      name: string
    }
  }>
}

export default function CancelledOrdersPage() {
  const [orders, setOrders] = useState<CancelledOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    fetchCancelledOrders()
  }, [])

  const fetchCancelledOrders = async () => {
    const supabase = createClient()
    
    try {
      // キャンセルされた注文のみを取得
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'cancelled')
        .order('cancelled_at', { ascending: false })

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

          // キャンセル者情報を取得
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
      console.error('キャンセル注文取得エラー:', error)
      toast.error('キャンセル注文の取得に失敗しました')
    }
    
    setLoading(false)
  }

  const restoreOrder = async (orderId: string) => {
    if (!confirm('この注文を復元しますか？ステータスが「注文確認中」に戻ります。')) {
      return
    }

    const supabase = createClient()
    
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'pending',
        cancelled_at: null,
        cancelled_by: null
      })
      .eq('id', orderId)

    if (error) {
      console.error('注文復元エラー:', error)
      toast.error('注文の復元に失敗しました')
    } else {
      toast.success('注文を復元しました')
      fetchCancelledOrders()
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.company_name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDate = dateFilter === '' || 
      (order.cancelled_at && order.cancelled_at.startsWith(dateFilter))

    return matchesSearch && matchesDate
  })

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
        <div className="flex items-center mb-6">
          <Link href="/admin/orders">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              注文管理に戻る
            </Button>
          </Link>
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">キャンセル注文管理</h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* 統計情報 */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <X className="h-8 w-8 text-red-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">総キャンセル数</p>
                    <p className="text-2xl font-bold text-red-600">{orders.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">今月のキャンセル</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {orders.filter(order => {
                        if (!order.cancelled_at) return false
                        const cancelledDate = new Date(order.cancelled_at)
                        const now = new Date()
                        return cancelledDate.getMonth() === now.getMonth() && 
                               cancelledDate.getFullYear() === now.getFullYear()
                      }).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* フィルター */}
          <Card>
            <CardHeader>
              <CardTitle>検索・フィルター</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="注文番号、顧客名、会社名で検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-48">
                  <Input
                    type="date"
                    placeholder="キャンセル日で絞り込み"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>
                <div className="text-sm text-muted-foreground flex items-center">
                  {filteredOrders.length}件のキャンセル注文
                </div>
              </div>
            </CardContent>
          </Card>

          {/* キャンセル注文一覧 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">キャンセル済み注文一覧</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredOrders.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  {searchQuery || dateFilter ? '条件に一致するキャンセル注文がありません' : 'キャンセル注文がありません'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">注文番号</th>
                        <th className="text-left p-3 font-medium">注文日時</th>
                        <th className="text-left p-3 font-medium">キャンセル日時</th>
                        <th className="text-left p-3 font-medium">顧客情報</th>
                        <th className="text-left p-3 font-medium">キャンセル者</th>
                        <th className="text-left p-3 font-medium">商品数</th>
                        <th className="text-left p-3 font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-red-50">
                          <td className="p-3">
                            <div className="font-medium text-red-600">
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
                            {order.cancelled_at ? (
                              <>
                                <div className="text-sm text-red-600 font-medium">
                                  {new Date(order.cancelled_at).toLocaleDateString('ja-JP')}
                                </div>
                                <div className="text-xs text-red-500">
                                  {new Date(order.cancelled_at).toLocaleTimeString('ja-JP')}
                                </div>
                              </>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
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
                              {order.cancelled_user?.full_name || order.cancelled_user?.email || 'システム'}
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
                            <div className="flex gap-2">
                              <Link href={`/admin/orders/${order.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  詳細
                                </Button>
                              </Link>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => restoreOrder(order.id)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                復元
                              </Button>
                            </div>
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