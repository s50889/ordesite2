'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Lock, Mail, Building, ArrowLeft, User, Phone, MapPin, FileText } from 'lucide-react'
import Link from 'next/link'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    department: '',
    name: '',
    email: '',
    phone: '',
    postalCode: '',
    address: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert('パスワードが一致しません。')
      return
    }
    
    if (!agreed) {
      alert('利用規約に同意してください。')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Supabaseクライアントを作成
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      // Supabaseでユーザー登録
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            company_name: formData.companyName,
            department: formData.department,
            full_name: formData.name,
            phone: formData.phone,
            postal_code: formData.postalCode,
            address: formData.address
          }
        }
      })
      
      if (error) {
        throw error
      }
      
      // 成功メッセージ
      alert('アカウント登録が完了しました。承認後にご利用いただけます。')
      
      // 登録成功後、ログインページにリダイレクト
      window.location.href = '/login'
    } catch (error) {
      console.error('登録エラー:', error)
      alert(`登録に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`)
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
            <Link href="/login" className="flex items-center text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ログインページに戻る
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              企業アカウント
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> 新規登録</span>
            </h1>
            <p className="text-xl text-slate-600">
              工業資材のプロフェッショナルサービスをご利用いただくためのアカウントを作成します
            </p>
          </div>

          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl mx-auto shadow-lg">
                <Building className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-slate-900">企業情報の登録</CardTitle>
                <p className="text-slate-600 mt-2">正確な情報をご入力ください。承認後にサービスをご利用いただけます。</p>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* 企業情報 */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                    <Building className="w-5 h-5 mr-2 text-blue-600" />
                    企業情報
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="companyName" className="text-slate-700 font-medium">
                        会社名 *
                      </Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                        className="mt-1 py-3 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="株式会社○○○○"
                      />
                    </div>
                    <div>
                      <Label htmlFor="department" className="text-slate-700 font-medium">
                        部署名
                      </Label>
                      <Input
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="mt-1 py-3 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="購買部、製造部など"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 mt-6">
                    <div>
                      <Label htmlFor="postalCode" className="text-slate-700 font-medium">
                        郵便番号 *
                      </Label>
                      <div className="relative mt-1">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          id="postalCode"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleChange}
                          required
                          className="pl-10 py-3 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="000-0000"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address" className="text-slate-700 font-medium">
                        住所 *
                      </Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        className="mt-1 py-3 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="東京都○○区○○ 1-2-3"
                      />
                    </div>
                  </div>
                </div>

                {/* 担当者情報 */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    担当者情報
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="name" className="text-slate-700 font-medium">
                        ご担当者名 *
                      </Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="pl-10 py-3 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="山田 太郎"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-slate-700 font-medium">
                        電話番号 *
                      </Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="pl-10 py-3 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="03-0000-0000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label htmlFor="email" className="text-slate-700 font-medium">
                      メールアドレス *
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
                </div>

                {/* パスワード設定 */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                    <Lock className="w-5 h-5 mr-2 text-blue-600" />
                    パスワード設定
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="password" className="text-slate-700 font-medium">
                        パスワード *
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
                          placeholder="8文字以上のパスワード"
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
                    <div>
                      <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
                        パスワード確認 *
                      </Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          className="pl-10 pr-10 py-3 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="パスワードを再入力"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 利用規約 */}
                <div className="bg-slate-50 rounded-lg p-6">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="text-sm text-slate-600">
                      <span className="font-medium text-slate-900">利用規約とプライバシーポリシーに同意します *</span>
                      <p className="mt-2">
                        企業アカウントは承認制となっております。登録後、弊社にて審査を行い、
                        承認完了後にサービスをご利用いただけます。審査には1-2営業日お時間をいただく場合があります。
                      </p>
                    </div>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !agreed}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-4 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      登録処理中...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <FileText className="w-5 h-5 mr-2" />
                      アカウント登録を申請
                    </div>
                  )}
                </Button>
              </form>

              <div className="text-center pt-6 border-t border-slate-200">
                <p className="text-slate-600 mb-4">
                  既にアカウントをお持ちの場合
                </p>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="border-2 border-slate-300 hover:border-blue-600 text-slate-700 hover:text-blue-600 font-semibold px-8 py-3 rounded-lg transition-all duration-300"
                  >
                    ログインページへ
                  </Button>
                </Link>
              </div>

              <div className="text-center pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500 mb-2">ご不明な点がございましたらお気軽にお問い合わせください</p>
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