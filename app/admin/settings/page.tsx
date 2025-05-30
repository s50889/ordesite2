'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Save, Settings, Globe, Mail, Truck, CreditCard, Shield, Database } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface SiteSettings {
  site_name: string
  site_description: string
  site_logo_url: string
  contact_email: string
  contact_phone: string
  contact_address: string
  business_hours: string
  maintenance_mode: boolean
}

interface MailSettings {
  sendgrid_api_key: string
  from_email: string
  from_name: string
  contact_from_email: string
  contact_from_name: string
  order_notification_enabled: boolean
  status_update_notification_enabled: boolean
  contact_auto_reply_enabled: boolean
}

interface ShippingSettings {
  free_shipping_threshold: number
  default_shipping_fee: number
  express_shipping_fee: number
  shipping_methods: string[]
  estimated_delivery_days: number
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    site_name: '',
    site_description: '',
    site_logo_url: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    business_hours: '',
    maintenance_mode: false
  })

  const [mailSettings, setMailSettings] = useState<MailSettings>({
    sendgrid_api_key: '',
    from_email: '',
    from_name: '',
    contact_from_email: '',
    contact_from_name: '',
    order_notification_enabled: true,
    status_update_notification_enabled: true,
    contact_auto_reply_enabled: true
  })

  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    free_shipping_threshold: 10000,
    default_shipping_fee: 500,
    express_shipping_fee: 1000,
    shipping_methods: ['通常配送', '速達配送'],
    estimated_delivery_days: 3
  })

  useEffect(() => {
    checkAdminAndLoadSettings()
  }, [])

  const checkAdminAndLoadSettings = async () => {
    const supabase = createClient()
    
    // ユーザー認証と権限チェック
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setAccessDenied(true)
      setLoading(false)
      return
    }

    // 管理者権限をチェック
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'admin') {
      setAccessDenied(true)
      setLoading(false)
      return
    }
    
    setIsAdmin(true)
    await loadSettings()
    setLoading(false)
  }

  const loadSettings = async () => {
    const supabase = createClient()
    
    // 設定データを取得（設定テーブルが存在しない場合はデフォルト値を使用）
    try {
      const { data: settings } = await supabase
        .from('site_settings')
        .select('*')
        .single()

      if (settings) {
        setSiteSettings({
          site_name: settings.site_name || 'オーダーサイト',
          site_description: settings.site_description || '',
          site_logo_url: settings.site_logo_url || '',
          contact_email: settings.contact_email || '',
          contact_phone: settings.contact_phone || '',
          contact_address: settings.contact_address || '',
          business_hours: settings.business_hours || '平日 9:00-18:00',
          maintenance_mode: settings.maintenance_mode || false
        })

        setMailSettings({
          sendgrid_api_key: settings.sendgrid_api_key || '',
          from_email: settings.from_email || '',
          from_name: settings.from_name || '',
          contact_from_email: settings.contact_from_email || '',
          contact_from_name: settings.contact_from_name || '',
          order_notification_enabled: settings.order_notification_enabled ?? true,
          status_update_notification_enabled: settings.status_update_notification_enabled ?? true,
          contact_auto_reply_enabled: settings.contact_auto_reply_enabled ?? true
        })

        // shipping_methodsの型安全な処理
        let shippingMethods = ['通常配送', '速達配送']
        if (settings.shipping_methods) {
          if (Array.isArray(settings.shipping_methods)) {
            shippingMethods = settings.shipping_methods as string[]
          } else if (typeof settings.shipping_methods === 'string') {
            try {
              const parsed = JSON.parse(settings.shipping_methods)
              if (Array.isArray(parsed)) {
                shippingMethods = parsed
              }
            } catch (e) {
              console.warn('配送方法のパースに失敗しました:', e)
            }
          }
        }

        setShippingSettings({
          free_shipping_threshold: settings.free_shipping_threshold || 10000,
          default_shipping_fee: settings.default_shipping_fee || 500,
          express_shipping_fee: settings.express_shipping_fee || 1000,
          shipping_methods: shippingMethods,
          estimated_delivery_days: settings.estimated_delivery_days || 3
        })
      }
    } catch (error) {
      console.log('設定テーブルが存在しないか、データがありません。デフォルト値を使用します。')
    }
  }

  const saveSettings = async (settingsType: 'site' | 'mail' | 'shipping') => {
    setSaving(true)
    const supabase = createClient()

    try {
      let settingsData = {}
      
      if (settingsType === 'site') {
        settingsData = siteSettings
      } else if (settingsType === 'mail') {
        settingsData = mailSettings
      } else if (settingsType === 'shipping') {
        settingsData = shippingSettings
      }

      // 設定を保存（upsert）
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          id: 1, // 単一の設定レコード
          ...settingsData,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('設定保存エラー:', error)
        toast.error('設定の保存に失敗しました')
      } else {
        toast.success('設定を保存しました')
      }
    } catch (error) {
      console.error('設定保存エラー:', error)
      toast.error('設定の保存に失敗しました')
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <Navbar>
        <div className="p-8">
          <div className="text-center">読み込み中...</div>
        </div>
      </Navbar>
    )
  }

  if (accessDenied) {
    return (
      <Navbar>
        <div className="p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">アクセス拒否</h1>
            <p className="text-gray-600">このページにアクセスする権限がありません。</p>
          </div>
        </div>
      </Navbar>
    )
  }

  return (
    <Navbar>
      <div className="p-8">
        <div className="flex items-center mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              ダッシュボードに戻る
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">システム設定</h1>
        </div>

        <Tabs defaultValue="site" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="site" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              サイト設定
            </TabsTrigger>
            <TabsTrigger value="mail" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              メール設定（SendGrid）
            </TabsTrigger>
            <TabsTrigger value="shipping" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              配送設定
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              システム
            </TabsTrigger>
          </TabsList>

          {/* サイト設定 */}
          <TabsContent value="site">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  サイト基本設定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="site_name">サイト名</Label>
                    <Input
                      id="site_name"
                      value={siteSettings.site_name}
                      onChange={(e) => setSiteSettings({...siteSettings, site_name: e.target.value})}
                      placeholder="オーダーサイト"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_email">連絡先メールアドレス</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={siteSettings.contact_email}
                      onChange={(e) => setSiteSettings({...siteSettings, contact_email: e.target.value})}
                      placeholder="contact@example.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="site_description">サイト説明</Label>
                  <Textarea
                    id="site_description"
                    value={siteSettings.site_description}
                    onChange={(e) => setSiteSettings({...siteSettings, site_description: e.target.value})}
                    placeholder="サイトの説明を入力してください"
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="contact_phone">電話番号</Label>
                    <Input
                      id="contact_phone"
                      value={siteSettings.contact_phone}
                      onChange={(e) => setSiteSettings({...siteSettings, contact_phone: e.target.value})}
                      placeholder="03-1234-5678"
                    />
                  </div>
                  <div>
                    <Label htmlFor="business_hours">営業時間</Label>
                    <Input
                      id="business_hours"
                      value={siteSettings.business_hours}
                      onChange={(e) => setSiteSettings({...siteSettings, business_hours: e.target.value})}
                      placeholder="平日 9:00-18:00"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contact_address">住所</Label>
                  <Textarea
                    id="contact_address"
                    value={siteSettings.contact_address}
                    onChange={(e) => setSiteSettings({...siteSettings, contact_address: e.target.value})}
                    placeholder="〒000-0000 東京都..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="site_logo_url">ロゴURL</Label>
                  <Input
                    id="site_logo_url"
                    value={siteSettings.site_logo_url}
                    onChange={(e) => setSiteSettings({...siteSettings, site_logo_url: e.target.value})}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="maintenance_mode"
                    checked={siteSettings.maintenance_mode}
                    onChange={(e) => setSiteSettings({...siteSettings, maintenance_mode: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="maintenance_mode">メンテナンスモード</Label>
                </div>

                <Button 
                  onClick={() => saveSettings('site')} 
                  disabled={saving}
                  className="w-full md:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? '保存中...' : 'サイト設定を保存'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* メール設定 */}
          <TabsContent value="mail">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  メール設定（SendGrid）
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">SendGrid設定について</h4>
                  <p className="text-blue-700 text-sm">
                    SendGridを使用してメール送信を行います。SendGridのAPIキーを取得して設定してください。<br />
                    <a href="https://sendgrid.com/" target="_blank" rel="noopener noreferrer" className="underline">
                      SendGrid公式サイト
                    </a>
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">送信者設定について</h4>
                  <div className="text-green-700 text-sm space-y-2">
                    <p><strong>注文関連メール:</strong> 注文確認メール、ステータス更新メールに使用</p>
                    <p><strong>お問い合わせメール:</strong> お問い合わせ受信通知、自動返信メールに使用</p>
                    <p>お問い合わせ用の設定が空の場合は、注文関連の設定が使用されます。</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="sendgrid_api_key">SendGrid APIキー</Label>
                  <Input
                    id="sendgrid_api_key"
                    type="password"
                    value={mailSettings.sendgrid_api_key}
                    onChange={(e) => setMailSettings({...mailSettings, sendgrid_api_key: e.target.value})}
                    placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    SendGridのAPIキーを入力してください。環境変数SENDGRID_API_KEYでも設定可能です。
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="from_email">送信者メールアドレス（注文関連）</Label>
                    <Input
                      id="from_email"
                      type="email"
                      value={mailSettings.from_email}
                      onChange={(e) => setMailSettings({...mailSettings, from_email: e.target.value})}
                      placeholder="order@example.com"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      注文確認メール、ステータス更新メールの送信者
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="from_name">送信者名（注文関連）</Label>
                    <Input
                      id="from_name"
                      value={mailSettings.from_name}
                      onChange={(e) => setMailSettings({...mailSettings, from_name: e.target.value})}
                      placeholder="オーダーサイト"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="contact_from_email">送信者メールアドレス（お問い合わせ）</Label>
                    <Input
                      id="contact_from_email"
                      type="email"
                      value={mailSettings.contact_from_email}
                      onChange={(e) => setMailSettings({...mailSettings, contact_from_email: e.target.value})}
                      placeholder="contact@example.com"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      お問い合わせ受信・自動返信メールの送信者（空の場合は注文関連と同じ）
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="contact_from_name">送信者名（お問い合わせ）</Label>
                    <Input
                      id="contact_from_name"
                      value={mailSettings.contact_from_name}
                      onChange={(e) => setMailSettings({...mailSettings, contact_from_name: e.target.value})}
                      placeholder="カスタマーサポート"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">メール通知設定</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="order_notification"
                        checked={mailSettings.order_notification_enabled}
                        onChange={(e) => setMailSettings({...mailSettings, order_notification_enabled: e.target.checked})}
                        className="rounded"
                      />
                      <Label htmlFor="order_notification">注文確認メールを送信</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="status_notification"
                        checked={mailSettings.status_update_notification_enabled}
                        onChange={(e) => setMailSettings({...mailSettings, status_update_notification_enabled: e.target.checked})}
                        className="rounded"
                      />
                      <Label htmlFor="status_notification">ステータス更新メールを送信</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="contact_auto_reply"
                        checked={mailSettings.contact_auto_reply_enabled}
                        onChange={(e) => setMailSettings({...mailSettings, contact_auto_reply_enabled: e.target.checked})}
                        className="rounded"
                      />
                      <Label htmlFor="contact_auto_reply">お問い合わせ自動返信メールを送信</Label>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">メール送信テスト</h4>
                  <p className="text-yellow-700 text-sm mb-3">
                    設定保存後、テストメールを送信して動作確認を行うことをお勧めします。
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/send-email', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            type: 'contact_auto_reply',
                            to: mailSettings.from_email,
                            data: {
                              name: 'テストユーザー',
                              email: mailSettings.from_email,
                              message: 'これはテストメールです。',
                              type: 'テスト'
                            }
                          })
                        })
                        if (response.ok) {
                          toast.success('テストメールを送信しました')
                        } else {
                          toast.error('テストメール送信に失敗しました')
                        }
                      } catch (error) {
                        toast.error('テストメール送信に失敗しました')
                      }
                    }}
                    disabled={!mailSettings.from_email || saving}
                  >
                    テストメール送信
                  </Button>
                </div>

                <Button 
                  onClick={() => saveSettings('mail')} 
                  disabled={saving}
                  className="w-full md:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? '保存中...' : 'メール設定を保存'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 配送設定 */}
          <TabsContent value="shipping">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  配送設定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="free_shipping_threshold">送料無料ライン（円）</Label>
                    <Input
                      id="free_shipping_threshold"
                      type="number"
                      value={shippingSettings.free_shipping_threshold}
                      onChange={(e) => setShippingSettings({...shippingSettings, free_shipping_threshold: parseInt(e.target.value)})}
                      placeholder="10000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="default_shipping_fee">通常配送料（円）</Label>
                    <Input
                      id="default_shipping_fee"
                      type="number"
                      value={shippingSettings.default_shipping_fee}
                      onChange={(e) => setShippingSettings({...shippingSettings, default_shipping_fee: parseInt(e.target.value)})}
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="express_shipping_fee">速達配送料（円）</Label>
                    <Input
                      id="express_shipping_fee"
                      type="number"
                      value={shippingSettings.express_shipping_fee}
                      onChange={(e) => setShippingSettings({...shippingSettings, express_shipping_fee: parseInt(e.target.value)})}
                      placeholder="1000"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="estimated_delivery_days">配送予定日数（日）</Label>
                  <Input
                    id="estimated_delivery_days"
                    type="number"
                    value={shippingSettings.estimated_delivery_days}
                    onChange={(e) => setShippingSettings({...shippingSettings, estimated_delivery_days: parseInt(e.target.value)})}
                    placeholder="3"
                    className="w-full md:w-48"
                  />
                </div>

                <div>
                  <Label>配送方法</Label>
                  <div className="mt-2 space-y-2">
                    {shippingSettings.shipping_methods.map((method, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={method}
                          onChange={(e) => {
                            const newMethods = [...shippingSettings.shipping_methods]
                            newMethods[index] = e.target.value
                            setShippingSettings({...shippingSettings, shipping_methods: newMethods})
                          }}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newMethods = shippingSettings.shipping_methods.filter((_, i) => i !== index)
                            setShippingSettings({...shippingSettings, shipping_methods: newMethods})
                          }}
                        >
                          削除
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShippingSettings({
                          ...shippingSettings, 
                          shipping_methods: [...shippingSettings.shipping_methods, '新しい配送方法']
                        })
                      }}
                    >
                      配送方法を追加
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={() => saveSettings('shipping')} 
                  disabled={saving}
                  className="w-full md:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? '保存中...' : '配送設定を保存'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* システム設定 */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  システム情報
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-4">アプリケーション情報</h4>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>バージョン:</span>
                        <span>1.0.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>環境:</span>
                        <span>開発環境</span>
                      </div>
                      <div className="flex justify-between">
                        <span>フレームワーク:</span>
                        <span>Next.js 15</span>
                      </div>
                      <div className="flex justify-between">
                        <span>データベース:</span>
                        <span>Supabase</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">サーバー情報</h4>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>最終更新:</span>
                        <span>{new Date().toLocaleString('ja-JP')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ステータス:</span>
                        <span className="text-green-600">正常</span>
                      </div>
                      <div className="flex justify-between">
                        <span>メンテナンスモード:</span>
                        <span className={siteSettings.maintenance_mode ? 'text-red-600' : 'text-green-600'}>
                          {siteSettings.maintenance_mode ? 'ON' : 'OFF'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6 border-yellow-200 bg-yellow-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="text-yellow-600">⚠️</div>
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-2">設定について</h4>
                    <p className="text-yellow-700 text-sm">
                      設定を変更した場合は、必ず保存ボタンをクリックしてください。
                      メンテナンスモードを有効にすると、管理者以外のユーザーはサイトにアクセスできなくなります。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Navbar>
  )
} 