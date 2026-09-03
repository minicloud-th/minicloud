-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  avatar_url text,
  balance numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- PRODUCTS
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price numeric(12,2) NOT NULL DEFAULT 0,
  image_url text,
  sold_count int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read products" ON public.products FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- STOCK
CREATE TABLE public.stock_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_sold boolean NOT NULL DEFAULT false,
  sold_at timestamptz,
  order_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_items TO authenticated;
GRANT ALL ON public.stock_items TO service_role;
ALTER TABLE public.stock_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage stock" ON public.stock_items FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.product_stock(_product_id uuid)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*)::int FROM public.stock_items WHERE product_id = _product_id AND is_sold = false
$$;
GRANT EXECUTE ON FUNCTION public.product_stock(uuid) TO anon, authenticated;

-- ORDERS
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  total numeric(12,2) NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  delivered_content text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own orders" ON public.orders FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- TRANSACTIONS
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  type text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own transactions" ON public.transactions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- TOPUP CODES
CREATE TABLE public.topup_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  amount numeric(12,2) NOT NULL,
  used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.topup_codes TO authenticated;
GRANT ALL ON public.topup_codes TO service_role;
ALTER TABLE public.topup_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage codes" ON public.topup_codes FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- REDEEM
CREATE OR REPLACE FUNCTION public.redeem_topup_code(_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _row public.topup_codes%ROWTYPE; _bal numeric;
BEGIN
  IF _uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'message', 'กรุณาเข้าสู่ระบบก่อน'); END IF;
  SELECT * INTO _row FROM public.topup_codes WHERE code = upper(trim(_code)) FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'message', 'ไม่พบโค้ดนี้'); END IF;
  IF _row.used_by IS NOT NULL THEN RETURN jsonb_build_object('ok', false, 'message', 'โค้ดนี้ถูกใช้ไปแล้ว'); END IF;
  UPDATE public.topup_codes SET used_by = _uid, used_at = now() WHERE id = _row.id;
  UPDATE public.profiles SET balance = balance + _row.amount WHERE id = _uid RETURNING balance INTO _bal;
  INSERT INTO public.transactions (user_id, amount, type, note) VALUES (_uid, _row.amount, 'topup', 'เติมเงินด้วยโค้ด ' || _row.code);
  RETURN jsonb_build_object('ok', true, 'message', 'เติมเงินสำเร็จ', 'amount', _row.amount, 'balance', _bal);
END; $$;
GRANT EXECUTE ON FUNCTION public.redeem_topup_code(text) TO authenticated;

-- PURCHASE
CREATE OR REPLACE FUNCTION public.purchase_product(_product_id uuid, _quantity int DEFAULT 1)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _p public.products%ROWTYPE; _bal numeric; _total numeric;
        _avail int; _items text; _order_id uuid;
BEGIN
  IF _uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'message', 'กรุณาเข้าสู่ระบบก่อน'); END IF;
  IF _quantity < 1 OR _quantity > 20 THEN RETURN jsonb_build_object('ok', false, 'message', 'จำนวนไม่ถูกต้อง'); END IF;
  SELECT * INTO _p FROM public.products WHERE id = _product_id AND is_active;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'message', 'ไม่พบสินค้านี้'); END IF;

  SELECT count(*) INTO _avail FROM public.stock_items WHERE product_id = _product_id AND is_sold = false;
  IF _avail < _quantity THEN RETURN jsonb_build_object('ok', false, 'message', 'สินค้าในคลังไม่พอ'); END IF;

  _total := _p.price * _quantity;
  SELECT balance INTO _bal FROM public.profiles WHERE id = _uid FOR UPDATE;
  IF _bal IS NULL OR _bal < _total THEN RETURN jsonb_build_object('ok', false, 'message', 'ยอดเงินไม่พอ กรุณาเติมเงิน'); END IF;

  INSERT INTO public.orders (user_id, product_id, product_name, quantity, total)
  VALUES (_uid, _p.id, _p.name, _quantity, _total) RETURNING id INTO _order_id;

  WITH picked AS (
    SELECT id FROM public.stock_items WHERE product_id = _product_id AND is_sold = false
    ORDER BY created_at LIMIT _quantity FOR UPDATE SKIP LOCKED
  ), upd AS (
    UPDATE public.stock_items s SET is_sold = true, sold_at = now(), order_id = _order_id
    FROM picked WHERE s.id = picked.id RETURNING s.content
  )
  SELECT string_agg(content, E'\n') INTO _items FROM upd;

  UPDATE public.orders SET delivered_content = _items WHERE id = _order_id;
  UPDATE public.products SET sold_count = sold_count + _quantity WHERE id = _p.id;
  UPDATE public.profiles SET balance = balance - _total WHERE id = _uid RETURNING balance INTO _bal;
  INSERT INTO public.transactions (user_id, amount, type, note) VALUES (_uid, -_total, 'purchase', 'ซื้อ ' || _p.name || ' x' || _quantity);

  RETURN jsonb_build_object('ok', true, 'message', 'สั่งซื้อสำเร็จ', 'order_id', _order_id, 'content', _items, 'balance', _bal);
END; $$;
GRANT EXECUTE ON FUNCTION public.purchase_product(uuid, int) TO authenticated;

-- SEED
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
  ('ไอเทม AFK', 'afk-items', 'ไอเทมสำหรับฟาร์ม AFK ในเกม Roblox', 1),
  ('สคริปต์ & ทูล', 'scripts', 'สคริปต์ช่วยเล่นและทูลต่างๆ', 2);

INSERT INTO public.products (category_id, name, description, price, sold_count)
SELECT c.id, v.name, v.description, v.price, v.sold FROM public.categories c
JOIN (VALUES
  ('afk-items','ดาบเมฆสายฟ้า','ไอเทมหายาก เพิ่มพลังโจมตี 250%', 99.00, 12),
  ('afk-items','สัตว์เลี้ยงเมฆน้อย','เพื่อนคู่ใจ ช่วยเก็บของอัตโนมัติ', 149.00, 8),
  ('scripts','สคริปต์ AFK Auto Farm','ฟาร์มอัตโนมัติ 24 ชม. อัปเดตฟรีตลอดชีพ', 199.00, 25),
  ('scripts','ทูลจัดการอินเวนทอรี','จัดของอัตโนมัติ ใช้ง่าย ปลอดภัย', 79.00, 5)
) AS v(slug,name,description,price,sold) ON v.slug = c.slug;

INSERT INTO public.stock_items (product_id, content)
SELECT p.id, 'KEY-' || upper(substr(md5(random()::text || p.id::text || g::text), 1, 12))
FROM public.products p, generate_series(1,10) g;