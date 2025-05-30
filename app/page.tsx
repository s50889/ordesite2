'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Search, ShoppingCart, Package, ChevronRight, ArrowRight, Star, Sparkles, Zap, Shield, Wrench, Settings, Gauge, Trophy, Users, Phone, Mail, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import { useCart } from '@/hooks/use-cart'
import { CartBadge } from '@/components/ui/cart-badge'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { Footer } from '../src/components/layout/footer'

// Dynamic rendering を強制してSSG時のエラーを回避
export const dynamic = 'force-dynamic'

interface Product {
  id: string
  sku: string | null
  name: string
  specs: string | null
  image_url: string | null
  moq: number | null
  category?: string | null
  category_id?: string | null
  description?: string | null
  is_active?: boolean | null
  price?: number | null
  created_at?: string | null
  updated_at?: string | null
}

interface Category {
  id: string
  name: string
  description?: string
  image_url?: string | null
  is_active?: boolean | null
  display_order?: number | null
  created_at?: string | null
  updated_at?: string | null
}

interface Announcement {
  id: string
  title: string
  content: string
  type: string | null
  is_active: boolean | null
  priority: number | null
  created_at: string | null
  created_by?: string | null
  updated_at?: string | null
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const { addToCart } = useCart()
  const { user, loading: authLoading, signOut } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      // カテゴリーデータを実際のデータベースから取得
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      // 商品データの取得
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (categoriesData) {
        // データベースのカテゴリに説明を追加
        const categoriesWithDescription = categoriesData.map(category => ({
          ...category,
          description: getCategoryDescription(category.name),
          image_url: '/api/placeholder/400/300'
        }))
        setCategories(categoriesWithDescription)
      }

      if (productsData) {
        setProducts(productsData)
      }

      // お知らせデータの取得
      const { data: announcementsData } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })

      if (announcementsData) {
        setAnnouncements(announcementsData)
      } else {
        // データベースエラーの場合はサンプルデータを使用
        const sampleAnnouncements: Announcement[] = [
          {
            id: '1',
            title: '年末年始休業のお知らせ',
            content: '誠に勝手ながら、12月29日（金）から1月3日（水）まで年末年始休業とさせていただきます。',
            type: 'important',
            is_active: true,
            priority: 1,
            created_at: '2024-01-15T00:00:00Z'
          },
          {
            id: '2',
            title: '新製品ラインナップ追加のお知らせ',
            content: '高精度測定機器の新シリーズを追加いたしました。詳細は製品カタログをご確認ください。',
            type: 'product',
            is_active: true,
            priority: 0,
            created_at: '2024-01-10T00:00:00Z'
          },
          {
            id: '3',
            title: 'システムメンテナンスのお知らせ',
            content: '1月20日（土）2:00-6:00にシステムメンテナンスを実施いたします。',
            type: 'maintenance',
            is_active: true,
            priority: 0,
            created_at: '2024-01-05T00:00:00Z'
          }
        ]
        setAnnouncements(sampleAnnouncements)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  // カテゴリ名に基づいて説明を取得する関数
  const getCategoryDescription = (categoryName: string) => {
    const descriptions: { [key: string]: string } = {
      '工業用ガス': '窒素、酸素、アルゴン、炭酸ガスなど高純度工業用ガスを各種取り揃えております',
      '機械部品': '切削工具、測定機器、加工機械など精密機械部品を豊富にラインナップ',
      '工具': '各種工具類、作業効率を向上させる高品質な工具を提供',
      '材料': '原材料・部品、製造に必要な各種素材を幅広く取り扱い',
      '電子部品': '電子機器関連の部品、最新技術に対応した電子部品',
      '一般製品': '一般的な製品カテゴリ、様々な用途に対応'
    }
    return descriptions[categoryName] || `${categoryName}関連の製品を取り扱っております`
  }

  const getTypeInfo = (type: string | null) => {
    const typeKey = type || 'info'
    const types: { [key: string]: { label: string; color: string; borderColor: string } } = {
      'important': { label: '重要', color: 'bg-red-100 text-red-800', borderColor: 'border-red-500' },
      'product': { label: '新製品', color: 'bg-green-100 text-green-800', borderColor: 'border-green-500' },
      'maintenance': { label: 'メンテナンス', color: 'bg-yellow-100 text-yellow-800', borderColor: 'border-yellow-500' },
      'info': { label: '一般', color: 'bg-blue-100 text-blue-800', borderColor: 'border-blue-500' }
    }
    return types[typeKey] || types['info']
  }

  const filteredProducts = products.filter(product =>
    (product.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.sku || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId)
      alert('カートに追加しました')
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      }
    }
  }

  if (loading || authLoading) {
    return (
      <Navbar>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 animate-spin">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <p className="text-slate-600 font-medium">システムを起動中...</p>
          </div>
        </div>
      </Navbar>
    )
  }

  return (
    <Navbar>
      <div className="min-h-screen flex flex-col bg-white">
        {/* 検索セクション */}
        <section className="bg-white py-4 md:py-6">
          <div className="container mx-auto px-4">
            <div className="max-w-none">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch md:items-center">
                {/* カテゴリ検索 */}
                <div className="flex gap-2 items-center">
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-black text-white flex-1 md:min-w-[200px]"
                  >
                    <option value="">カテゴリを選択してください</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <Link href={`/products${selectedCategory ? `?category=${encodeURIComponent(selectedCategory)}` : ''}`}>
                    <Button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                      <Search className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                {/* 商品検索 */}
                <div className="flex gap-2 items-center flex-1">
                  <div className="relative flex-1 max-w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="製品名・型番を入力..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>
                  <Link href={`/products${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`}>
                    <Button className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">
                      <Search className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ヒーローセクション */}
        <section className="relative min-h-[calc(100vh-80px)] md:min-h-screen flex items-center justify-center overflow-hidden bg-white">
          {/* 背景パターン */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #6366f1 0%, transparent 50%)'
            }}></div>
          </div>
          
          {/* 装飾的な要素 */}
          <div className="absolute top-10 md:top-20 left-5 md:left-10 w-48 md:w-72 h-48 md:h-72 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 md:bottom-20 right-5 md:right-10 w-64 md:w-96 h-64 md:h-96 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          <div className="relative container mx-auto px-4 py-8 md:py-16">
            <div className="grid gap-8 md:gap-12 lg:grid-cols-2 items-center min-h-[60vh] md:min-h-[80vh]">
              {/* テキストコンテンツ */}
              <div className="space-y-6 md:space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center justify-center lg:justify-start">
                  <div className="relative">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl">
                      <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-4 h-4 md:w-6 md:h-6 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                <div className="space-y-4 md:space-y-6">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl 2xl:text-[10rem] font-black leading-none tracking-tight">
                    <span className="block bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent mb-2 md:mb-4">
                      Tatsumi
                    </span>
                    <span className="block bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
                      Ordersite
                    </span>
                  </h1>
                  
                  <div className="flex items-center gap-2 md:gap-4 justify-center lg:justify-start">
                    <div className="h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent flex-1 max-w-12 md:max-w-24"></div>
                    <span className="text-slate-600 text-sm sm:text-base md:text-xl lg:text-2xl xl:text-3xl font-medium tracking-wider uppercase">Industrial Solutions</span>
                    <div className="h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent flex-1 max-w-12 md:max-w-24"></div>
                  </div>
                </div>
              </div>

              {/* 画像セクション */}
              <div className="relative lg:order-last">
                <div className="relative group">
                  {/* メイン画像 */}
                  <div className="relative overflow-hidden rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-900/60 via-transparent to-blue-900/30 z-10"></div>
                    <Image
                      src="/images/hero-welding.jpg"
                      alt="TATSUMI工業資材の溶接作業"
                      width={800}
                      height={600}
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                      priority
                    />
                    
                    {/* 火花エフェクト装飾 */}
                    <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20">
                      <div className="w-2 h-2 md:w-3 md:h-3 bg-orange-500 rounded-full animate-ping"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 md:w-3 md:h-3 bg-orange-600 rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  {/* 装飾的な要素 */}
                  <div className="hidden md:block absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-full animate-pulse"></div>
                  <div className="hidden md:block absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-indigo-600/20 rounded-full animate-pulse delay-700"></div>
                  
                  {/* グリッド装飾 */}
                  <div className="absolute inset-0 pointer-events-none hidden sm:block">
                    <div className="absolute top-4 left-4 md:top-8 md:left-8 w-6 h-6 md:w-8 md:h-8 border-2 border-orange-400/30 rounded"></div>
                    <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-4 h-4 md:w-6 md:h-6 border-2 border-blue-400/30 rounded-full"></div>
                    <div className="absolute top-1/2 left-2 md:left-4 w-3 h-3 md:w-4 md:h-4 bg-orange-400/20 rounded rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 下部のスクロール促進要素 */}
          <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-5 h-8 md:w-6 md:h-10 border-2 border-slate-400 rounded-full flex justify-center">
              <div className="w-1 h-2 md:h-3 bg-slate-500 rounded-full mt-1.5 md:mt-2 animate-pulse"></div>
            </div>
          </div>
        </section>

        {/* お知らせセクション */}
        <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">お知らせ</h2>
              <p className="text-lg text-slate-600">最新の情報をお届けします</p>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-4">
              {announcements.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-slate-500">現在、お知らせはありません。</p>
                </div>
              ) : (
                announcements.slice(0, 3).map((announcement) => {
                  const typeInfo = getTypeInfo(announcement.type)
                  return (
                    <div key={announcement.id} className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${typeInfo.borderColor}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded mr-3 ${typeInfo.color}`}>
                              {typeInfo.label}
                            </span>
                            <span className="text-sm text-slate-500">
                              {new Date(announcement.created_at || '').toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">{announcement.title}</h3>
                          <p className="text-slate-600">{announcement.content}</p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </Navbar>
  )
}
