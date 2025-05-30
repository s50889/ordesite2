'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft, Eye, TrendingUp, Package, ShoppingCart, Users, Calendar } from 'lucide-react'
import Link from 'next/link'

interface ReportData {
  totalOrders: number
  totalProducts: number
  totalUsers: number
  recentOrders: any[]
  popularProducts: any[]
  ordersByStatus: Record<string, number>
  ordersByMonth: Record<string, number>
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30')

  useEffect(() => {
    fetchReportData()
  }, [selectedPeriod])

  const fetchReportData = async () => {
    const supabase = createClient()
    
    try {
      // 期間の計算
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - parseInt(selectedPeriod))

      // 注文データを取得
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          order_lines(
            quantity,
            product:products(name, sku)
          )
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      // 製品データを取得
      const { data: products } = await supabase
        .from('products')
        .select('*')

      // ユーザーデータを取得
      const { data: users } = await supabase
        .from('user_profiles')
        .select('*')
        .gte('created_at', startDate.toISOString())

      // レポートデータを集計
      const totalOrders = orders?.length || 0
      const totalProducts = products?.length || 0
      const totalUsers = users?.length || 0

      // 最近の注文（上位5件）
      const recentOrders = orders?.slice(0, 5) || []

      // ステータス別注文数
      const ordersByStatus = orders?.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // 月別注文数
      const ordersByMonth = orders?.reduce((acc, order) => {
        const month = new Date(order.created_at).toLocaleDateString('ja-JP', { 
          year: 'numeric', 
          month: 'short' 
        })
        acc[month] = (acc[month] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // 人気商品（注文数順）
      const productCounts = orders?.reduce((acc, order) => {
        order.order_lines?.forEach((line: any) => {
          const productName = line.product?.name || '不明な商品'
          acc[productName] = (acc[productName] || 0) + line.quantity
        })
        return acc
      }, {} as Record<string, number>) || {}

      const popularProducts = Object.entries(productCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }))

      setReportData({
        totalOrders,
        totalProducts,
        totalUsers,
        recentOrders,
        popularProducts,
        ordersByStatus,
        ordersByMonth
      })
    } catch (error) {
      console.error('レポートデータ取得エラー:', error)
      toast.error('レポートデータの取得に失敗しました')
    }
    
    setLoading(false)
  }

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': '注文確認中',
      'confirmed': '注文確定',
      'processing': '処理中',
      'shipped': '発送済み',
      'delivered': '配送完了',
      'cancelled': 'キャンセル'
    }
    return statusMap[status] || status
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

  return (
    <Navbar>
      <div className="p-8">
        <div className="flex items-center mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              ダッシュボードに戻る
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">レポート・分析</h1>
        </div>

        <div className="space-y-6">
          {/* 期間選択 */}
          <Card>
            <CardHeader>
              <CardTitle>レポート期間</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="期間を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">過去7日間</SelectItem>
                  <SelectItem value="30">過去30日間</SelectItem>
                  <SelectItem value="90">過去90日間</SelectItem>
                  <SelectItem value="365">過去1年間</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* 概要統計 */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">期間内注文数</p>
                    <p className="text-3xl font-bold">{reportData?.totalOrders || 0}</p>
                  </div>
                  <ShoppingCart className="h-12 w-12 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">総製品数</p>
                    <p className="text-3xl font-bold">{reportData?.totalProducts || 0}</p>
                  </div>
                  <Package className="h-12 w-12 text-green-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">期間内新規ユーザー</p>
                    <p className="text-3xl font-bold">{reportData?.totalUsers || 0}</p>
                  </div>
                  <Users className="h-12 w-12 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* 注文ステータス別統計 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  注文ステータス別統計
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(reportData?.ordersByStatus || {}).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-sm">{getStatusLabel(status)}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(count / (reportData?.totalOrders || 1)) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 人気商品 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  人気商品トップ5
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData?.popularProducts.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      データがありません
                    </div>
                  ) : (
                    reportData?.popularProducts.map((product, index) => (
                      <div key={product.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            #{index + 1}
                          </span>
                          <span className="text-sm">{product.name}</span>
                        </div>
                        <span className="text-sm font-medium">{product.count}個</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 最近の注文 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                最近の注文
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData?.recentOrders.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    注文がありません
                  </div>
                ) : (
                  reportData?.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">注文番号: {order.order_number}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleString('ja-JP')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">{getStatusLabel(order.status)}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.order_lines?.length || 0}商品
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* 月別注文推移 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                月別注文推移
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(reportData?.ordersByMonth || {}).length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    データがありません
                  </div>
                ) : (
                  Object.entries(reportData?.ordersByMonth || {})
                    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                    .map(([month, count]) => (
                      <div key={month} className="flex items-center justify-between">
                        <span className="text-sm">{month}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ 
                                width: `${(count / Math.max(...Object.values(reportData?.ordersByMonth || {}))) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Navbar>
  )
} 