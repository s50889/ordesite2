CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_important BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 更新日時を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE
    ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- サンプルデータを挿入
INSERT INTO announcements (title, content, is_important, is_active) VALUES
('年末年始休業のお知らせ', '誠に勝手ながら、12月29日（金）から1月3日（水）まで年末年始休業とさせていただきます。', true, true),
('新製品のご案内', '高性能工業用ガス分析装置の取り扱いを開始いたしました。詳細はお問い合わせください。', false, true),
('配送料金改定のお知らせ', '2024年4月1日より、配送料金を改定させていただきます。詳細は別途ご案内いたします。', false, true); 