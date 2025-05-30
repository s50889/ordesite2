-- 注文テーブル（orders）の作成
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending',
  shipping_address jsonb NOT NULL,
  total_qty integer NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 注文明細テーブル（order_lines）の作成
CREATE TABLE IF NOT EXISTS public.order_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  quantity integer NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_requested_at ON public.orders(requested_at);
CREATE INDEX IF NOT EXISTS idx_order_lines_order_id ON public.order_lines(order_id);
CREATE INDEX IF NOT EXISTS idx_order_lines_product_id ON public.order_lines(product_id);

-- RLS（Row Level Security）の有効化
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_lines ENABLE ROW LEVEL SECURITY;

-- ordersテーブルのポリシー
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Users can insert their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = customer_id);

-- order_linesテーブルのポリシー
CREATE POLICY "Users can view their own order lines" ON public.order_lines
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_lines.order_id 
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own order lines" ON public.order_lines
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_lines.order_id 
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own order lines" ON public.order_lines
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_lines.order_id 
      AND orders.customer_id = auth.uid()
    )
  );

-- 管理者・営業担当者用のポリシー（全ての注文を閲覧・更新可能）
CREATE POLICY "Admin and sales can view all orders" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role IN ('admin', 'sales')
    )
  );

CREATE POLICY "Admin and sales can update all orders" ON public.orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role IN ('admin', 'sales')
    )
  );

CREATE POLICY "Admin and sales can view all order lines" ON public.order_lines
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role IN ('admin', 'sales')
    )
  );

CREATE POLICY "Admin and sales can update all order lines" ON public.order_lines
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role IN ('admin', 'sales')
    )
  );

-- updated_at自動更新のトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの作成
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_lines_updated_at BEFORE UPDATE ON public.order_lines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 