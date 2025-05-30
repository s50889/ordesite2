-- order_linesテーブルに不足している列を追加

-- order_linesテーブルが存在しない場合は作成
CREATE TABLE IF NOT EXISTS public.order_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid()
);

-- 必要な列を追加
ALTER TABLE public.order_lines 
ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE;

ALTER TABLE public.order_lines 
ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id);

ALTER TABLE public.order_lines 
ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1;

ALTER TABLE public.order_lines 
ADD COLUMN IF NOT EXISTS note text;

ALTER TABLE public.order_lines 
ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.order_lines 
ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- インデックスを追加
CREATE INDEX IF NOT EXISTS idx_order_lines_order_id ON public.order_lines(order_id);
CREATE INDEX IF NOT EXISTS idx_order_lines_product_id ON public.order_lines(product_id);

-- RLS（Row Level Security）の有効化
ALTER TABLE public.order_lines ENABLE ROW LEVEL SECURITY;

-- ポリシーの作成
DO $$
BEGIN
    -- ユーザーが自分の注文明細を閲覧できるポリシー
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

    -- ユーザーが自分の注文明細を作成できるポリシー
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