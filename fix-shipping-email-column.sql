-- shipping_email列の問題を修正

-- 1. shipping_email列のNOT NULL制約を削除
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'shipping_email'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.orders ALTER COLUMN shipping_email DROP NOT NULL;
        ALTER TABLE public.orders ALTER COLUMN shipping_email SET DEFAULT '';
    END IF;
END $$;

-- 2. shipping_email列が存在しない場合は追加
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_email text; 