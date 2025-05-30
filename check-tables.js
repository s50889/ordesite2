const { createClient } = require('@supabase/supabase-js')

// 既存のコードから取得した設定
const supabaseUrl = 'https://vmewhcmvcbjhxxmzumtm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZXdoY212Y2JqaHh4bXp1bXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NTU4NzQsImV4cCI6MjA1MDUzMTg3NH0.Ej_Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  console.log('既存のテーブルを確認中...')
  
  // テーブル一覧を取得
  const { data: tables, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')

  if (error) {
    console.error('テーブル確認エラー:', error)
  } else {
    console.log('既存のテーブル:', tables.map(t => t.table_name))
  }

  // shipping_addressesテーブルが存在するかチェック
  const { data: shippingTable, error: shippingError } = await supabase
    .from('shipping_addresses')
    .select('*')
    .limit(1)

  if (shippingError) {
    console.log('shipping_addressesテーブルは存在しません:', shippingError.message)
  } else {
    console.log('shipping_addressesテーブルは既に存在します')
  }
}

checkTables() 