const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vmewhcmvcbjhxxmzumtm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZXdoY212Y2JqaHh4bXp1bXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NTU4NzQsImV4cCI6MjA1MDUzMTg3NH0.Ej_Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createShippingAddressesTable() {
  console.log('配送先テーブルを作成中...')
  
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      -- 配送先住所テーブルを作成
      CREATE TABLE IF NOT EXISTS shipping_addresses (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        company_name VARCHAR(200) NOT NULL,
        recipient_name VARCHAR(100) NOT NULL,
        recipient_phone VARCHAR(20) NOT NULL,
        postal_code VARCHAR(10) NOT NULL,
        prefecture VARCHAR(20) NOT NULL,
        city VARCHAR(50) NOT NULL,
        address1 VARCHAR(200) NOT NULL,
        address2 VARCHAR(200),
        is_default BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- インデックスを作成
      CREATE INDEX IF NOT EXISTS idx_shipping_addresses_user_id ON shipping_addresses(user_id);
      CREATE INDEX IF NOT EXISTS idx_shipping_addresses_is_default ON shipping_addresses(user_id, is_default) WHERE is_default = TRUE;

      -- RLSポリシーを設定
      ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;

      -- 既存のポリシーを削除（存在する場合）
      DROP POLICY IF EXISTS "Users can view their own shipping addresses" ON shipping_addresses;
      DROP POLICY IF EXISTS "Users can insert their own shipping addresses" ON shipping_addresses;
      DROP POLICY IF EXISTS "Users can update their own shipping addresses" ON shipping_addresses;
      DROP POLICY IF EXISTS "Users can delete their own shipping addresses" ON shipping_addresses;

      -- 新しいポリシーを作成
      CREATE POLICY "Users can view their own shipping addresses" ON shipping_addresses
        FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY "Users can insert their own shipping addresses" ON shipping_addresses
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "Users can update their own shipping addresses" ON shipping_addresses
        FOR UPDATE USING (auth.uid() = user_id);

      CREATE POLICY "Users can delete their own shipping addresses" ON shipping_addresses
        FOR DELETE USING (auth.uid() = user_id);

      -- updated_atを自動更新するトリガー
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_shipping_addresses_updated_at ON shipping_addresses;
      CREATE TRIGGER update_shipping_addresses_updated_at
        BEFORE UPDATE ON shipping_addresses
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `
  })

  if (error) {
    console.error('テーブル作成エラー:', error)
  } else {
    console.log('配送先テーブルが正常に作成されました')
  }
}

createShippingAddressesTable() 