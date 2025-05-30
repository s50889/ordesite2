-- お知らせテーブルの作成
CREATE TABLE announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'important', 'product', 'maintenance')),
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0 CHECK (priority >= 0 AND priority <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- インデックスの作成
CREATE INDEX idx_announcements_is_active ON announcements(is_active);
CREATE INDEX idx_announcements_priority ON announcements(priority DESC);
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX idx_announcements_type ON announcements(type);

-- RLS (Row Level Security) の有効化
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 管理者のみが全てのお知らせを操作できるポリシー
CREATE POLICY "管理者はお知らせを全て操作可能" ON announcements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- 一般ユーザーは公開されたお知らせのみ閲覧可能
CREATE POLICY "一般ユーザーは公開お知らせのみ閲覧可能" ON announcements
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- 匿名ユーザーも公開されたお知らせを閲覧可能
CREATE POLICY "匿名ユーザーは公開お知らせのみ閲覧可能" ON announcements
  FOR SELECT
  TO anon
  USING (is_active = true);

-- updated_at を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 自動更新トリガー
CREATE TRIGGER update_announcements_updated_at 
  BEFORE UPDATE ON announcements 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- サンプルデータの挿入
INSERT INTO announcements (title, content, type, is_active, priority, created_by) VALUES
('年末年始休業のお知らせ', '誠に勝手ながら、12月29日（金）から1月3日（水）まで年末年始休業とさせていただきます。', 'important', true, 1, (SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1)),
('新製品ラインナップ追加のお知らせ', '高精度測定機器の新シリーズを追加いたしました。詳細は製品カタログをご確認ください。', 'product', true, 0, (SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1)),
('システムメンテナンスのお知らせ', '1月20日（土）2:00-6:00にシステムメンテナンスを実施いたします。', 'maintenance', true, 0, (SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1));

-- お知らせ一覧取得用のビュー（公開されたもののみ、優先度順）
CREATE VIEW public_announcements AS
SELECT 
  id,
  title,
  content,
  type,
  priority,
  created_at,
  updated_at
FROM announcements 
WHERE is_active = true 
ORDER BY priority DESC, created_at DESC;

-- 管理者用のお知らせ一覧取得用のビュー（全て、優先度順）
CREATE VIEW admin_announcements AS
SELECT 
  a.id,
  a.title,
  a.content,
  a.type,
  a.is_active,
  a.priority,
  a.created_at,
  a.updated_at,
  u.email as created_by_email
FROM announcements a
LEFT JOIN auth.users u ON a.created_by = u.id
ORDER BY a.priority DESC, a.created_at DESC; 