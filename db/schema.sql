-- Zain Delivery — Postgres schema (Supabase / Neon / Railway)
-- Run once in the SQL editor of your database provider.

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (
    status IN (
      'new',
      'confirmed',
      'preparing',
      'on_the_way',
      'delivered',
      'cancelled'
    )
  ),
  store_id TEXT NOT NULL,
  store_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  village TEXT NOT NULL,
  address TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal DOUBLE PRECISION NOT NULL,
  delivery_fee DOUBLE PRECISION NOT NULL,
  total DOUBLE PRECISION NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash'
);

CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);

CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_settings (id, data)
VALUES ('default', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
