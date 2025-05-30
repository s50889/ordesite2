'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart, 
  ArrowLeft, 
  Package, 
  Star, 
  Shield,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  FileText,
  Phone,
  Mail,
  ChevronRight
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'
import { Product } from '@/types'
import { motion } from 'framer-motion'

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchProduct = async () => {
      // id が配列の場合は最初の要素を使用
      const productId = Array.isArray(id) ? id[0] : id
      if (!productId) return

      const supabase = createClient()
      
      // 商品詳細を取得
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (productError) {
        console.error('商品取得エラー:', productError)
        router.push('/products')
        return
      }

      if (productData) {
        // カテゴリ情報を別途取得
        let categoryData = null
        if (productData.category_id) {
          const { data: catData } = await supabase
            .from('categories')
            .select('*')
            .eq('id', productData.category_id)
            .single()
          categoryData = catData
        }

        const productWithCategory = {
          ...productData,
          category: categoryData
        } as Product
        
        setProduct(productWithCategory)
        
        // 関連商品を取得（同じカテゴリの商品）
        if (productData.category_id) {
          const { data: relatedData } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', productData.category_id)
            .neq('id', productId)
            .eq('is_active', true)
            .limit(4)

          if (relatedData) {
            // 関連商品もcategoryプロパティなしで型変換
            const typedRelatedProducts = relatedData.map(item => ({
              ...item,
              category: undefined
            })) as Product[]
            setRelatedProducts(typedRelatedProducts)
          }
        }
      }

      setLoading(false)
    }

    fetchProduct()
  }, [id, router])

  const handleAddToCart = async () => {
    if (!product) return
    
    try {
      await addToCart(product.id)
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 animate-spin">
              <Package className="w-8 h-8 text-white" />
            </div>
            <p className="text-slate-600 font-medium">商品情報を読み込み中...</p>
          </div>
        </div>
      </Navbar>
    )
  }

  if (!product) {
    return (
      <Navbar>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="text-center p-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">商品が見つかりません</h2>
            <p className="text-slate-600 mb-6">指定された商品は存在しないか、削除された可能性があります。</p>
            <Link href="/products">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                商品一覧に戻る
              </Button>
            </Link>
          </Card>
        </div>
      </Navbar>
    )
  }

  // 複数の商品画像があると仮定（現在はimage_urlのみ）
  const productImages = product.image_url ? [product.image_url].filter(Boolean) : []

  return (
    <Navbar>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* パンくずリスト */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-slate-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">ホーム</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/products" className="hover:text-blue-600 transition-colors">製品カタログ</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">{product.name}</span>
          </nav>
        </div>

        {/* メインコンテンツ */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* 商品画像セクション */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              {/* メイン画像 */}
              <div className="relative aspect-square bg-white rounded-2xl shadow-lg overflow-hidden">
                {productImages.length > 0 && productImages[selectedImage] ? (
                  <Image
                    src={productImages[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-contain p-8"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-100 to-blue-100">
                    <Package className="w-24 h-24 text-slate-400" />
                  </div>
                )}
                
                {/* 商品バッジ */}
                {product.category && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-blue-600 text-white px-3 py-1">
                      {(product.category as any).name}
                    </Badge>
                  </div>
                )}
              </div>

              {/* サムネイル画像（複数画像対応） */}
              {productImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index ? 'border-blue-600' : 'border-slate-200'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-contain p-2"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* 商品情報セクション */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* 商品タイトル */}
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-3">{product.name}</h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="font-medium">製品番号:</span>
                    <span className="ml-2 bg-slate-100 px-3 py-1 rounded font-mono">{product.sku}</span>
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-sm text-slate-600">(4.8)</span>
                  </div>
                </div>
              </div>

              {/* 商品説明 */}
              {product.description && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-slate-900 mb-2 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-600" />
                      商品説明
                    </h3>
                    <p className="text-slate-600 leading-relaxed">{product.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* 仕様 */}
              {product.specs && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-slate-900 mb-2 flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-blue-600" />
                      製品仕様
                    </h3>
                    <div className="text-slate-600 whitespace-pre-line">{product.specs}</div>
                  </CardContent>
                </Card>
              )}

              {/* 購入情報 */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 font-medium">最小発注数量</span>
                      <span className="text-xl font-bold text-slate-900">{product.moq} 個</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="text-sm">在庫あり（即日発送可能）</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <Truck className="w-5 h-5 mr-2" />
                        <span className="text-sm">送料無料（¥10,000以上）</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <Shield className="w-5 h-5 mr-2" />
                        <span className="text-sm">品質保証付き</span>
                      </div>
                    </div>

                    <div className="pt-4 space-y-3">
                      <Button
                        onClick={handleAddToCart}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        カートに追加
                      </Button>
                      
                      <Link href="/contact" className="block">
                        <Button
                          variant="outline"
                          className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-4"
                        >
                          <Phone className="w-5 h-5 mr-2" />
                          お問い合わせ
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 特徴バッジ */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <Shield className="w-3 h-3 mr-1" />
                  品質保証
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  <Truck className="w-3 h-3 mr-1" />
                  即日発送
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  <Star className="w-3 h-3 mr-1" />
                  人気商品
                </Badge>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  <Clock className="w-3 h-3 mr-1" />
                  24時間サポート
                </Badge>
              </div>
            </motion.div>
          </div>

          {/* 関連商品 */}
          {relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">関連商品</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <Link key={relatedProduct.id} href={`/products/${relatedProduct.id}`}>
                    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                      <div className="relative aspect-square bg-white">
                        {relatedProduct.image_url ? (
                          <Image
                            src={relatedProduct.image_url}
                            alt={relatedProduct.name}
                            fill
                            className="object-contain p-4"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-100 to-blue-100">
                            <Package className="w-12 h-12 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">
                          {relatedProduct.name}
                        </h3>
                        <p className="text-sm text-slate-600">最小発注数: {relatedProduct.moq}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </Navbar>
  )
} 