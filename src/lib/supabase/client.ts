import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Build時やサーバーサイドで環境変数が利用できない場合の処理
    if (typeof window === 'undefined') {
      // サーバーサイドの場合、ダミーのクライアントを返す
      return null as any
    }
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.'
    )
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
} 