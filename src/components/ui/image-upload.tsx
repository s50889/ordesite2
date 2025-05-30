'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  disabled?: boolean
  maxSizeMB?: number
  folder?: string
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  maxSizeMB = 5,
  folder = 'products'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    // ファイルサイズチェック
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`ファイルサイズは${maxSizeMB}MB以下にしてください`)
      return
    }

    // ファイル形式チェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('JPEG、PNG、WebP、GIF形式のファイルのみアップロード可能です')
      return
    }

    setUploading(true)

    try {
      const supabase = createClient()
      
      // ファイル名を生成（タイムスタンプ + ランダム文字列）
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      // Supabase Storageにアップロード
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        toast.error('アップロードに失敗しました')
        return
      }

      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      onChange(publicUrl)
      toast.success('画像をアップロードしました')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('アップロードに失敗しました')
    } finally {
      setUploading(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleRemove = async () => {
    if (value && onRemove) {
      try {
        const supabase = createClient()
        
        // URLからファイルパスを抽出
        const url = new URL(value)
        const filePath = url.pathname.split('/').slice(-2).join('/')
        
        // Storageから削除
        await supabase.storage
          .from('product-images')
          .remove([filePath])
        
        onRemove()
        toast.success('画像を削除しました')
      } catch (error) {
        console.error('Remove error:', error)
        toast.error('画像の削除に失敗しました')
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">製品画像</div>
      
      {value ? (
        // 画像プレビュー
        <div className="relative group">
          <div className="relative w-48 h-48 mx-auto rounded-lg overflow-hidden border">
            <Image
              src={value}
              alt="アップロード済み画像"
              fill
              className="object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
            disabled={disabled || uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        // アップロードエリア
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled || uploading}
          />
          
          <div className="space-y-4">
            {uploading ? (
              <Loader2 className="h-12 w-12 mx-auto text-blue-500 animate-spin" />
            ) : (
              <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
            )}
            
            <div className="space-y-2">
              <div className="text-lg font-medium text-gray-900">
                {uploading ? 'アップロード中...' : '画像をアップロード'}
              </div>
              <div className="text-sm text-gray-500">
                ドラッグ&ドロップまたはクリックしてファイルを選択
              </div>
              <div className="text-xs text-gray-400">
                JPEG、PNG、WebP、GIF（最大{maxSizeMB}MB）
              </div>
              <div className="text-xs text-blue-600 font-medium">
                推奨：800x800px以上、1-3MB以下の正方形画像
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!value && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'アップロード中...' : 'ファイルを選択'}
        </Button>
      )}
    </div>
  )
} 