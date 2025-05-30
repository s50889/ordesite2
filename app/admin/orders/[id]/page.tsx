'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft, MapPin, Calendar, User, Building, Package, Phone, Mail, FileText, Clock } from 'lucide-react'
import Link from 'next/link'

interface OrderDetail {
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
  shipping_address1: string | null
  shipping_address: string | null
  shipping_company: string | null
  delivery_date: string | null
  note: string | null
  cancelled_by?: string | null
  cancelled_at?: string | null
  total_qty: number | null
  requested_at: string | null
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
    note: string | null
    product: {
      id: string
      sku: string | null
      name: string | null
      description: string | null
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

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchOrderDetail(params.id as string)
    }
  }, [params.id])

  const fetchOrderDetail = async (orderId: string) => {
    const supabase = createClient()
    
    try {
      // まず基本的な注文情報を取得
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (orderError) {
        throw orderError
      }

      // 顧客情報を取得
      const { data: customerData } = await supabase
        .from('user_profiles')
        .select('full_name, email, company_name')
        .eq('id', orderData.customer_id)
        .single()

      // キャンセル者情報を取得（該当する場合）
      let cancelledUserData = null
      if (orderData.cancelled_by) {
        const { data } = await supabase
          .from('user_profiles')
          .select('full_name, email')
          .eq('id', orderData.cancelled_by)
          .single()
        cancelledUserData = data
      }

      // 注文明細を取得
      const { data: orderLinesData, error: linesError } = await supabase
        .from('order_lines')
        .select(`
          id,
          quantity,
          note,
          product:products(
            id,
            sku,
            name,
            description
          )
        `)
        .eq('order_id', orderId)

      if (linesError) {
        console.error('注文明細取得エラー:', linesError)
      }

      // データを結合
      const completeOrderData = {
        ...orderData,
        customer: customerData,
        cancelled_user: cancelledUserData,
        order_lines: orderLinesData || []
      }

      setOrder(completeOrderData)
    } catch (error: any) {
      console.error('注文詳細取得エラー:', error)
      console.error('エラー詳細:', JSON.stringify(error, null, 2))
      toast.error(`注文詳細の取得に失敗しました: ${error.message || 'Unknown error'}`)
      router.push('/admin/orders')
    }
    
    setLoading(false)
  }

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return

    const supabase = createClient()
    
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', order.id)

    if (error) {
      console.error('ステータス更新エラー:', error)
      toast.error('ステータスの更新に失敗しました')
    } else {
      toast.success('ステータスを更新しました')
      setOrder({ ...order, status: newStatus })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status)
    return statusOption || { value: status, label: status, color: 'bg-gray-100 text-gray-800' }
  }

  if (loading) {
    return (
      <Navbar>
        <div className="p-8">
          <div className="text-center">読み込み中...</div>
        </div>
      </Navbar>
    )
  }

  if (!order) {
    return (
      <Navbar>
        <div className="p-8">
          <div className="text-center text-red-600">注文が見つかりません</div>
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
              注文一覧に戻る
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">注文詳細</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* 左カラム - 注文基本情報 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 注文基本情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>注文基本情報</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(order.status || '').color}`}>
                    {getStatusBadge(order.status || '').label}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">注文番号</label>
                    <div className="text-lg font-mono font-bold text-blue-600">{order.order_number || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">注文日時</label>
                    <div className="text-sm">{order.created_at ? new Date(order.created_at).toLocaleString('ja-JP') : 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">依頼日時</label>
                    <div className="text-sm">{order.requested_at ? new Date(order.requested_at).toLocaleString('ja-JP') : 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">合計数量</label>
                    <div className="text-sm font-medium">{order.total_qty ?? 0}点</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 顧客情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  顧客情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">顧客名</label>
                  <div className="text-sm font-medium">{order.customer?.full_name || order.shipping_name}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">メールアドレス</label>
                  <div className="text-sm">{order.customer?.email || order.shipping_email}</div>
                </div>
                {order.customer?.company_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">会社名</label>
                    <div className="text-sm">{order.customer.company_name}</div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">顧客ID</label>
                  <div className="text-xs font-mono text-gray-600">{order.customer_id}</div>
                </div>
              </CardContent>
            </Card>

            {/* 配送先情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  配送先情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.shipping_company && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">支店名・現場名</label>
                    <div className="text-sm font-medium">{order.shipping_company}</div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">宛先名</label>
                  <div className="text-sm">{order.shipping_name}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">郵便番号</label>
                  <div className="text-sm">〒{order.shipping_postal_code}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">住所</label>
                  <div className="text-sm">
                    {order.shipping_prefecture}{order.shipping_city}{order.shipping_address1}
                  </div>
                </div>
                {order.shipping_phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">電話番号</label>
                    <div className="text-sm">{order.shipping_phone}</div>
                  </div>
                )}
                {order.delivery_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">配送希望日</label>
                    <div className="text-sm">{new Date(order.delivery_date).toLocaleDateString('ja-JP')}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 注文商品 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  注文商品 ({order.order_lines.length}点)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_lines.map((line, index) => (
                    <div key={line.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{line.product.name}</div>
                          <div className="text-sm text-gray-500">SKU: {line.product.sku}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">数量: {line.quantity}</div>
                        </div>
                      </div>
                      {line.product.description && (
                        <div className="text-sm text-gray-600 mb-2">{line.product.description}</div>
                      )}
                      {line.note && (
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          備考: {line.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 備考 */}
            {order.note && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    備考
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded">
                    {order.note}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右カラム - 操作・ステータス */}
          <div className="space-y-6">
            {/* ステータス更新 */}
            <Card>
              <CardHeader>
                <CardTitle>ステータス管理</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">現在のステータス</label>
                  <Select
                    value={order.status || ''}
                    onValueChange={updateOrderStatus}
                  >
                    <SelectTrigger>
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
                </div>
              </CardContent>
            </Card>

            {/* キャンセル情報 */}
            {order.status === 'cancelled' && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    キャンセル情報
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">キャンセル日時</label>
                    <div className="text-sm text-red-600">
                      {order.cancelled_at ? new Date(order.cancelled_at).toLocaleString('ja-JP') : '-'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">キャンセル者</label>
                    <div className="text-sm text-red-600">
                      {order.cancelled_user?.full_name || order.cancelled_user?.email || order.cancelled_by || 'システム'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* システム情報 */}
            <Card>
              <CardHeader>
                <CardTitle>システム情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">注文ID</label>
                  <div className="text-xs font-mono text-gray-600">{order.id}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">作成日時</label>
                  <div className="text-xs text-gray-600">{new Date(order.created_at || '').toLocaleString('ja-JP')}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Navbar>
  )
} 