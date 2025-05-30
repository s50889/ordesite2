'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Users, ArrowLeft, Search } from 'lucide-react'
import Link from 'next/link'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  phone: string | null
  role: string
  created_at: string
  last_sign_in_at: string | null
}

export default function UsersManagePage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const supabase = createClient()
    
    const { data: usersData, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('ユーザー取得エラー:', error)
      toast.error('ユーザーの取得に失敗しました')
    } else if (usersData) {
      setUsers(usersData)
    }
    
    setLoading(false)
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      console.error('ロール更新エラー:', error)
      toast.error('ロールの更新に失敗しました')
    } else {
      toast.success('ロールを更新しました')
      fetchUsers()
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'user':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return '管理者'
      case 'user':
        return '一般ユーザー'
      default:
        return role
    }
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
          <h1 className="text-3xl font-bold text-gray-900">ユーザー管理</h1>
        </div>

        <div className="space-y-6">
          {/* 検索・フィルター */}
          <Card>
            <CardHeader>
              <CardTitle>ユーザー検索・フィルター</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="名前、メール、会社名で検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="ロールを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべてのロール</SelectItem>
                    <SelectItem value="admin">管理者</SelectItem>
                    <SelectItem value="user">一般ユーザー</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-muted-foreground flex items-center">
                  {filteredUsers.length}件のユーザー
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ユーザー一覧 */}
          <Card>
            <CardHeader>
              <CardTitle>ユーザー一覧</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    ユーザーが見つかりません
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="font-medium">
                            {user.full_name || 'ユーザー名未設定'}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>メール: {user.email}</div>
                          {user.company_name && (
                            <div>会社名: {user.company_name}</div>
                          )}
                          {user.phone && (
                            <div>電話番号: {user.phone}</div>
                          )}
                          <div>登録日: {new Date(user.created_at).toLocaleDateString('ja-JP')}</div>
                          {user.last_sign_in_at && (
                            <div>最終ログイン: {new Date(user.last_sign_in_at).toLocaleString('ja-JP')}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">ロール:</span>
                        <Select
                          value={user.role}
                          onValueChange={(value) => updateUserRole(user.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">管理者</SelectItem>
                            <SelectItem value="user">一般ユーザー</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* 統計情報 */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground">総ユーザー数</p>
                    <p className="text-3xl font-bold">{users.length}</p>
                  </div>
                  <Users className="h-12 w-12 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground">管理者</p>
                    <p className="text-3xl font-bold">
                      {users.filter(u => u.role === 'admin').length}
                    </p>
                  </div>
                  <Users className="h-12 w-12 text-red-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground">一般ユーザー</p>
                    <p className="text-3xl font-bold">
                      {users.filter(u => u.role === 'user').length}
                    </p>
                  </div>
                  <Users className="h-12 w-12 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Navbar>
  )
} 