"use client"

import { useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContactFormData {
  name: string
  email: string
  company: string
  phone: string
  subject: string
  message: string
  category: string
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general'
  })
  
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const categories = [
    { value: 'general', label: '一般的なお問い合わせ' },
    { value: 'product', label: '製品について' },
    { value: 'order', label: '注文について' },
    { value: 'support', label: 'サポート・技術的問題' },
    { value: 'partnership', label: 'パートナーシップ' },
    { value: 'other', label: 'その他' }
  ]

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // ここで実際の送信処理を行う（Supabaseやメール送信など）
    // 今回はシミュレーション
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setNotification({
        type: 'success',
        message: 'お問い合わせを送信いたしました。24時間以内にご連絡いたします。'
      })
      
      // フォームリセット
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        subject: '',
        message: '',
        category: 'general'
      })
    } catch (error) {
      setNotification({
        type: 'error',
        message: '送信に失敗しました。時間をおいて再度お試しください。'
      })
    } finally {
      setLoading(false)
    }
  }

  // 通知を自動で消去
  useState(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  })

  return (
    <Navbar>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
        {/* 通知 */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-16 md:top-20 left-1/2 transform -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md"
            >
              <div className={cn(
                'px-4 md:px-6 py-3 md:py-4 rounded-lg shadow-lg border flex items-center gap-3',
                notification.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              )}>
                {notification.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
                <span className="font-medium text-sm md:text-base flex-1">{notification.message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="container mx-auto px-4 max-w-6xl">
          {/* ヘッダー */}
          <motion.div 
            className="text-center mb-8 md:mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-3 md:mb-4">お問い合わせ</h1>
            <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto px-4">
              ご質問やご相談がございましたら、お気軽にお問い合わせください。
              専門スタッフが迅速に対応いたします。
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* お問い合わせフォーム */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg p-6 md:p-8">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                    <CardTitle className="text-xl md:text-2xl">お問い合わせフォーム</CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 md:p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <Label htmlFor="name" className="text-slate-700 font-medium">
                          氏名 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="mt-2"
                          placeholder="山田 太郎"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email" className="text-slate-700 font-medium">
                          メールアドレス <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="mt-2"
                          placeholder="example@company.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <Label htmlFor="company" className="text-slate-700 font-medium">会社名</Label>
                        <Input
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          className="mt-2"
                          placeholder="株式会社サンプル"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone" className="text-slate-700 font-medium">電話番号</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="mt-2"
                          placeholder="03-1234-5678"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="category" className="text-slate-700 font-medium">
                        お問い合わせ分類 <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        {categories.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="subject" className="text-slate-700 font-medium">
                        件名 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="mt-2"
                        placeholder="お問い合わせの件名"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="message" className="text-slate-700 font-medium">
                        メッセージ <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        className="mt-2 min-h-32"
                        placeholder="お問い合わせ内容を詳しくご記入ください..."
                        required
                      />
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white w-full py-3"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            送信中...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            送信する
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* 連絡先情報 */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-slate-900 mb-6">連絡先情報</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="font-medium text-slate-900">メール</p>
                        <p className="text-slate-600">contact@tatsumi.co.jp</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="font-medium text-slate-900">電話</p>
                        <p className="text-slate-600">03-1234-5678</p>
                        <p className="text-xs text-slate-500">平日 9:00 - 18:00</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="font-medium text-slate-900">住所</p>
                        <p className="text-slate-600">
                          〒100-0001<br />
                          東京都千代田区千代田1-1<br />
                          辰巳産業ビル
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-slate-900 mb-4">営業時間</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-medium text-slate-900">平日</p>
                        <p className="text-slate-600">9:00 - 18:00</p>
                      </div>
                    </div>
                    <div className="text-sm text-slate-500">
                      土日祝日は休業となります。<br />
                      お急ぎの場合はメールでお問い合わせください。
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-3">迅速対応</h3>
                  <p className="text-blue-100 text-sm">
                    通常24時間以内にご返信いたします。
                    お急ぎの案件についてはお電話でのお問い合わせをお勧めします。
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </Navbar>
  )
} 