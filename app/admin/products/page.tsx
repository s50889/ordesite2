'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Package, Plus, Trash2, ArrowLeft, Edit, Save, X, Upload, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { Category, Product } from '@/types'

export default function ProductsManagePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [addingProduct, setAddingProduct] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [uploadingNew, setUploadingNew] = useState(false)
  
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    description: '',
    category_id: '',
    specs: '',
    image_url: '',
    moq: 1,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const handleNewImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      toast.error('ファイルサイズは5MB以下にしてください')
      return
    }

    // ファイル形式チェック
    if (!file.type.startsWith('image/')) {
      toast.error('画像ファイルを選択してください')
      return
    }

    setUploadingNew(true)
    try {
      const supabase = createClient()
      
      // ファイル名を生成（タイムスタンプ + 元のファイル名）
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `products/${fileName}`

      // Supabase Storageにアップロード
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      // 新規商品データを更新
      setNewProduct({ ...newProduct, image_url: publicUrl })
      toast.success('画像をアップロードしました')
    } catch (error: any) {
      console.error('画像アップロードエラー:', error)
      toast.error('画像のアップロードに失敗しました')
    } finally {
      setUploadingNew(false)
    }
  }

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

    // 製品をカテゴリ情報と一緒に取得
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .order('sku', { ascending: true })

    if (productsData) {
      setProducts(productsData)
    }
    
    setLoading(false)
  }

  const handleAddProduct = async () => {
    setAddingProduct(true)
    
    try {
      if (categories.length === 0) {
        toast.error('カテゴリが存在しません。まずカテゴリを作成してください。')
        setAddingProduct(false)
        return
      }

      if (!newProduct.sku || !newProduct.name || !newProduct.category_id) {
        toast.error('製品番号、製品名、カテゴリは必須です')
        setAddingProduct(false)
        return
      }

      const supabase = createClient()
      
      // SKUの重複チェック
      const { data: existingSku } = await supabase
        .from('products')
        .select('sku')
        .eq('sku', newProduct.sku)
        .single()
      
      if (existingSku) {
        toast.error(`製品番号「${newProduct.sku}」は既に使用されています。`)
        setAddingProduct(false)
        return
      }

      const insertData = {
        sku: newProduct.sku,
        name: newProduct.name,
        description: newProduct.description || null,
        category_id: newProduct.category_id,
        specs: newProduct.specs || null,
        image_url: newProduct.image_url || null,
        moq: newProduct.moq,
      }
      
      const { error } = await supabase.from('products').insert([insertData])
      
      if (error) {
        toast.error(`製品の追加に失敗しました: ${error.message}`)
        setAddingProduct(false)
        return
      }

      toast.success('製品を追加しました！')
      
      // フォームをリセット
      setNewProduct({
        sku: '',
        name: '',
        description: '',
        category_id: '',
        specs: '',
        image_url: '',
        moq: 1,
      })

      await fetchData()
      setAddingProduct(false)
      
    } catch (error) {
      console.error('製品追加エラー:', error)
      toast.error('製品追加処理中にエラーが発生しました')
      setAddingProduct(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('この製品を削除してもよろしいですか？')) {
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) {
      toast.error('製品の削除に失敗しました')
      return
    }

    toast.success('製品を削除しました')
    fetchData()
  }

  const handleUpdateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    const supabase = createClient()
    
    // SKUの重複チェック（自分以外で同じSKUがないか）
    if (updatedProduct.sku) {
      const { data: existingSku } = await supabase
        .from('products')
        .select('id, sku')
        .eq('sku', updatedProduct.sku)
        .neq('id', id)
        .single()
      
      if (existingSku) {
        toast.error(`製品番号「${updatedProduct.sku}」は既に使用されています。`)
        return false
      }
    }

    const { error } = await supabase
      .from('products')
      .update(updatedProduct)
      .eq('id', id)

    if (error) {
      toast.error('製品の更新に失敗しました')
      return false
    }

    toast.success('製品を更新しました')
    fetchData()
    return true
  }

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category_id === selectedCategory)

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
          <h1 className="text-3xl font-bold text-gray-900">製品管理</h1>
        </div>

        <div className="space-y-6">
          {/* 製品フィルター */}
          <Card>
            <CardHeader>
              <CardTitle>製品フィルター</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべてのカテゴリ</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* 製品一覧 */}
          {selectedCategory === 'all' ? (
            <div className="space-y-6">
              {categories.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {category.name}
                      <span className="text-sm text-muted-foreground">
                        ({groupedProducts[category.id]?.length || 0}件)
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {groupedProducts[category.id]?.length > 0 ? (
                        groupedProducts[category.id].map((product) => (
                          <ProductCard 
                            key={product.id} 
                            product={product} 
                            categories={categories}
                            onDelete={handleDeleteProduct}
                            onUpdate={handleUpdateProduct}
                          />
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          このカテゴリには製品がありません
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  {categories.find(c => c.id === selectedCategory)?.name || '製品一覧'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      categories={categories}
                      onDelete={handleDeleteProduct}
                      onUpdate={handleUpdateProduct}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 新規製品追加 */}
          <Card>
            <CardHeader>
              <CardTitle>新規製品追加</CardTitle>
            </CardHeader>
            <CardContent>
              {categories.length === 0 && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-yellow-800 font-medium">⚠️ カテゴリが見つかりません</div>
                  <div className="text-yellow-700 text-sm mt-1">
                    製品を追加する前に、まずカテゴリを作成してください。
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sku">製品番号</Label>
                    <Input
                      id="sku"
                      value={newProduct.sku}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, sku: e.target.value })
                      }
                      placeholder="例: ABC-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">製品名</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                    />
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">カテゴリ</Label>
                    <Select 
                      value={newProduct.category_id || undefined} 
                      onValueChange={(value: string) => {
                        setNewProduct({ ...newProduct, category_id: value })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          categories.length === 0 
                            ? "カテゴリがありません" 
                            : "カテゴリを選択"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length === 0 ? (
                          <SelectItem value="" disabled>
                            カテゴリがありません
                          </SelectItem>
                        ) : (
                          categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="moq">最小注文数量</Label>
                    <Input
                      id="moq"
                      type="number"
                      min="1"
                      value={newProduct.moq}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, moq: parseInt(e.target.value) || 1 })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">製品説明</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, description: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specs">仕様</Label>
                  <Textarea
                    id="specs"
                    value={newProduct.specs}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, specs: e.target.value })
                    }
                  />
                </div>

                {/* 画像アップロード */}
                <div className="space-y-2">
                  <Label>商品画像</Label>
                  <div className="flex items-start gap-4">
                    {/* 現在の画像表示 */}
                    <div className="flex-shrink-0">
                      {newProduct.image_url ? (
                        <div className="relative w-24 h-24 border rounded-lg overflow-hidden">
                          <img
                            src={newProduct.image_url}
                            alt="商品画像"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 border rounded-lg flex items-center justify-center bg-gray-50">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* アップロードボタン */}
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadingNew}
                          onClick={() => document.getElementById('new-image-upload')?.click()}
                        >
                          {uploadingNew ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                              アップロード中...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              画像を選択
                            </>
                          )}
                        </Button>
                        {newProduct.image_url && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setNewProduct({ ...newProduct, image_url: '' })}
                          >
                            <X className="h-4 w-4 mr-2" />
                            削除
                          </Button>
                        )}
                      </div>
                      <input
                        id="new-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleNewImageUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-gray-500">
                        JPG, PNG, GIF形式、5MB以下
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleAddProduct}
                  className="w-full"
                  disabled={addingProduct}
                >
                  {addingProduct ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      登録中...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      製品を追加
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Navbar>
  )
}

// 編集用の型定義
interface EditingProduct {
  sku: string
  name: string
  description: string
  category_id: string
  specs: string
  moq: number
  image_url: string
}

// 製品カードコンポーネント
function ProductCard({ 
  product, 
  categories, 
  onDelete, 
  onUpdate 
}: { 
  product: Product; 
  categories: Category[];
  onDelete: (id: string) => void; 
  onUpdate: (id: string, updatedProduct: Partial<Product>) => Promise<boolean>;
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingProduct, setEditingProduct] = useState<EditingProduct>({
    sku: product.sku,
    name: product.name,
    description: product.description || '',
    category_id: product.category_id || '',
    specs: product.specs || '',
    moq: product.moq,
    image_url: product.image_url || ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      toast.error('ファイルサイズは5MB以下にしてください')
      return
    }

    // ファイル形式チェック
    if (!file.type.startsWith('image/')) {
      toast.error('画像ファイルを選択してください')
      return
    }

    setUploading(true)
    try {
      const supabase = createClient()
      
      // ファイル名を生成（タイムスタンプ + 元のファイル名）
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `products/${fileName}`

      // Supabase Storageにアップロード
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      // 編集中の商品データを更新
      setEditingProduct({ ...editingProduct, image_url: publicUrl })
      toast.success('画像をアップロードしました')
    } catch (error: any) {
      console.error('画像アップロードエラー:', error)
      toast.error('画像のアップロードに失敗しました')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!editingProduct.sku || !editingProduct.name || !editingProduct.category_id) {
      toast.error('製品番号、製品名、カテゴリは必須です')
      return
    }

    setIsSaving(true)
    const success = await onUpdate(product.id, {
      sku: editingProduct.sku,
      name: editingProduct.name,
      description: editingProduct.description || null,
      category_id: editingProduct.category_id,
      specs: editingProduct.specs || null,
      moq: editingProduct.moq,
      image_url: editingProduct.image_url || null,
    })

    if (success) {
      setIsEditing(false)
    }
    setIsSaving(false)
  }

  const handleCancel = () => {
    setEditingProduct({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      category_id: product.category_id || '',
      specs: product.specs || '',
      moq: product.moq,
      image_url: product.image_url || ''
    })
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="p-4 border rounded-lg bg-blue-50">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`edit-sku-${product.id}`}>製品番号</Label>
              <Input
                id={`edit-sku-${product.id}`}
                value={editingProduct.sku}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, sku: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-name-${product.id}`}>製品名</Label>
              <Input
                id={`edit-name-${product.id}`}
                value={editingProduct.name}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, name: e.target.value })
                }
              />
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`edit-category-${product.id}`}>カテゴリ</Label>
              <Select 
                value={editingProduct.category_id} 
                onValueChange={(value: string) => {
                  setEditingProduct({ ...editingProduct, category_id: value })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-moq-${product.id}`}>最小注文数量</Label>
              <Input
                id={`edit-moq-${product.id}`}
                type="number"
                min="1"
                value={editingProduct.moq}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, moq: parseInt(e.target.value) || 1 })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`edit-description-${product.id}`}>製品説明</Label>
            <Textarea
              id={`edit-description-${product.id}`}
              value={editingProduct.description || ''}
                              onChange={(e) =>
                  setEditingProduct({ ...editingProduct, description: e.target.value })
                }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`edit-specs-${product.id}`}>仕様</Label>
            <Textarea
              id={`edit-specs-${product.id}`}
              value={editingProduct.specs || ''}
              onChange={(e) =>
                setEditingProduct({ ...editingProduct, specs: e.target.value })
              }
            />
          </div>

          {/* 画像アップロード */}
          <div className="space-y-2">
            <Label>商品画像</Label>
            <div className="flex items-start gap-4">
              {/* 現在の画像表示 */}
              <div className="flex-shrink-0">
                {editingProduct.image_url ? (
                  <div className="relative w-24 h-24 border rounded-lg overflow-hidden">
                    <img
                      src={editingProduct.image_url}
                      alt="商品画像"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 border rounded-lg flex items-center justify-center bg-gray-50">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* アップロードボタン */}
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => document.getElementById(`image-upload-${product.id}`)?.click()}
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        アップロード中...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        画像を選択
                      </>
                    )}
                  </Button>
                  {editingProduct.image_url && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProduct({ ...editingProduct, image_url: '' })}
                    >
                      <X className="h-4 w-4 mr-2" />
                      削除
                    </Button>
                  )}
                </div>
                <input
                  id={`image-upload-${product.id}`}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-gray-500">
                  JPG, PNG, GIF形式、5MB以下
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  保存
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              size="sm"
            >
              <X className="h-4 w-4 mr-2" />
              キャンセル
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg">
      {/* 商品画像 */}
      <div className="flex-shrink-0">
        {product.image_url ? (
          <div className="w-16 h-16 border rounded-lg overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 border rounded-lg flex items-center justify-center bg-gray-50">
            <ImageIcon className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <div className="font-medium">{product.name}</div>
        <div className="text-sm text-muted-foreground">
          製品番号: {product.sku} | MOQ: {product.moq}個
        </div>
        {product.description && (
          <div className="mt-1 text-sm text-muted-foreground">
            {product.description}
          </div>
        )}
        {product.specs && (
          <div className="mt-1 text-sm">
            <div className="font-medium">仕様:</div>
            <div className="text-muted-foreground whitespace-pre-wrap">
              {product.specs}
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(true)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(product.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 