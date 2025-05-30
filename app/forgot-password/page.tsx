'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, ArrowLeft, Shield, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // TODO: 実際のパスワードリセット処理を実装
    await new Promise(resolve => setTimeout(resolve, 1500)) // 擬似的なロード時間
    
    setIsSubmitted(true)
    setIsLoading(false)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* ヘッダー */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent hover:scale-105 transition-transform duration-200">
                ⚙️ 工業資材プロ
              </Link>
              <Link href="/login" className="flex items-center text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200">
                <ArrowLeft className="w-4 h-4 mr-2" />
                ログインページに戻る
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader className="text-center space-y-4 pb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl mx-auto shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-900">送信完了</CardTitle>
                  <p className="text-slate-600 mt-2">パスワードリセットメールを送信しました</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <p className="text-slate-600">
                    <span className="font-medium text-slate-900">{email}</span> 宛に
                    <br />
                    パスワードリセット用のメールを送信しました。
                  </p>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      次の手順
                    </h3>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>メールボックスをご確認ください</li>
                      <li>メール内のリンクをクリック</li>
                      <li>新しいパスワードを設定</li>
                    </ol>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1">
                    <p>メールが届かない場合は、迷惑メールフォルダもご確認ください。</p>
                    <p>15分経ってもメールが届かない場合は、お問い合わせください。</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setIsSubmitted(false)
                      setEmail('')
                    }}
                    variant="outline"
                    className="w-full border-slate-300 hover:border-blue-600 text-slate-700 hover:text-blue-600 font-semibold py-3 rounded-lg transition-all duration-300"
                  >
                    別のメールアドレスで再送信
                  </Button>
                  
                  <Link href="/login">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-105">
                      ログインページに戻る
                    </Button>
                  </Link>
                </div>

                <div className="text-center pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500 mb-2">お困りの場合はお気軽にお問い合わせください</p>
                  <div className="flex justify-center space-x-4 text-xs text-slate-600">
                    <Link href="/contact" className="hover:text-blue-600 transition-colors">
                      お問い合わせ
                    </Link>
                    <span>•</span>
                    <span>電話: 03-0000-0000</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent hover:scale-105 transition-transform duration-200">
              ⚙️ 工業資材プロ
            </Link>
            <Link href="/login" className="flex items-center text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ログインページに戻る
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl mx-auto shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-slate-900">パスワードリセット</CardTitle>
                <p className="text-slate-600 mt-2">アカウントのメールアドレスを入力してください</p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-medium text-amber-900 mb-2 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  セキュリティについて
                </h3>
                <p className="text-sm text-amber-800">
                  ご登録のメールアドレスにパスワードリセット用のリンクを送信します。
                  リンクは24時間有効です。
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    メールアドレス
                  </Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 py-3 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="your.email@company.com"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      送信中...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Mail className="w-5 h-5 mr-2" />
                      リセットメールを送信
                    </div>
                  )}
                </Button>
              </form>

              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">または</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="w-full border-2 border-slate-300 hover:border-blue-600 text-slate-700 hover:text-blue-600 font-semibold py-3 rounded-lg transition-all duration-300"
                    >
                      ログインページに戻る
                    </Button>
                  </Link>
                  
                  <Link href="/signup">
                    <Button
                      variant="ghost"
                      className="w-full text-slate-600 hover:text-blue-600 font-medium py-3 rounded-lg transition-all duration-300"
                    >
                      新規アカウント作成
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500 mb-2">お困りの場合はお気軽にお問い合わせください</p>
                <div className="flex justify-center space-x-4 text-xs text-slate-600">
                  <Link href="/contact" className="hover:text-blue-600 transition-colors">
                    お問い合わせ
                  </Link>
                  <span>•</span>
                  <span>電話: 03-0000-0000</span>
                  <span>•</span>
                  <span>受付: 平日 8:00-18:00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 