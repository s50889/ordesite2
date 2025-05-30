'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Package, Plus, Trash2, Edit, FolderPlus, ShoppingCart, Users, Eye, ChevronRight, Settings, Megaphone } from 'lucide-react'
import { Category, Product } from '@/types'
import Link from 'next/link'

// Dynamic rendering を強制してSSG時のエラーを回避
export const dynamic = 'force-dynamic'

interface Order {
  id: string
  order_number: string
  customer_id: string
  status: string
  created_at: string
  shipping_name: string
  shipping_email: string
  shipping_phone: string | null
  shipping_postal_code: string
  shipping_prefecture: string
  shipping_city: string
  shipping_address: string
  customer: {
    full_name: string | null
    email: string
    company_name: string | null
  }
  order_lines: Array<{
    id: string
    quantity: number
    product: {
      id: string
      sku: string
      name: string
      image_url: string | null
    }
  }>
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()
    
    // ユーザー認証と権限チェック
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setAccessDenied(true)
      setLoading(false)
      return
    }

    // 管理者権限をチェック
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'admin') {
      setAccessDenied(true)
      setLoading(false)
      return
    }
    
    setIsAdmin(true)
    
    // カテゴリを取得
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true })

    console.log('カテゴリデータ:', categoriesData)
    console.log('カテゴリエラー:', categoriesError)
    console.log('カテゴリデータの型:', typeof categoriesData)
    console.log('カテゴリデータの配列か:', Array.isArray(categoriesData))

    if (categoriesData) {
      setCategories(categoriesData)
    } else if (categoriesError) {
      console.error('カテゴリ取得エラー:', categoriesError)
      toast.error('カテゴリの取得に失敗しました')
    }

    // 製品をカテゴリ情報と一緒に取得
    const { data: productsData } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .order('sku', { ascending: true })

    if (productsData) {
      setProducts(productsData)
    }

    // 注文データを取得
    const { data: ordersData } = await supabase
      .from('orders')
      .select(`
        *,
        customer:user_profiles!customer_id(
          full_name,
          email,
          company_name
        ),
        order_lines(
          id,
          quantity,
          product:products(
            id,
            sku,
            name,
            image_url
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (ordersData) {
      setOrders(ordersData)
    }
    
    setLoading(false)
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

  if (accessDenied) {
    return (
      <Navbar>
        <div className="p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">アクセス拒否</h1>
            <p className="text-gray-600">このページにアクセスする権限がありません。</p>
          </div>
        </div>
      </Navbar>
    )
  }

  return (
    <Navbar>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">管理者ダッシュボード</h1>
          <p className="text-gray-600">システムの各種管理機能にアクセスできます</p>
        </div>

        {/* 統計情報 */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">総製品数</p>
                  <p className="text-3xl font-bold">{products.length}</p>
                </div>
                <Package className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">総注文数</p>
                  <p className="text-3xl font-bold">{orders.length}</p>
                </div>
                <ShoppingCart className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">カテゴリ数</p>
                  <p className="text-3xl font-bold">{categories.length}</p>
                </div>
                <FolderPlus className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 管理メニュー */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* 製品管理 */}
          <Link href="/admin/products">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">製品管理</h3>
                    <p className="text-sm text-gray-500">{products.length}件の製品</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">製品の追加、編集、削除を行います</p>
                <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                  管理画面へ
                  <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* カテゴリ管理 */}
          <Link href="/admin/categories">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <FolderPlus className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">カテゴリ管理</h3>
                    <p className="text-sm text-gray-500">{categories.length}件のカテゴリ</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">製品カテゴリの追加、編集、削除を行います</p>
                <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
                  管理画面へ
                  <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* 注文管理 */}
          <Link href="/admin/orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <ShoppingCart className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">注文管理</h3>
                    <p className="text-sm text-gray-500">{orders.length}件の注文</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">注文の確認、ステータス更新を行います</p>
                <div className="mt-4 flex items-center text-purple-600 text-sm font-medium">
                  管理画面へ
                  <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* ユーザー管理 */}
          <Link href="/admin/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">ユーザー管理</h3>
                    <p className="text-sm text-gray-500">ユーザー情報</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">ユーザーアカウントの管理を行います</p>
                <div className="mt-4 flex items-center text-orange-600 text-sm font-medium">
                  管理画面へ
                  <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* システム設定 */}
          <Link href="/admin/settings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                    <Settings className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">システム設定</h3>
                    <p className="text-sm text-gray-500">システム設定</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">システム全体の設定を管理します</p>
                <div className="mt-4 flex items-center text-gray-600 text-sm font-medium">
                  管理画面へ
                  <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* お知らせ管理 */}
          <Link href="/admin/announcements">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                    <Megaphone className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">お知らせ管理</h3>
                    <p className="text-sm text-gray-500">お知らせ投稿</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">お知らせの作成、編集、削除を行います</p>
                <div className="mt-4 flex items-center text-yellow-600 text-sm font-medium">
                  管理画面へ
                  <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* レポート */}
          <Link href="/admin/reports">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                    <Eye className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">レポート</h3>
                    <p className="text-sm text-gray-500">分析・レポート</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">売上や注文の分析レポートを確認します</p>
                <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium">
                  管理画面へ
                  <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </Navbar>
  )
} 