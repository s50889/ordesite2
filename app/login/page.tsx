'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Lock, Mail, Building, ArrowLeft, Shield, Users, Phone } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Supabaseクライアントを作成
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      // Supabaseでログイン処理
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })
      
      if (error) {
        throw error
      }
      
      // セッションを確認
      const session = await supabase.auth.getSession()
      if (!session.data.session) {
        throw new Error('セッションの作成に失敗しました')
      }
      
      // 成功メッセージ
      alert('ログインに成功しました')
      
      // すべてのユーザーをホームページにリダイレクト
      // ナビゲーションバーで管理者権限に応じてメニューが表示される
      router.push('/')
    } catch (error) {
      console.error('ログインエラー:', error)
      alert(`ログインに失敗しました: ${error instanceof Error ? error.message : 'メールアドレスまたはパスワードが正しくありません'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
            <Link href="/" className="flex items-center text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200">
              <ArrowLeft className="w-4 h-4 mr-2" />
              トップページに戻る
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            {/* 左側：サービス紹介 */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-4">
                  工業資材のプロフェッショナル
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    パートナーポータル
                  </span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  お客様専用のアカウントにログインして、
                  <br />
                  特別価格での発注や専門サポートをご利用ください。
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl mb-4 shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">専用価格</h3>
                  <p className="text-slate-600 text-sm">お客様専用の特別価格でご提供</p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl mb-4 shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">専任サポート</h3>
                  <p className="text-slate-600 text-sm">専任担当者による技術支援</p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-700 rounded-xl mb-4 shadow-lg">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">優先対応</h3>
                  <p className="text-slate-600 text-sm">緊急時の優先対応サービス</p>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-blue-600" />
                  企業向けアカウントのメリット
                </h3>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    注文履歴の管理・再注文機能
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    月次利用レポートの自動生成
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    請求書の電子化・一括管理
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    技術資料のダウンロード
                  </li>
                </ul>
              </div>
            </div>

            {/* 右側：ログインフォーム */}
            <div className="flex justify-center">
              <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                <CardHeader className="text-center space-y-4 pb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl mx-auto shadow-lg">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-slate-900">ログイン</CardTitle>
                    <p className="text-slate-600 mt-2">アカウントにアクセス</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
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
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="pl-10 py-3 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="your.email@company.com"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-slate-700 font-medium">
                        パスワード
                      </Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className="pl-10 pr-10 py-3 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="パスワードを入力"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-slate-600">ログイン状態を保持</span>
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        パスワードを忘れた場合
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          ログイン中...
                        </div>
                      ) : (
                        'ログイン'
                      )}
                    </Button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-slate-500">または</span>
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <p className="text-slate-600">
                      アカウントをお持ちでない場合
                    </p>
                    <Link href="/signup">
                      <Button
                        variant="outline"
                        className="w-full border-2 border-slate-300 hover:border-blue-600 text-slate-700 hover:text-blue-600 font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-105"
                      >
                        新規アカウント作成
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
      </div>
    </div>
  )
} 