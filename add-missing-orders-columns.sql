-- ordersテーブルに不足している列を追加

-- total_qty列を追加
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS total_qty integer NOT NULL DEFAULT 0;

-- shipping_address列を追加（JSONB型）
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipping_address jsonb;

-- status列を追加
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

-- customer_id列を追加
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES auth.users(id);

-- created_at列を追加
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- updated_at列を追加
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- インデックスを追加
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- RLS（Row Level Security）の有効化
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ポリシーの作成（既存のポリシーがある場合はスキップされる）
DO $$
BEGIN
    -- ユーザーが自分の注文を閲覧できるポリシー
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' 
        AND policyname = 'Users can view their own orders'
    ) THEN
        CREATE POLICY "Users can view their own orders" ON public.orders
        FOR SELECT USING (auth.uid() = customer_id);
    END IF;

    -- ユーザーが自分の注文を作成できるポリシー
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' 
        AND policyname = 'Users can insert their own orders'
    ) THEN
        CREATE POLICY "Users can insert their own orders" ON public.orders
        FOR INSERT WITH CHECK (auth.uid() = customer_id);
    END IF;

    -- 管理者・営業が全ての注文を閲覧できるポリシー
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' 
        AND policyname = 'Admin and sales can view all orders'
    ) THEN
        CREATE POLICY "Admin and sales can view all orders" ON public.orders
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.user_profiles 
                WHERE user_profiles.id = auth.uid() 
                AND user_profiles.role IN ('admin', 'sales')
            )
        );
    END IF;
END $$; 