import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

export function createClient() {
  // 一時的なハードコード（実際の値に置き換えてください）
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vmewhcmvcbjhxxmzumtm.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZXdoY212Y2JqaHh4bXp1bXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwOTgxNjEsImV4cCI6MjA2MzY3NDE2MX0.22Uj7Hj3vu9ocqjN8qkVB9FLOafE3Idm6LXHyWcLnvE'

  if ((!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL_HERE') || 
      (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY_HERE')) {
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