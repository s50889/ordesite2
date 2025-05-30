-- ordersテーブルにrequested_at列を追加
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS requested_at timestamptz NOT NULL DEFAULT now();

-- インデックスを追加
CREATE INDEX IF NOT EXISTS idx_orders_requested_at ON public.orders(requested_at);

-- 既存のレコードがある場合、requested_atをcreated_atと同じ値に設定
UPDATE public.orders 
SET requested_at = created_at 
WHERE requested_at IS NULL; 