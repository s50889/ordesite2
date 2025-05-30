-- ordersテーブルの完全な構造修正

-- 1. 既存のshipping_name列のNOT NULL制約を削除
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'shipping_name'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.orders ALTER COLUMN shipping_name DROP NOT NULL;
        ALTER TABLE public.orders ALTER COLUMN shipping_name SET DEFAULT '';
    END IF;
END $$;

-- 2. 必要な列を追加（存在しない場合のみ）
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_company text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_phone text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_postal_code text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_prefecture text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_city text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address1 text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address2 text;

-- 3. 基本的な注文関連列も追加（存在しない場合のみ）
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES auth.users(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_qty integer NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS requested_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- 4. インデックスを追加
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_requested_at ON public.orders(requested_at);

-- 5. RLSを有効化
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 6. ポリシーを作成（存在しない場合のみ）
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

    -- 管理者・営業が全ての注文を更新できるポリシー
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' 
        AND policyname = 'Admin and sales can update all orders'
    ) THEN
        CREATE POLICY "Admin and sales can update all orders" ON public.orders
        FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM public.user_profiles 
                WHERE user_profiles.id = auth.uid() 
                AND user_profiles.role IN ('admin', 'sales')
            )
        );
    END IF;
END $$;

-- 7. order_linesテーブルも確認・作成
CREATE TABLE IF NOT EXISTS public.order_lines (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id),
    quantity integer NOT NULL DEFAULT 1,
    note text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 8. order_linesのインデックス
CREATE INDEX IF NOT EXISTS idx_order_lines_order_id ON public.order_lines(order_id);
CREATE INDEX IF NOT EXISTS idx_order_lines_product_id ON public.order_lines(product_id);

-- 9. order_linesのRLS
ALTER TABLE public.order_lines ENABLE ROW LEVEL SECURITY;

-- 10. order_linesのポリシー
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'order_lines' 
        AND policyname = 'Users can view their own order lines'
    ) THEN
        CREATE POLICY "Users can view their own order lines" ON public.order_lines
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.orders 
                WHERE orders.id = order_lines.order_id 
                AND orders.customer_id = auth.uid()
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'order_lines' 
        AND policyname = 'Users can insert their own order lines'
    ) THEN
        CREATE POLICY "Users can insert their own order lines" ON public.order_lines
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.orders 
                WHERE orders.id = order_lines.order_id 
                AND orders.customer_id = auth.uid()
            )
        );
    END IF;
END $$; 