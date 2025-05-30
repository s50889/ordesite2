-- 配送状況管理テーブル作成SQL
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

-- 3. 配送追跡履歴テーブル
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

-- 4. インデックス作成
CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipment_tracking_shipment_id ON shipment_tracking(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_tracking_occurred_at ON shipment_tracking(occurred_at);

-- 5. updated_atを自動更新するトリガー（shipments用）
DROP TRIGGER IF EXISTS update_shipments_updated_at ON shipments;
CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. updated_atを自動更新するトリガー（shipping_statuses用）
DROP TRIGGER IF EXISTS update_shipping_statuses_updated_at ON shipping_statuses;
CREATE TRIGGER update_shipping_statuses_updated_at
  BEFORE UPDATE ON shipping_statuses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. RLSポリシー設定
ALTER TABLE shipping_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_tracking ENABLE ROW LEVEL SECURITY;

-- 8. 管理者は全てのデータにアクセス可能
CREATE POLICY IF NOT EXISTS "Admin can manage all shipping statuses" ON shipping_statuses
  FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Admin can manage all shipments" ON shipments
  FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Admin can manage all shipment tracking" ON shipment_tracking
  FOR ALL USING (true);

-- 9. 配送ステータスの初期データ挿入
INSERT INTO shipping_statuses (status_code, status_name, description, sort_order) VALUES
  ('PENDING', '配送準備中', '注文確定後、配送準備を行っています', 1),
  ('PICKED', '商品ピッキング完了', '商品のピッキングが完了しました', 2),
  ('PACKED', '梱包完了', '商品の梱包が完了しました', 3),
  ('SHIPPED', '発送済み', '配送業者に商品を引き渡しました', 4),
  ('IN_TRANSIT', '配送中', '配送業者が配送中です', 5),
  ('OUT_FOR_DELIVERY', '配達中', 'お客様のお住まいに向けて配達中です', 6),
  ('DELIVERED', '配達完了', 'お客様に商品をお届けしました', 7),
  ('FAILED_DELIVERY', '配達失敗', '配達に失敗しました。再配達が必要です', 8),
  ('RETURNED', '返送', '商品が返送されました', 9)
ON CONFLICT (status_code) DO NOTHING; 