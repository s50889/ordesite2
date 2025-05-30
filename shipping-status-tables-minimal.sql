-- 配送状況管理テーブル作成SQL（最小限版）
-- Supabase Dashboard > SQL Editor で実行してください

-- 1. 配送ステータスマスタテーブル
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

-- 2. 配送情報テーブル
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  current_status_id INTEGER REFERENCES shipping_statuses(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. インデックス作成
CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON shipments(order_id);

-- 4. updated_atを自動更新するトリガー（shipments用）
DROP TRIGGER IF EXISTS update_shipments_updated_at ON shipments;
CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. updated_atを自動更新するトリガー（shipping_statuses用）
DROP TRIGGER IF EXISTS update_shipping_statuses_updated_at ON shipping_statuses;
CREATE TRIGGER update_shipping_statuses_updated_at
  BEFORE UPDATE ON shipping_statuses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. RLSポリシー設定
ALTER TABLE shipping_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

-- 7. 管理者は全てのデータにアクセス可能
DROP POLICY IF EXISTS "Admin can manage all shipping statuses" ON shipping_statuses;
CREATE POLICY "Admin can manage all shipping statuses" ON shipping_statuses
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin can manage all shipments" ON shipments;
CREATE POLICY "Admin can manage all shipments" ON shipments
  FOR ALL USING (true);

-- 8. 配送ステータスの初期データ挿入
INSERT INTO shipping_statuses (status_code, status_name, description, sort_order) VALUES
  ('PENDING', '配送準備中', '注文確定後、配送準備を行っています', 1),
  ('OUT_FOR_DELIVERY', '配達中', 'お客様のお住まいに向けて配達中です', 2),
  ('DELIVERED', '配達完了', 'お客様に商品をお届けしました', 3)
ON CONFLICT (status_code) DO NOTHING; 