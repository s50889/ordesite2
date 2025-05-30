"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Plus, Edit, Trash2, Check } from 'lucide-react'

interface ShippingAddress {
  id: string
  name: string
  company?: string
  postal_code: string
  prefecture: string
  city: string
  address1: string
  address2?: string
  phone: string
  is_default: boolean
  created_at: string
}

export default function ShippingAddressesPage() {
  const [addresses, setAddresses] = useState<ShippingAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    postal_code: '',
    prefecture: '',
    city: '',
    address1: '',
    address2: '',
    phone: '',
    is_default: false
  })

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (data) {
        setAddresses(data)
      }
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    try {
      if (editingId) {
        // 更新
        const { error } = await supabase
          .from('shipping_addresses')
          .update(formData)
          .eq('id', editingId)
          .eq('user_id', user.id)

        if (error) throw error
      } else {
        // 新規作成
        const { error } = await supabase
          .from('shipping_addresses')
          .insert([{ ...formData, user_id: user.id }])

        if (error) throw error
      }

      // デフォルト設定の場合、他のアドレスのデフォルトを解除
      if (formData.is_default) {
        await supabase
          .from('shipping_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', editingId || '')
      }

      resetForm()
      fetchAddresses()
    } catch (error) {
      console.error('保存エラー:', error)
      alert('保存に失敗しました')
    }
  }

  const handleEdit = (address: ShippingAddress) => {
    setFormData({
      name: address.name,
      company: address.company || '',
      postal_code: address.postal_code,
      prefecture: address.prefecture,
      city: address.city,
      address1: address.address1,
      address2: address.address2 || '',
      phone: address.phone,
      is_default: address.is_default
    })
    setEditingId(address.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この配送先を削除しますか？')) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    try {
      const { error } = await supabase
        .from('shipping_addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      fetchAddresses()
    } catch (error) {
      console.error('削除エラー:', error)
      alert('削除に失敗しました')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      company: '',
      postal_code: '',
      prefecture: '',
      city: '',
      address1: '',
      address2: '',
      phone: '',
      is_default: false
    })
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <Navbar>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">読み込み中...</div>
        </div>
      </Navbar>
    )
  }

  return (
    <Navbar>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">配送先管理</h1>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            新しい配送先を追加
          </Button>
        </div>

        {/* 配送先一覧 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address) => (
            <Card key={address.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    {address.is_default && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        デフォルト
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(address)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(address.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="mb-2 font-semibold text-lg">{address.name}</div>
                {address.company && <div className="text-sm text-gray-500 mb-1">{address.company}</div>}
                <div className="text-sm text-gray-700 mb-1">〒{address.postal_code} {address.prefecture}{address.city}{address.address1}</div>
                {address.address2 && <div className="text-sm text-gray-700 mb-1">{address.address2}</div>}
                <div className="text-sm text-gray-700 mb-1">TEL: {address.phone}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* フォーム */}
        {showForm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                onClick={resetForm}
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-6">{editingId ? '配送先を編集' : '新しい配送先を追加'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">お名前</Label>
                  <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="company">会社名（任意）</Label>
                  <Input id="company" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="postal_code">郵便番号</Label>
                  <Input id="postal_code" value={formData.postal_code} onChange={e => setFormData({ ...formData, postal_code: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="prefecture">都道府県</Label>
                  <Input id="prefecture" value={formData.prefecture} onChange={e => setFormData({ ...formData, prefecture: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="city">市区町村</Label>
                  <Input id="city" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="address1">番地・建物名</Label>
                  <Input id="address1" value={formData.address1} onChange={e => setFormData({ ...formData, address1: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="address2">部屋番号・その他（任意）</Label>
                  <Input id="address2" value={formData.address2} onChange={e => setFormData({ ...formData, address2: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="phone">電話番号</Label>
                  <Input id="phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={formData.is_default}
                    onChange={e => setFormData({ ...formData, is_default: e.target.checked })}
                  />
                  <Label htmlFor="is_default">この住所をデフォルトに設定</Label>
                </div>
                <div className="flex gap-4 mt-6">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white flex-1">
                    <Check className="w-4 h-4 mr-2" />
                    保存
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                    キャンセル
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Navbar>
  )
} 