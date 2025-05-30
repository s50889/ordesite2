'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Package, Filter, Grid, List, ShoppingCart, Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'
import { Product, Category } from '@/types'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const { addToCart } = useCart()
  const searchParams = useSearchParams()

  useEffect(() => {
    // URLパラメータから初期値を設定
    const categoryParam = searchParams.get('category')
    const searchParam = searchParams.get('search')
    
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
    if (searchParam) {
      setSearchQuery(searchParam)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      console.log('=== 製品カタログページ: データ取得開始 ===')
      
      // 現在のユーザー認証状態を確認
      const { data: user, error: userError } = await supabase.auth.getUser()
      console.log('現在のユーザー:', user)
      console.log('ユーザーエラー:', userError)
      
      // RLSポリシーのテスト - 認証なしでのデータ取得を試行
      console.log('=== RLSポリシーテスト ===')
      const { data: testProducts, error: testError } = await supabase
        .from('products')
        .select('id, sku, name, is_active, category_id')
        .limit(5)
      console.log('テスト製品取得:', { testProducts, testError })
      
      // カテゴリを取得（デバッグページと同じ方法）
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true })

      console.log('カテゴリ取得結果:', { categoriesData, categoriesError })

      if (categoriesError) {
        console.error('カテゴリ取得エラー:', categoriesError)
        console.error('エラー詳細:', {
          message: categoriesError.message,
          details: categoriesError.details,
          hint: categoriesError.hint,
          code: categoriesError.code
        })
      }

      if (categoriesData) {
        // アクティブなカテゴリのみをフィルタリング
        const activeCategories = categoriesData.filter(cat => cat.is_active === true)
        console.log('全カテゴリ数:', categoriesData.length, 'アクティブカテゴリ数:', activeCategories.length)
        setCategories(activeCategories)
      } else {
        console.log('カテゴリデータが取得できませんでした')
        setCategories([])
      }

      // 製品を取得（デバッグページと同じ方法）
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('name')

      console.log('製品取得結果:', { productsData, productsError })
      console.log('取得された製品数:', productsData?.length || 0)

      if (productsError) {
        console.error('製品取得エラー:', productsError)
        console.error('エラー詳細:', {
          message: productsError.message,
          details: productsError.details,
          hint: productsError.hint,
          code: productsError.code
        })
      }

      if (productsData) {
        // アクティブな製品のみをフィルタリング
        const activeProducts = productsData.filter(product => product.is_active === true)
        console.log('全製品数:', productsData.length, 'アクティブ製品数:', activeProducts.length)
        console.log('製品詳細:')
        activeProducts.forEach((product, index) => {
          console.log(`  ${index}: SKU=${product.sku}, Name=${product.name}, CategoryID=${product.category_id}, IsActive=${product.is_active}`)
        })
        setProducts(activeProducts)
      } else {
        console.log('製品データが取得できませんでした')
        setProducts([])
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // デバッグ情報をコンソールに出力
  console.log('=== 製品フィルタリング結果 ===')
  console.log('全製品数:', products.length)
  console.log('フィルタリング後製品数:', filteredProducts.length)
  console.log('検索クエリ:', searchQuery)
  console.log('選択されたカテゴリ:', selectedCategory)
  console.log('利用可能なカテゴリ:', categories.map(c => ({ id: c.id, name: c.name })))

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

  if (loading) {
    return (
      <Navbar>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 animate-spin">
              <Package className="w-8 h-8 text-white" />
            </div>
            <p className="text-slate-600 font-medium">製品を読み込み中...</p>
          </div>
        </div>
      </Navbar>
    )
  }

  return (
    <Navbar>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">製品カタログ</h1>
          <p className="text-gray-600">工業資材を豊富にラインナップ</p>
        </div>

        {/* フィルター・検索エリア */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 検索 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="製品名・型番で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-3 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* カテゴリフィルター */}
            <div className="lg:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">すべてのカテゴリ</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 表示切り替え */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-3 py-2"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3 py-2"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 検索結果表示 */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredProducts.length} 件の製品が見つかりました
            {searchQuery && (
              <span className="ml-2">
                「<span className="font-semibold text-gray-900">{searchQuery}</span>」の検索結果
              </span>
            )}
          </p>
        </div>

        {/* 製品一覧 */}
        {filteredProducts.length === 0 ? (
          <Card className="bg-white shadow-sm">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">製品が見つかりません</h3>
              <p className="text-gray-600 mb-6">
                検索条件を変更するか、カテゴリを「すべて」に設定してお試しください。
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                検索条件をリセット
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ProductGrid 
            products={filteredProducts} 
            viewMode={viewMode} 
            onAddToCart={handleAddToCart} 
          />
        )}
      </div>
    </Navbar>
  )
}

// 製品グリッドコンポーネント
function ProductGrid({ 
  products, 
  viewMode, 
  onAddToCart 
}: { 
  products: Product[]
  viewMode: 'grid' | 'list'
  onAddToCart: (productId: string) => void 
}) {
  if (viewMode === 'grid') {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} onAddToCart={onAddToCart} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {products.map((product, index) => (
        <ProductListItem key={product.id} product={product} index={index} onAddToCart={onAddToCart} />
      ))}
    </div>
  )
}

// 製品カードコンポーネント（グリッド表示用）
function ProductCard({ 
  product, 
  index, 
  onAddToCart 
}: { 
  product: Product
  index: number
  onAddToCart: (productId: string) => void 
}) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white border-0 overflow-hidden" style={{animationDelay: `${index * 50}ms`}}>
      <div className="relative">
        {product.image_url ? (
          <div className="relative aspect-square w-full overflow-hidden bg-white">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        ) : (
          <div className="relative aspect-square w-full bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center">
            <Package className="w-12 h-12 text-slate-400" />
          </div>
        )}
        {product.category && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            {product.category.name}
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
          {product.name}
        </h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-slate-500">
            <span className="font-medium">製品番号:</span>
            <span className="ml-2 bg-slate-100 px-2 py-1 rounded font-mono text-xs">{product.sku}</span>
          </div>
          
          {product.description && (
            <div className="text-sm text-slate-600 leading-relaxed line-clamp-2">
              {product.description}
            </div>
          )}
          
          {product.specs && (
            <div className="text-sm">
              <div className="text-slate-600 leading-relaxed line-clamp-2">
                {product.specs}
              </div>
            </div>
          )}
          
          <div className="flex items-center text-sm text-slate-600">
            <Package className="w-4 h-4 mr-1" />
            最小発注数: {product.moq}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => onAddToCart(product.id)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-2 rounded-lg transition-all duration-300 hover:scale-105"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            カート
          </Button>
          <Link href={`/products/${product.id}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 rounded-lg transition-all duration-300"
            >
              <Eye className="w-4 h-4 mr-1" />
              詳細
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

// 製品リストアイテムコンポーネント（リスト表示用）
function ProductListItem({ 
  product, 
  index, 
  onAddToCart 
}: { 
  product: Product
  index: number
  onAddToCart: (productId: string) => void 
}) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 bg-white border-0" style={{animationDelay: `${index * 30}ms`}}>
      <CardContent className="p-6">
        <div className="flex gap-6">
          {product.image_url ? (
            <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg bg-white">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-slate-100 to-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-slate-900">
                {product.name}
              </h3>
              {product.category && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {product.category.name}
                </span>
              )}
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-slate-500">
                <span className="font-medium">製品番号:</span>
                <span className="ml-2 bg-slate-100 px-2 py-1 rounded font-mono">{product.sku}</span>
              </div>
              
              {product.description && (
                <div className="text-sm text-slate-600 leading-relaxed">
                  {product.description}
                </div>
              )}
              
              {product.specs && (
                <div className="text-sm">
                  <div className="text-slate-600 leading-relaxed">
                    {product.specs}
                  </div>
                </div>
              )}
              
              <div className="flex items-center text-sm text-slate-600">
                <Package className="w-4 h-4 mr-2" />
                最小発注数: {product.moq}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 justify-center">
            <Button
              onClick={() => onAddToCart(product.id)}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              カートに追加
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 