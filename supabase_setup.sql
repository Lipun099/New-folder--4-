-- ─── Menu Items ───────────────────────────────────────────────
CREATE TABLE menu_items (
  id          UUID  DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT  NOT NULL,
  category    TEXT  NOT NULL,
  price       INTEGER NOT NULL,
  emoji       TEXT  DEFAULT '🍽️',
  image       TEXT  DEFAULT '',
  tag         TEXT  DEFAULT '',
  available   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Allow public read (customers see the menu)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read menu" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Service full access menu" ON menu_items USING (true) WITH CHECK (true);

-- ─── Orders ───────────────────────────────────────────────────
CREATE SEQUENCE order_token_seq START 1;

CREATE TABLE orders (
  id            UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  token_number  INTEGER DEFAULT nextval('order_token_seq'),
  customer_name TEXT    NOT NULL,
  table_number  TEXT    NOT NULL,
  order_type    TEXT    DEFAULT 'dine-in',
  items         JSONB   NOT NULL,
  total_amount  INTEGER NOT NULL,
  note          TEXT    DEFAULT '',
  status        TEXT    DEFAULT 'pending',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Allow service role full access
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service full access orders" ON orders USING (true) WITH CHECK (true);

-- ─── Seed Menu Items ──────────────────────────────────────────
INSERT INTO menu_items (name, category, price, emoji, image, tag) VALUES
  ('Tea',             'Hot Beverages', 30,  '🍵', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&q=80', ''),
  ('Lemon Tea',       'Hot Beverages', 35,  '🍋', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&q=80', 'Refreshing'),
  ('Green Tea',       'Hot Beverages', 40,  '🍃', 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=300&q=80', 'Healthy'),
  ('Hot Coffee',      'Hot Beverages', 50,  '☕', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=80', ''),
  ('Black Coffee',    'Hot Beverages', 45,  '☕', 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=300&q=80', 'Strong'),
  ('Americano',       'Coffee',        120, '☕', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&q=80', ''),
  ('Cappuccino',      'Coffee',        140, '☕', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&q=80', 'Popular'),
  ('Cafe Latte',      'Coffee',        150, '☕', 'https://images.unsplash.com/photo-1561882468-9110d70c0f15?w=300&q=80', 'Chef''s Choice'),
  ('Cold Coffee',     'Coffee',        120, '🧊', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&q=80', ''),
  ('Hazelnut Coffee', 'Coffee',        160, '☕', 'https://images.unsplash.com/photo-1485808191679-5f86510bd9d4?w=300&q=80', 'Special'),
  ('Cold Coffee',     'Cold Beverages',120, '🧋', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&q=80', ''),
  ('Oreo Shake',      'Cold Beverages',150, '🍦', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&q=80', 'Fan Fav'),
  ('KitKat Shake',    'Cold Beverages',160, '🍫', 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=300&q=80', ''),
  ('Chocolate Shake', 'Cold Beverages',140, '🍫', 'https://images.unsplash.com/photo-1619158401201-8b8fd7f466f7?w=300&q=80', ''),
  ('Mango Shake',     'Cold Beverages',130, '🥭', 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=300&q=80', 'Seasonal'),
  ('Bun Maska',       'Bites & Delights', 40,  '🥐', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=80', ''),
  ('French Fries',    'Bites & Delights', 80,  '🍟', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&q=80', ''),
  ('Peri Peri Fries', 'Bites & Delights', 90,  '🌶️','https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=300&q=80', 'Spicy'),
  ('Vegetable Maggi', 'Bites & Delights', 60,  '🍜', 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=300&q=80', ''),
  ('Paneer Maggi',    'Bites & Delights', 80,  '🍜', 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=300&q=80', 'Popular'),
  ('Red Sauce Pasta', 'Bites & Delights', 130, '🍝', 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=300&q=80', ''),
  ('White Sauce Pasta','Bites & Delights',130, '🍝', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=300&q=80', ''),
  ('Corn Sandwich',   'Bites & Delights', 90,  '🥪', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&q=80', ''),
  ('Veg Sandwich',    'Bites & Delights', 80,  '🥪', 'https://images.unsplash.com/photo-1481070414801-51fd732d7184?w=300&q=80', ''),
  ('Paneer Sandwich', 'Bites & Delights', 100, '🥪', 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=300&q=80', 'New'),
  ('Veg Nuggets',     'Bites & Delights', 100, '🍗', 'https://images.unsplash.com/photo-1562967914-608f82629710?w=300&q=80', ''),
  ('Cheesy Shots',    'Bites & Delights', 110, '🧀', 'https://images.unsplash.com/photo-1548340748-6ca50f408cb8?w=300&q=80', 'Cheesy'),
  ('Popcorn',         'Bites & Delights', 60,  '🍿', 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=300&q=80', '');
