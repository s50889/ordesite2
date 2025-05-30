import { createClient } from '@/lib/supabase/client'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * 画像をSupabase Storageにアップロードする
 * @param file アップロードするファイル
 * @param bucket バケット名（デフォルト: 'product-images'）
 * @param folder フォルダ名（オプション）
 * @returns アップロード結果
 */
export async function uploadImage(
  file: File,
  bucket: string = 'product-images',
  folder?: string
): Promise<UploadResult> {
  try {
    const supabase = createClient()

    // ファイル名を生成（タイムスタンプ + ランダム文字列 + 元のファイル名）
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}_${randomString}.${fileExtension}`
    
    // フォルダがある場合はパスに含める
    const filePath = folder ? `${folder}/${fileName}` : fileName

    // ファイルをアップロード
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('アップロードエラー:', error)
      return {
        success: false,
        error: `アップロードに失敗しました: ${error.message}`
      }
    }

    // 公開URLを取得
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      success: true,
      url: urlData.publicUrl
    }
  } catch (error) {
    console.error('予期しないエラー:', error)
    return {
      success: false,
      error: '予期しないエラーが発生しました'
    }
  }
}

/**
 * 画像を削除する
 * @param url 削除する画像のURL
 * @param bucket バケット名（デフォルト: 'product-images'）
 * @returns 削除結果
 */
export async function deleteImage(
  url: string,
  bucket: string = 'product-images'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    // URLからファイルパスを抽出
    const urlParts = url.split('/')
    const bucketIndex = urlParts.findIndex(part => part === bucket)
    if (bucketIndex === -1) {
      return {
        success: false,
        error: '無効なURLです'
      }
    }

    const filePath = urlParts.slice(bucketIndex + 1).join('/')

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      console.error('削除エラー:', error)
      return {
        success: false,
        error: `削除に失敗しました: ${error.message}`
      }
    }

    return { success: true }
  } catch (error) {
    console.error('予期しないエラー:', error)
    return {
      success: false,
      error: '予期しないエラーが発生しました'
    }
  }
}

/**
 * ファイルサイズをチェックする
 * @param file チェックするファイル
 * @param maxSizeMB 最大サイズ（MB）
 * @returns サイズが有効かどうか
 */
export function validateFileSize(file: File, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

/**
 * ファイルタイプをチェックする
 * @param file チェックするファイル
 * @param allowedTypes 許可されるファイルタイプ
 * @returns タイプが有効かどうか
 */
export function validateFileType(
  file: File,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
): boolean {
  return allowedTypes.includes(file.type)
} 