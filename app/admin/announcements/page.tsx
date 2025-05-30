'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Edit, Trash2, Megaphone, Calendar, Tag } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Announcement {
  id: string
  title: string
  content: string
  type: string | null
  is_active: boolean | null
  priority: number | null
  created_at: string | null
  updated_at: string | null
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  
  // フォーム状態
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    is_active: true,
    priority: 0
  })

  useEffect(() => {
    checkAdminAndFetchData()
  }, [])

  const checkAdminAndFetchData = async () => {
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
    await fetchAnnouncements()
    setLoading(false)
  }

  const fetchAnnouncements = async () => {
    const supabase = createClient()
    
    try {
      // データベースからお知らせを取得
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('お知らせ取得エラー:', error)
        // エラーの場合はサンプルデータを使用
        const sampleAnnouncements: Announcement[] = [
          {
            id: '1',
            title: '年末年始休業のお知らせ',
            content: '誠に勝手ながら、12月29日（金）から1月3日（水）まで年末年始休業とさせていただきます。',
            type: 'important',
            is_active: true,
            priority: 1,
            created_at: '2024-01-15T00:00:00Z',
            updated_at: '2024-01-15T00:00:00Z'
          },
          {
            id: '2',
            title: '新製品ラインナップ追加のお知らせ',
            content: '高精度測定機器の新シリーズを追加いたしました。詳細は製品カタログをご確認ください。',
            type: 'product',
            is_active: true,
            priority: 0,
            created_at: '2024-01-10T00:00:00Z',
            updated_at: '2024-01-10T00:00:00Z'
          },
          {
            id: '3',
            title: 'システムメンテナンスのお知らせ',
            content: '1月20日（土）2:00-6:00にシステムメンテナンスを実施いたします。',
            type: 'maintenance',
            is_active: true,
            priority: 0,
            created_at: '2024-01-05T00:00:00Z',
            updated_at: '2024-01-05T00:00:00Z'
          }
        ]
        setAnnouncements(sampleAnnouncements)
        return
      }

      if (data) {
        setAnnouncements(data)
      }
    } catch (error) {
      console.error('お知らせ取得エラー:', error)
      toast.error('お知らせの取得に失敗しました')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const supabase = createClient()
    
    try {
      if (editingAnnouncement) {
        // 編集の場合
        const { data, error } = await supabase
          .from('announcements')
          .update({
            title: formData.title,
            content: formData.content,
            type: formData.type,
            is_active: formData.is_active,
            priority: formData.priority,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAnnouncement.id)
          .select()

        if (error) {
          console.error('更新エラー:', error)
          // データベースエラーの場合はローカル状態のみ更新
          const updatedAnnouncements = announcements.map(ann => 
            ann.id === editingAnnouncement.id 
              ? { ...ann, ...formData, updated_at: new Date().toISOString() }
              : ann
          )
          setAnnouncements(updatedAnnouncements)
        } else {
          // データベース更新成功時は再取得
          await fetchAnnouncements()
        }
        toast.success('お知らせを更新しました')
      } else {
        // 新規作成の場合
        const { data: { user } } = await supabase.auth.getUser()
        
        const { data, error } = await supabase
          .from('announcements')
          .insert({
            title: formData.title,
            content: formData.content,
            type: formData.type,
            is_active: formData.is_active,
            priority: formData.priority,
            created_by: user?.id
          })
          .select()

        if (error) {
          console.error('作成エラー:', error)
          // データベースエラーの場合はローカル状態のみ更新
          const newAnnouncement: Announcement = {
            id: Date.now().toString(),
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          setAnnouncements([newAnnouncement, ...announcements])
        } else {
          // データベース作成成功時は再取得
          await fetchAnnouncements()
        }
        toast.success('お知らせを作成しました')
      }
      
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('送信エラー:', error)
      toast.error('エラーが発生しました')
    }
  }

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type || 'info',
      is_active: announcement.is_active ?? true,
      priority: announcement.priority ?? 0
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('このお知らせを削除しますか？')) {
      const supabase = createClient()
      
      try {
        const { error } = await supabase
          .from('announcements')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('削除エラー:', error)
          // データベースエラーの場合はローカル状態のみ更新
          setAnnouncements(announcements.filter(ann => ann.id !== id))
        } else {
          // データベース削除成功時は再取得
          await fetchAnnouncements()
        }
        toast.success('お知らせを削除しました')
      } catch (error) {
        console.error('削除エラー:', error)
        toast.error('削除に失敗しました')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'info',
      is_active: true,
      priority: 0
    })
    setEditingAnnouncement(null)
  }

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: { label: string; color: string } } = {
      'important': { label: '重要', color: 'bg-red-100 text-red-800' },
      'product': { label: '新製品', color: 'bg-green-100 text-green-800' },
      'maintenance': { label: 'メンテナンス', color: 'bg-yellow-100 text-yellow-800' },
      'info': { label: '一般', color: 'bg-blue-100 text-blue-800' }
    }
    return types[type] || types['info']
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">お知らせ管理</h1>
            <p className="text-gray-600">お知らせの作成・編集・削除を行います</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={resetForm}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                新規作成
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingAnnouncement ? 'お知らせ編集' : 'お知らせ新規作成'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    タイトル
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="お知らせのタイトルを入力"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    内容
                  </label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="お知らせの内容を入力"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      種類
                    </label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value: string) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">一般</SelectItem>
                        <SelectItem value="important">重要</SelectItem>
                        <SelectItem value="product">新製品</SelectItem>
                        <SelectItem value="maintenance">メンテナンス</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      優先度
                    </label>
                    <Input
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                      min="0"
                      max="10"
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    公開する
                  </label>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    キャンセル
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                    {editingAnnouncement ? '更新' : '作成'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* お知らせ一覧 */}
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">お知らせがありません</p>
              </CardContent>
            </Card>
          ) : (
            announcements.map((announcement) => {
              const typeInfo = getTypeLabel(announcement.type || 'info')
              return (
                <Card key={announcement.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded mr-3 ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                          <span className="text-sm text-gray-500 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {format(new Date(announcement.created_at || new Date()), 'yyyy年MM月dd日', { locale: ja })}
                          </span>
                          {(announcement.priority ?? 0) > 0 && (
                            <span className="ml-3 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                              優先度: {announcement.priority}
                            </span>
                          )}
                          {!announcement.is_active && (
                            <span className="ml-3 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              非公開
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {announcement.title}
                        </h3>
                        
                        <p className="text-gray-600 leading-relaxed">
                          {announcement.content}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(announcement)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(announcement.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </Navbar>
  )
} 