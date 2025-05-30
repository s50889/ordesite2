const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vmewhcmvcbjhxxmzumtm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZXdoY212Y2JqaHh4bXp1bXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODA5ODE2MSwiZXhwIjoyMDYzNjc0MTYxfQ.KYb7OWYN1OK7SDG79k9c6SbhO_3Hf8w_Ck_joBmJSW4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createShippingStatusTable() {
  console.log('配送ステータステーブルを作成中...')
  
  try {
    // まず配送ステータスの初期データを直接挿入してみる
    const { data, error } = await supabase
      .from('shipping_statuses')
      .insert([
        { status_code: 'PENDING', status_name: '配送準備中', description: '注文確定後、配送準備を行っています', sort_order: 1 }
      ])

    if (error) {
      console.log('テーブルが存在しないため作成が必要です:', error.message)
      console.log('Supabase Dashboard で以下のSQLを実行してください:')
      console.log('shipping-status-tables.sql ファイルの内容をコピーして実行してください')
    } else {
      console.log('テーブルは既に存在し、データが挿入されました:', data)
    }

  } catch (error) {
    console.error('エラー:', error)
  }
}

createShippingStatusTable() 