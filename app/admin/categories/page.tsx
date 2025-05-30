'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { FolderPlus, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Category, Product } from '@/types'

// Dynamic rendering を強制してSSG時のエラーを回避
export const dynamic = 'force-dynamic'

export default function CategoriesManagePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    display_order: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()
    
    // カテゴリを取得
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true })

    if (categoriesData) {
      setCategories(categoriesData)
    } else if (categoriesError) {
      console.error('カテゴリ取得エラー:', categoriesError)
      toast.error('カテゴリの取得に失敗しました')
    }

    // 製品を取得（カテゴリ別の製品数を表示するため）
    const { data: productsData } = await supabase
      .from('products')
      .select('id, sku, name, description, category_id, specs, image_url, stock_quantity, is_active, moq, created_at, updated_at')

    if (productsData) {
      setProducts(productsData as unknown as Product[])
    }
    
    setLoading(false)
  }

  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast.error('カテゴリ名は必須です')
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from('categories').insert([
      {
        name: newCategory.name,
        description: newCategory.description || null,
        display_order: newCategory.display_order,
      },
    ])

    if (error) {
      console.error('カテゴリ追加エラー:', error)
      toast.error(`カテゴリの追加に失敗しました: ${error.message}`)
      return
    }

    toast.success('カテゴリを追加しました')
    setNewCategory({
      name: '',
      description: '',
      display_order: 0,
    })

    fetchData()
  }

  const createDefaultCategories = async () => {
    const supabase = createClient()
    const defaultCategories = [
      { name: '一般製品', description: '一般的な製品カテゴリ', display_order: 1 },
      { name: '電子部品', description: '電子機器関連の部品', display_order: 2 },
      { name: '機械部品', description: '機械・機器の部品', display_order: 3 },
      { name: '材料', description: '原材料・素材', display_order: 4 },
      { name: '工具', description: '工具・器具類', display_order: 5 },
    ]

    for (const category of defaultCategories) {
      const { error } = await supabase.from('categories').insert([category])
      if (error) {
        console.error('デフォルトカテゴリ作成エラー:', error)
      }
    }

    toast.success('デフォルトカテゴリを作成しました')
    fetchData()
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('このカテゴリを削除してもよろしいですか？関連する製品のカテゴリは未分類になります。')) {
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (error) {
      toast.error('カテゴリの削除に失敗しました')
      return
    }

    toast.success('カテゴリを削除しました')
    fetchData()
  }

  const groupedProducts = categories.reduce((acc, category) => {
    acc[category.id] = products.filter(product => product.category_id === category.id)
    return acc
  }, {} as Record<string, Product[]>)

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
          <h1 className="text-3xl font-bold text-gray-900">カテゴリ管理</h1>
        </div>

        <div className="space-y-6">
          {/* カテゴリ一覧 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>カテゴリ一覧</CardTitle>
                {categories.length === 0 && (
                  <Button onClick={createDefaultCategories} variant="outline">
                    デフォルトカテゴリを作成
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-lg font-medium mb-2">カテゴリがありません</div>
                    <div className="text-sm">
                      製品を追加する前に、まずカテゴリを作成してください。
                    </div>
                  </div>
                ) : (
                  categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{category.name}</div>
                      {category.description && (
                        <div className="text-sm text-muted-foreground">
                          {category.description}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        表示順: {category.display_order ?? 0} | 
                        製品数: {groupedProducts[category.id]?.length || 0}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* 新規カテゴリ追加 */}
          <Card>
            <CardHeader>
              <CardTitle>新規カテゴリ追加</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="categoryName">カテゴリ名</Label>
                    <Input
                      id="categoryName"
                      value={newCategory.name}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayOrder">表示順</Label>
                    <Input
                      id="displayOrder"
                      type="number"
                      value={newCategory.display_order}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, display_order: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryDescription">説明</Label>
                  <Textarea
                    id="categoryDescription"
                    value={newCategory.description}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, description: e.target.value })
                    }
                  />
                </div>
                <Button onClick={handleAddCategory} className="w-full">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  カテゴリを追加
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Navbar>
  )
} 