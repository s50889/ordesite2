const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vmewhcmvcbjhxxmzumtm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZXdoY212Y2JqaHh4bXp1bXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODA5ODE2MSwiZXhwIjoyMDYzNjc0MTYxfQ.KYb7OWYN1OK7SDG79k9c6SbhO_3Hf8w_Ck_joBmJSW4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createShippingStatusTables() {
  console.log('配送状況管理テーブルを作成中...')
  
  try {
    // 1. 配送ステータスマスタテーブル作成
    console.log('1. shipping_statuses テーブルを作成中...')
    const { error: statusError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS shipping_statuses (
          id SERIAL PRIMARY KEY,
          status_code VARCHAR(50) UNIQUE NOT NULL,
          status_name VARCHAR(100) NOT NULL,
          description TEXT,
          sort_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (statusError) {
      console.log('shipping_statuses テーブル作成をスキップ（既に存在する可能性）:', statusError.message)
    } else {
      console.log('shipping_statuses テーブルが作成されました')
    }

    // 2. 配送情報テーブル作成
    console.log('2. shipments テーブルを作成中...')
    const { error: shipmentsError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS shipments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          tracking_number VARCHAR(100),
          carrier_name VARCHAR(100),
          carrier_code VARCHAR(50),
          shipping_method VARCHAR(100),
          estimated_delivery_date DATE,
          actual_delivery_date DATE,
          current_status_id INTEGER REFERENCES shipping_statuses(id),
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (shipmentsError) {
      console.log('shipments テーブル作成をスキップ（既に存在する可能性）:', shipmentsError.message)
    } else {
      console.log('shipments テーブルが作成されました')
    }

    // 3. 配送追跡履歴テーブル作成
    console.log('3. shipment_tracking テーブルを作成中...')
    const { error: trackingError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS shipment_tracking (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
          status_id INTEGER NOT NULL REFERENCES shipping_statuses(id),
          location VARCHAR(200),
          description TEXT,
          occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_by UUID REFERENCES user_profiles(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (trackingError) {
      console.log('shipment_tracking テーブル作成をスキップ（既に存在する可能性）:', trackingError.message)
    } else {
      console.log('shipment_tracking テーブルが作成されました')
    }

    // 4. 初期データ挿入
    console.log('4. 初期配送ステータスを挿入中...')
    const { error: insertError } = await supabase
      .from('shipping_statuses')
      .upsert([
        { status_code: 'PENDING', status_name: '配送準備中', description: '注文確定後、配送準備を行っています', sort_order: 1 },
        { status_code: 'PICKED', status_name: '商品ピッキング完了', description: '商品のピッキングが完了しました', sort_order: 2 },
        { status_code: 'PACKED', status_name: '梱包完了', description: '商品の梱包が完了しました', sort_order: 3 },
        { status_code: 'SHIPPED', status_name: '発送済み', description: '配送業者に商品を引き渡しました', sort_order: 4 },
        { status_code: 'IN_TRANSIT', status_name: '配送中', description: '配送業者が配送中です', sort_order: 5 },
        { status_code: 'OUT_FOR_DELIVERY', status_name: '配達中', description: 'お客様のお住まいに向けて配達中です', sort_order: 6 },
        { status_code: 'DELIVERED', status_name: '配達完了', description: 'お客様に商品をお届けしました', sort_order: 7 },
        { status_code: 'FAILED_DELIVERY', status_name: '配達失敗', description: '配達に失敗しました。再配達が必要です', sort_order: 8 },
        { status_code: 'RETURNED', status_name: '返送', description: '商品が返送されました', sort_order: 9 }
      ], { 
        onConflict: 'status_code',
        ignoreDuplicates: true 
      })

    if (insertError) {
      console.error('初期データ挿入エラー:', insertError)
    } else {
      console.log('初期配送ステータスが挿入されました')
    }

    console.log('✅ 配送状況管理テーブルの作成が完了しました！')

  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
  }
}

createShippingStatusTables() 