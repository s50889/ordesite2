"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { CalendarDays, MapPin, Plus, Check } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'

interface ShippingAddress {
  id: string
  company?: string
  site_name?: string
  postal_code: string
  prefecture: string
  city: string
  address1: string
  phone: string
  is_default: boolean
  created_at: string
}

function isHoliday(date: Date) {
  // 土日判定
  const day = date.getDay()
  if (day === 0 || day === 6) return true
  
  // 祝日判定（2024年の主要祝日）
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const dayOfMonth = date.getDate()
  
  // 固定祝日
  const fixedHolidays = [
    { month: 1, day: 1 },   // 元日
    { month: 2, day: 11 },  // 建国記念の日
    { month: 2, day: 23 },  // 天皇誕生日
    { month: 4, day: 29 },  // 昭和の日
    { month: 5, day: 3 },   // 憲法記念日
    { month: 5, day: 4 },   // みどりの日
    { month: 5, day: 5 },   // こどもの日
    { month: 8, day: 11 },  // 山の日
    { month: 11, day: 3 },  // 文化の日
    { month: 11, day: 23 }, // 勤労感謝の日
  ]
  
  // 固定祝日チェック
  for (const holiday of fixedHolidays) {
    if (month === holiday.month && dayOfMonth === holiday.day) {
      return true
    }
  }
  
  // 移動祝日（簡易版）
  if (year === 2024) {
    const movingHolidays2024 = [
      { month: 1, day: 8 },   // 成人の日（1月第2月曜日）
      { month: 3, day: 20 },  // 春分の日
      { month: 7, day: 15 },  // 海の日（7月第3月曜日）
      { month: 9, day: 16 },  // 敬老の日（9月第3月曜日）
      { month: 9, day: 22 },  // 秋分の日
      { month: 10, day: 14 }, // スポーツの日（10月第2月曜日）
    ]
    
    for (const holiday of movingHolidays2024) {
      if (month === holiday.month && dayOfMonth === holiday.day) {
        return true
      }
    }
  }
  
  if (year === 2025) {
    const movingHolidays2025 = [
      { month: 1, day: 13 },  // 成人の日
      { month: 3, day: 20 },  // 春分の日
      { month: 7, day: 21 },  // 海の日
      { month: 9, day: 15 },  // 敬老の日
      { month: 9, day: 23 },  // 秋分の日
      { month: 10, day: 13 }, // スポーツの日
    ]
    
    for (const holiday of movingHolidays2025) {
      if (month === holiday.month && dayOfMonth === holiday.day) {
        return true
      }
    }
  }
  
  return false
}

export default function OrderConfirmPage() {
  const router = useRouter()
  const [addresses, setAddresses] = useState<ShippingAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [showNewAddress, setShowNewAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    company: '',
    site_name: '',
    postal_code: '',
    prefecture: '',
    city: '',
    address1: '',
    phone: '',
    is_default: false
  })
  const [deliveryDate, setDeliveryDate] = useState('')
  const [note, setNote] = useState('')
  const [calendarMonth, setCalendarMonth] = useState(new Date())

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })
    setAddresses(data || [])
    if (data && data.length > 0) setSelectedAddressId(data[0].id)
  }

  const handleAddAddress = async (e: any) => {
    e.preventDefault()
    // 必須バリデーション
    const requiredFields = ['company', 'postal_code', 'prefecture', 'city', 'address1', 'phone'] as const
    for (const key of requiredFields) {
      if (!newAddress[key] || (newAddress[key] as string).trim() === '') {
        alert('必須項目が未入力です')
        return
      }
    }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('ユーザー情報を取得できません')
      return
    }
    const { error, data } = await supabase
      .from('shipping_addresses')
      .insert([{ ...newAddress, user_id: user.id }])
      .select()
      .single()
    if (!error && data) {
      setAddresses([data, ...addresses])
      setSelectedAddressId(data.id)
      setShowNewAddress(false)
      setNewAddress({
        company: '', site_name: '', postal_code: '', prefecture: '', city: '', address1: '', phone: '', is_default: false
      })
    } else {
      console.error('保存エラー:', error)
      alert('保存に失敗しました: ' + (error?.message || '不明なエラー'))
    }
  }

  // カレンダー生成
  const getCalendarDates = () => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const dates: (Date | null)[] = []

    // 月初の曜日まで null を追加してプレースホルダを作成
    for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
      dates.push(null)
    }

    // 月の日付を追加
    for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
      dates.push(new Date(year, month, d))
    }
    return dates
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAddressId && !showNewAddress) {
      alert('配送先を選択してください')
      return
    }
    if (!deliveryDate) {
      alert('配送希望日を選択してください')
      return
    }
    // 情報をまとめて注文確認画面へ
    const params = new URLSearchParams()
    params.set('addressId', selectedAddressId)
    params.set('note', note)
    params.set('deliveryDate', deliveryDate)
    router.push(`/order-check?${params.toString()}`)
  }

  return (
    <Navbar>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">注文手続き</h1>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 配送先選択 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><MapPin className="w-5 h-5 mr-2" />配送先</CardTitle>
              </CardHeader>
              <CardContent>
                {addresses.length > 0 && !showNewAddress && (
                  <div className="space-y-2 mb-4">
                    {addresses.map(addr => (
                      <div key={addr.id} className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                        onClick={() => setSelectedAddressId(addr.id)}>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-slate-900">{addr.company}</span>
                            {addr.site_name && <span className="ml-2 text-xs text-slate-500">{addr.site_name}</span>}
                            <div className="text-xs text-slate-500">〒{addr.postal_code} {addr.prefecture}{addr.city}{addr.address1}</div>
                            <div className="text-xs text-slate-500">TEL: {addr.phone}</div>
                          </div>
                          <input type="radio" name="address" checked={selectedAddressId === addr.id} readOnly className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                    ))}
                    <Button type="button" variant="outline" className="mt-2" onClick={() => setShowNewAddress(true)}>
                      <Plus className="w-4 h-4 mr-1" />新しい配送先を追加
                    </Button>
                  </div>
                )}
                {showNewAddress && (
                  <div className="space-y-3 mb-4">
                    <Input placeholder="会社名" value={newAddress.company} onChange={e => setNewAddress(a => ({ ...a, company: e.target.value }))} required />
                    <Input placeholder="工場名・支店名・現場名" value={newAddress.site_name || ''} onChange={e => setNewAddress(a => ({ ...a, site_name: e.target.value }))} />
                    <div className="flex gap-2">
                      <Input placeholder="郵便番号" value={newAddress.postal_code} 
                        onChange={async e => {
                          const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 7)
                          setNewAddress(a => ({ ...a, postal_code: value }))
                          if (value.length === 7) {
                            try {
                              const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${value}`)
                              const json = await res.json()
                              if (json && json.results && json.results[0]) {
                                const result = json.results[0]
                                setNewAddress(a => ({
                                  ...a,
                                  prefecture: result.address1 || '',
                                  city: result.address2 || '',
                                  address1: result.address3 || ''
                                }))
                              } else {
                                alert('該当する住所が見つかりませんでした')
                              }
                            } catch {
                              alert('住所自動取得に失敗しました')
                            }
                          }
                        }}
                        required
                      />
                    </div>
                    <Input placeholder="都道府県" value={newAddress.prefecture} onChange={e => setNewAddress(a => ({ ...a, prefecture: e.target.value }))} required />
                    <Input placeholder="市区町村" value={newAddress.city} onChange={e => setNewAddress(a => ({ ...a, city: e.target.value }))} required />
                    <Input placeholder="以降の住所" value={newAddress.address1} onChange={e => setNewAddress(a => ({ ...a, address1: e.target.value }))} required />
                    <Input placeholder="電話番号" value={newAddress.phone} onChange={e => setNewAddress(a => ({ ...a, phone: e.target.value }))} required />
                    <div className="flex gap-2 mt-2">
                      <Button type="button" className="flex-1 bg-blue-600 text-white" onClick={handleAddAddress}><Check className="w-4 h-4 mr-1" />保存</Button>
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setShowNewAddress(false)}>キャンセル</Button>
                    </div>
                  </div>
                )}
                {addresses.length === 0 && !showNewAddress && (
                  <Button type="button" onClick={() => setShowNewAddress(true)}>
                    <Plus className="w-4 h-4 mr-1" />配送先を追加
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* 配送希望日カレンダー */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><CalendarDays className="w-5 h-5 mr-2" />配送希望日</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Button type="button" variant="outline" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}>&lt;</Button>
                  <span className="font-medium">{calendarMonth.getFullYear()}年 {calendarMonth.getMonth() + 1}月</span>
                  <Button type="button" variant="outline" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}>&gt;</Button>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {["日","月","火","水","木","金","土"].map((d, i) => (
                    <div key={i} className="text-xs text-center font-bold text-slate-500">{d}</div>
                  ))}
                  {getCalendarDates().map((date, idx) => {
                    if (date === null) {
                      return <div key={`blank-${idx}`} />
                    }
                    const ymd = date.toISOString().slice(0,10)
                    const disabled = isHoliday(date) || date < new Date(new Date().toDateString())
                    return (
                      <button
                        key={ymd}
                        type="button"
                        className={`text-xs rounded p-2 border text-center ${disabled ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : (deliveryDate === ymd ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-50')}`}
                        disabled={disabled}
                        onClick={() => setDeliveryDate(ymd)}
                      >
                        {date.getDate()}
                      </button>
                    )
                  })}
                </div>
                {deliveryDate && (
                  <div className="mt-2 text-sm text-blue-700">選択中: {deliveryDate}</div>
                )}
              </CardContent>
            </Card>

            {/* 備考欄 */}
            <Card>
              <CardHeader>
                <CardTitle>備考</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="ご要望や特記事項があればご記入ください"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </CardContent>
            </Card>

            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-105">
              注文内容を確認
            </Button>
          </form>
        </div>
      </div>
    </Navbar>
  )
} 