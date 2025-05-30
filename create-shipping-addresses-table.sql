-- 配送先住所テーブル作成SQL
-- Supabase Dashboard > SQL Editor で実行してください

-- 配送先住所テーブル
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

-- updated_atを自動更新するトリガー
DROP TRIGGER IF EXISTS update_shipping_addresses_updated_at ON shipping_addresses;
CREATE TRIGGER update_shipping_addresses_updated_at
  BEFORE UPDATE ON shipping_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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