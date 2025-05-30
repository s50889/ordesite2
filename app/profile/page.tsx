"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit3, 
  Save, 
  X, 
  Clock, 
  Settings,
  LogOut,
  Package,
  Shield
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface UserProfile {
  id: string
  full_name: string | null
  email: string
  phone?: string | null
  company_name?: string | null
  address?: string | null
  created_at: string
}

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    company_name: '',
    address: ''
  })

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  // 通知を自動で消去
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
  }

  const fetchProfile = async () => {
    if (!user) return
    
    const supabase = createClient()
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      const profileData = {
        ...data,
        email: user.email || '',
        created_at: user.created_at
      }
      setProfile(profileData)
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        company_name: data.company_name || '',
        address: data.address || ''
      })
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setSaving(true)
    const supabase = createClient()
    
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        email: user.email || '',
        full_name: formData.full_name,
        phone: formData.phone,
        company_name: formData.company_name,
        address: formData.address
      })

    if (!error) {
      setEditMode(false)
      await fetchProfile()
      showNotification('success', 'プロフィールが正常に更新されました')
    } else {
      showNotification('error', 'プロフィールの更新に失敗しました')
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <Navbar>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 animate-spin">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <p className="text-slate-600 font-medium">プロフィールを読み込み中...</p>
          </motion.div>
        </div>
      </Navbar>
    )
  }

  if (!user || !profile) {
    return (
      <Navbar>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600 mb-4">プロフィールが見つかりません</p>
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                ログインする
              </Button>
            </Link>
          </div>
        </div>
      </Navbar>
    )
  }

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
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                ) : (
                  <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
                <span className="font-medium text-sm md:text-base flex-1">{notification.message}</span>
                <button 
                  onClick={() => setNotification(null)}
                  className="ml-auto hover:opacity-70 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="container mx-auto px-4 max-w-6xl">
          {/* ヘッダー */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">プロフィール</h1>
            <p className="text-slate-600 text-sm md:text-base">アカウント情報を管理します</p>
          </motion.div>

          <div className="grid gap-6 lg:gap-8 lg:grid-cols-4">
            {/* プロフィール情報カード */}
            <motion.div
              className="lg:col-span-3 order-2 lg:order-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 md:w-8 md:h-8 text-white" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg md:text-2xl text-white truncate">{profile.full_name || '未設定'}</CardTitle>
                        <p className="text-blue-100 text-sm md:text-base truncate">{profile.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditMode(!editMode)}
                      className="text-white hover:bg-white/20 flex-shrink-0"
                    >
                      {editMode ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 md:p-8">
                  {editMode ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* メールアドレス（読み取り専用） */}
                      <div>
                        <Label className="text-slate-700 font-medium">メールアドレス</Label>
                        <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-md">
                          <span className="text-slate-900">{profile.email}</span>
                          <p className="text-xs text-slate-500 mt-1">※ メールアドレスの変更はサポートまでお問い合わせください</p>
                        </div>
                      </div>
                      
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <Label htmlFor="full_name" className="text-slate-700 font-medium">
                            氏名 <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="mt-2"
                            placeholder="山田 太郎"
                            required
                          />
                          <p className="text-xs text-slate-500 mt-1">請求書や配送先に使用されます</p>
                        </div>
                        
                        <div>
                          <Label htmlFor="phone" className="text-slate-700 font-medium">電話番号</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="mt-2"
                            placeholder="090-1234-5678"
                          />
                          <p className="text-xs text-slate-500 mt-1">配送時の連絡に使用されます</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="company_name" className="text-slate-700 font-medium">会社名</Label>
                        <Input
                          id="company_name"
                          value={formData.company_name}
                          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                          className="mt-2"
                          placeholder="株式会社サンプル"
                        />
                        <p className="text-xs text-slate-500 mt-1">法人の場合はご入力ください</p>
                      </div>
                      
                      <div>
                        <Label htmlFor="address" className="text-slate-700 font-medium">住所</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="mt-2"
                          placeholder="〒100-0001 東京都千代田区千代田1-1"
                        />
                        <p className="text-xs text-slate-500 mt-1">デフォルトの請求先住所として使用されます</p>
                      </div>

                      <div className="flex gap-4 pt-6 border-t border-slate-200">
                        <Button 
                          type="submit" 
                          disabled={saving || !formData.full_name.trim()}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex-1"
                        >
                          {saving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                              保存中...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              変更を保存
                            </>
                          )}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setEditMode(false)
                            // フォームデータをリセット
                            setFormData({
                              full_name: profile.full_name || '',
                              phone: profile.phone || '',
                              company_name: profile.company_name || '',
                              address: profile.address || ''
                            })
                          }}
                          className="flex-1 border-slate-300 hover:bg-slate-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          キャンセル
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-slate-500" />
                          <div>
                            <p className="text-sm text-slate-500">メールアドレス</p>
                            <p className="font-medium text-slate-900">{profile.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-slate-500" />
                          <div>
                            <p className="text-sm text-slate-500">氏名</p>
                            <p className="font-medium text-slate-900">{profile.full_name || '未設定'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-slate-500" />
                          <div>
                            <p className="text-sm text-slate-500">電話番号</p>
                            <p className="font-medium text-slate-900">{profile.phone || '未設定'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-slate-500" />
                          <div>
                            <p className="text-sm text-slate-500">会社名</p>
                            <p className="font-medium text-slate-900">{profile.company_name || '未設定'}</p>
                          </div>
                        </div>
                      </div>
                      
                      {profile.address && (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-slate-500 mt-1" />
                          <div>
                            <p className="text-sm text-slate-500">住所</p>
                            <p className="font-medium text-slate-900">{profile.address}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* 編集ボタン */}
                      <div className="pt-4 border-t border-slate-200">
                        <Button 
                          onClick={() => setEditMode(true)}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white w-full"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          プロフィールを編集
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* サイドバー - アクションメニューのみ */}
            <motion.div
              className="space-y-6 order-1 lg:order-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-slate-900 mb-4">アカウント設定</h3>
                  <div className="space-y-3">
                    <Link href="/orders">
                      <Button variant="ghost" className="w-full justify-start hover:bg-slate-100">
                        <Clock className="w-4 h-4 mr-3" />
                        注文履歴
                      </Button>
                    </Link>
                    
                    <Link href="/shipping-addresses">
                      <Button variant="ghost" className="w-full justify-start hover:bg-slate-100">
                        <MapPin className="w-4 h-4 mr-3" />
                        配送先管理
                      </Button>
                    </Link>
                    
                    <Link href="/forgot-password">
                      <Button variant="ghost" className="w-full justify-start hover:bg-slate-100">
                        <Shield className="w-4 h-4 mr-3" />
                        パスワード変更
                      </Button>
                    </Link>
                    
                    <div className="border-t border-slate-200 pt-3 mt-3">
                      <Button 
                        onClick={handleSignOut}
                        variant="ghost" 
                        className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        ログアウト
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </Navbar>
  )
} 