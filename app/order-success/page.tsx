'use client'

// 動的レンダリングを強制（useSearchParamsのため）
export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle, Package, ArrowRight, Home, ShoppingCart, Phone, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { Navbar } from '@/components/layout/navbar'

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState<string | null>(null)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId')
    setOrderId(orderIdParam)
    
    // 注文情報を取得してメール送信
    if (orderIdParam && !emailSent) {
      const fetchOrderAndSendEmail = async () => {
        try {
          const supabase = createClient()
          
          // 注文情報を詳細取得
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .select(`
              *,
              order_lines (
                *,
                products (
                  name,
                  sku
                )
              )
            `)
            .eq('id', orderIdParam)
            .single()
          
          if (orderError) {
            console.error('注文情報取得エラー:', orderError)
            return
          }

          if (order) {
            setOrderNumber(order.order_number)

            // ユーザー情報を取得
            const { data: { user } } = await supabase.auth.getUser()
            
            if (user?.email) {
              // メール送信用のデータを準備
              const emailData = {
                order_id: order.id,
                order_number: order.order_number,
                customer_name: order.shipping_name || undefined,
                shipping_name: order.shipping_name || undefined,
                shipping_postal_code: order.shipping_postal_code,
                shipping_prefecture: order.shipping_prefecture,
                shipping_city: order.shipping_city,
                shipping_address: order.shipping_address,
                created_at: order.created_at || undefined,
                requested_at: order.requested_at || undefined,
                delivery_date: order.delivery_date || undefined,
                note: order.note || undefined,
                order_lines: order.order_lines?.map((line: any) => ({
                  product: line.products,
                  product_name: line.products?.name,
                  quantity: line.quantity,
                  note: line.note || undefined
                })) || []
              }

              // 注文確認メールを送信
              try {
                await sendOrderConfirmationEmail(emailData, user.email)
                setEmailSent(true)
                console.log('注文確認メールを送信しました')
              } catch (emailError) {
                console.error('メール送信エラー:', emailError)
                setEmailError('メール送信に失敗しました')
              }
            }
          }
        } catch (error) {
          console.error('注文情報取得エラー:', error)
        }
      }
      
      fetchOrderAndSendEmail()
    }
  }, [searchParams, emailSent])

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        注文完了情報を取得中...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-slate-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">注文完了</h1>
              <p className="text-slate-600 mt-2">ご注文ありがとうございました</p>
            </div>
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              トップページ
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* 成功メッセージ */}
          <Card className="bg-white border-0 shadow-lg mb-8">
            <CardContent className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-6 animate-pulse">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                ご注文を承りました
              </h2>
              
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                この度はご注文いただき、誠にありがとうございます。<br />
                営業担当者より24時間以内にお見積もりと<br />
                詳細なご連絡をさせていただきます。
              </p>

              {/* メール送信状況 */}
              {emailSent && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-800 font-medium">注文確認メールを送信しました</p>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    ご登録のメールアドレスに注文確認メールをお送りしました。
                  </p>
                </div>
              )}

              {emailError && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-yellow-600" />
                    <p className="text-yellow-800 font-medium">メール送信について</p>
                  </div>
                  <p className="text-yellow-700 text-sm mt-1">
                    注文確認メールの送信に問題が発生しました。注文は正常に受け付けております。
                  </p>
                </div>
              )}

              {orderNumber && (
                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-slate-600 mb-1">注文番号</p>
                  <p className="text-xl font-mono font-bold text-slate-900">
                    {orderNumber}
                  </p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <Link href="/products">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-3 rounded-lg transition-all duration-300">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    続けて買い物する
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button variant="outline" className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold py-3 rounded-lg transition-all duration-300">
                    <Package className="w-5 h-5 mr-2" />
                    注文履歴を見る
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* 次のステップ */}
          <Card className="bg-white border-0 shadow-sm mb-8">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="text-xl text-slate-900">今後の流れ</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">お見積もり作成</h3>
                    <p className="text-slate-600 text-sm">
                      営業担当者がご注文内容を確認し、詳細なお見積もりを作成いたします。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">ご連絡・調整</h3>
                    <p className="text-slate-600 text-sm">
                      お見積もり内容のご説明と、配送日程等の詳細調整をさせていただきます。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">製品準備・配送</h3>
                    <p className="text-slate-600 text-sm">
                      ご承認後、製品の準備を行い、指定の配送先へお届けいたします。
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* お問い合わせ情報 */}
          <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200">
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-900 mb-4 text-center">
                ご不明な点がございましたら
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-center gap-3 p-4 bg-white rounded-lg">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-slate-900">お電話</p>
                    <p className="text-sm text-slate-600">03-0000-0000</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-3 p-4 bg-white rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-slate-900">メール</p>
                    <p className="text-sm text-slate-600">info@industrial-pro.jp</p>
                  </div>
                </div>
              </div>
              
              <p className="text-center text-sm text-slate-600 mt-4">
                営業時間: 平日 9:00-18:00
              </p>
            </CardContent>
          </Card>

          {/* ホームに戻るボタン */}
          <div className="text-center mt-8">
            <Link href="/">
              <Button className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105">
                <Home className="w-5 h-5 mr-2" />
                トップページに戻る
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  )
} 