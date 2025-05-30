-- 既存のordersテーブル構造を確認し、必要な列を追加

-- shipping_name列がNOT NULL制約を持っている場合、デフォルト値を設定
ALTER TABLE public.orders 
ALTER COLUMN shipping_name DROP NOT NULL;

-- または、shipping_name列にデフォルト値を設定
ALTER TABLE public.orders 
ALTER COLUMN shipping_name SET DEFAULT '';

-- 他の配送関連列も追加（存在しない場合）
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipping_company text;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipping_phone text;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipping_postal_code text;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipping_prefecture text;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipping_city text;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipping_address1 text;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipping_address2 text;

-- 既存のshipping_address JSONB列は残しつつ、個別列も使用可能にする
-- これにより、既存のコードと新しいコードの両方に対応 