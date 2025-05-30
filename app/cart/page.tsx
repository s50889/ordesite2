"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCart } from '@/hooks/use-cart'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, ShoppingCart, Package, Send, ArrowLeft } from 'lucide-react'

export default function CartPage() {
  const router = useRouter()
  const { items, loading, updateQuantity, removeItem, clearCart } = useCart()
  const [orderNote, setOrderNote] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) {
      alert('カート情報を読み込み中です。しばらくお待ちください。')
      return
    }
    if (items.length === 0) {
      alert('カートが空です')
      return
    }
    try {
      const noteData = encodeURIComponent(orderNote)
      const url = `/order-confirm?note=${noteData}`
      router.push(url)
    } catch (error) {
      alert('画面遷移でエラーが発生しました')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 animate-spin">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600 font-medium">カートを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-slate-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">見積・注文</h1>
              <p className="text-slate-600 mt-2">カートの内容をご確認ください</p>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
                トップページ
              </Link>
              <Link href="/products" className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" />
                製品カタログに戻る
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="text-xl text-slate-900 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                カート内容 ({items.length}点)
              </CardTitle>
            </CardHeader>
          </Card>

          {items.length === 0 ? (
            <Card className="bg-white border-0 shadow-sm mt-6">
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">カートに商品がありません</h3>
                <p className="text-slate-600 mb-6">まずは製品カタログから商品をお選びください。</p>
                <Link href="/products">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold px-8 py-3 rounded-lg">
                    製品カタログを見る
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 mt-6">
                {items.map((item, index) => (
                  <Card key={item.id} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-300" style={{animationDelay: `${index * 100}ms`}}>
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        {item.product.image_url ? (
                          <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                            <Image
                              src={item.product.image_url}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-slate-100 to-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="w-8 h-8 text-slate-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900 mb-1">{item.product.name}</h3>
                          <p className="text-sm text-slate-500 mb-3">
                            製品番号: <span className="bg-slate-100 px-2 py-1 rounded font-mono">{item.product.sku}</span>
                          </p>
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-slate-700 block mb-1">数量</label>
                            <Input
                              type="number"
                              min={item.product.moq}
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                              className="w-24"
                            />
                            <span className="text-sm text-slate-500">
                              (最小: {item.product.moq})
                            </span>
                          </div>
                          <div className="mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              削除
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="flex justify-between items-center pt-4">
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    カートを空にする
                  </Button>
                  <div className="text-sm text-slate-600">
                    合計 {items.length} 種類の製品
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || items.length === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {loading ? 'カート読み込み中...' : '注文手続きへ進む'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
} 