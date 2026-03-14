-- =============================================
-- ZUKI — Initial Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- PROFILES (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid references auth.users primary key,
  role text check (role in ('admin', 'baker', 'client')),
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz default now()
);

-- BAKERIES
CREATE TABLE IF NOT EXISTS bakeries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id),
  name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  cover_url text,
  status text default 'pending' check (status in ('pending', 'approved', 'suspended')),
  deposit_percent integer default 50,
  min_notice_hours integer default 48,
  rush_order_enabled boolean default false,
  rush_fee_zmw numeric default 0,
  delivery_option text default 'pickup' check (delivery_option in ('pickup', 'delivery', 'both')),
  delivery_fee_zmw numeric default 0,
  max_orders_per_day integer default 10,
  accepts_airtel boolean default true,
  accepts_mtn boolean default true,
  accepts_zamtel boolean default false,
  accepts_bank boolean default false,
  airtel_number text,
  mtn_number text,
  zamtel_number text,
  bank_name text,
  bank_account_name text,
  bank_account_number text,
  whatsapp_number text,
  refund_policy_enabled boolean default false,
  refund_policy_text text,
  created_at timestamptz default now()
);

-- BAKERY BLOCKED DATES
CREATE TABLE IF NOT EXISTS bakery_blocked_dates (
  id uuid primary key default gen_random_uuid(),
  bakery_id uuid references bakeries(id) on delete cascade,
  blocked_date date not null
);

-- MENU ITEMS
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid primary key default gen_random_uuid(),
  bakery_id uuid references bakeries(id) on delete cascade,
  name text not null,
  description text,
  base_price_zmw numeric not null,
  image_url text,
  is_available boolean default true,
  flavor_options jsonb default '[]',
  filling_options jsonb default '[]',
  frosting_options jsonb default '[]',
  size_options jsonb default '[]',
  tier_options jsonb default '[]',
  created_at timestamptz default now()
);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  bakery_id uuid references bakeries(id),
  client_id uuid references profiles(id),
  menu_item_id uuid references menu_items(id),
  selected_flavor text,
  selected_filling text,
  selected_frosting text,
  selected_size text,
  selected_tiers text,
  custom_description text,
  special_instructions text,
  occasion text,
  dedication_message text,
  pickup_or_delivery text check (pickup_or_delivery in ('pickup', 'delivery')),
  delivery_address text,
  requested_date date not null,
  pickup_time time,
  is_rush_order boolean default false,
  base_price_zmw numeric not null,
  rush_fee_zmw numeric default 0,
  delivery_fee_zmw numeric default 0,
  total_price_zmw numeric not null,
  deposit_amount_zmw numeric not null,
  balance_amount_zmw numeric not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'in_progress', 'ready', 'collected', 'cancelled')),
  created_at timestamptz default now(),
  confirmed_at timestamptz,
  ready_at timestamptz,
  collected_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text
);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  payment_type text check (payment_type in ('deposit', 'balance', 'full')),
  method text check (method in ('airtel', 'mtn', 'zamtel', 'bank_transfer')),
  amount_zmw numeric not null,
  status text default 'pending' check (status in ('pending', 'proof_submitted', 'confirmed', 'failed')),
  transaction_reference text,
  confirmed_by uuid references profiles(id),
  confirmed_at timestamptz,
  gateway_transaction_id text,
  gateway_response jsonb,
  created_at timestamptz default now()
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  sender_id uuid references profiles(id),
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) unique,
  bakery_id uuid references bakeries(id),
  client_id uuid references profiles(id),
  rating integer check (rating between 1 and 5),
  comment text,
  baker_reply text,
  baker_replied_at timestamptz,
  created_at timestamptz default now()
);

-- AI SESSIONS
CREATE TABLE IF NOT EXISTS ai_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  messages jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  body text not null,
  is_read boolean default false,
  link text,
  created_at timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bakeries ENABLE ROW LEVEL SECURITY;
ALTER TABLE bakery_blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Bakeries policies
CREATE POLICY "Public can view approved bakeries" ON bakeries FOR SELECT USING (status = 'approved');
CREATE POLICY "Owners can view own bakery" ON bakeries FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners can update own bakery" ON bakeries FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Authenticated can create bakery" ON bakeries FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Bakery blocked dates
CREATE POLICY "Public can view blocked dates" ON bakery_blocked_dates FOR SELECT USING (true);
CREATE POLICY "Bakers can manage own blocked dates" ON bakery_blocked_dates FOR ALL USING (
  auth.uid() = (SELECT owner_id FROM bakeries WHERE id = bakery_id)
);

-- Menu items policies
CREATE POLICY "Public can view available menu items" ON menu_items FOR SELECT USING (is_available = true);
CREATE POLICY "Baker can view all own menu items" ON menu_items FOR SELECT USING (
  auth.uid() = (SELECT owner_id FROM bakeries WHERE id = bakery_id)
);
CREATE POLICY "Baker can manage own menu items" ON menu_items FOR ALL USING (
  auth.uid() = (SELECT owner_id FROM bakeries WHERE id = bakery_id)
);

-- Orders policies
CREATE POLICY "Clients can view own orders" ON orders FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Bakers can view bakery orders" ON orders FOR SELECT USING (
  auth.uid() = (SELECT owner_id FROM bakeries WHERE id = bakery_id)
);
CREATE POLICY "Bakers can update bakery orders" ON orders FOR UPDATE USING (
  auth.uid() = (SELECT owner_id FROM bakeries WHERE id = bakery_id)
);

-- Payments policies
CREATE POLICY "Clients can create payments" ON payments FOR INSERT WITH CHECK (
  auth.uid() = (SELECT client_id FROM orders WHERE id = order_id)
);
CREATE POLICY "Order participants can view payments" ON payments FOR SELECT USING (
  auth.uid() = (SELECT client_id FROM orders WHERE id = order_id) OR
  auth.uid() = (SELECT owner_id FROM bakeries WHERE id = (SELECT bakery_id FROM orders WHERE id = order_id))
);
CREATE POLICY "Clients can update own payments" ON payments FOR UPDATE USING (
  auth.uid() = (SELECT client_id FROM orders WHERE id = order_id)
);
CREATE POLICY "Bakers can confirm payments" ON payments FOR UPDATE USING (
  auth.uid() = (SELECT owner_id FROM bakeries WHERE id = (SELECT bakery_id FROM orders WHERE id = order_id))
);

-- Messages policies
CREATE POLICY "Order participants can read messages" ON messages FOR SELECT USING (
  auth.uid() = (SELECT client_id FROM orders WHERE id = order_id) OR
  auth.uid() = (SELECT owner_id FROM bakeries WHERE id = (SELECT bakery_id FROM orders WHERE id = order_id))
);
CREATE POLICY "Order participants can send messages" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND (
    auth.uid() = (SELECT client_id FROM orders WHERE id = order_id) OR
    auth.uid() = (SELECT owner_id FROM bakeries WHERE id = (SELECT bakery_id FROM orders WHERE id = order_id))
  )
);
CREATE POLICY "Order participants can update read status" ON messages FOR UPDATE USING (
  auth.uid() = (SELECT client_id FROM orders WHERE id = order_id) OR
  auth.uid() = (SELECT owner_id FROM bakeries WHERE id = (SELECT bakery_id FROM orders WHERE id = order_id))
);

-- Reviews policies
CREATE POLICY "Public can read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Clients can leave review on collected order" ON reviews FOR INSERT WITH CHECK (
  auth.uid() = client_id AND
  (SELECT status FROM orders WHERE id = order_id) = 'collected'
);
CREATE POLICY "Bakers can reply to reviews" ON reviews FOR UPDATE USING (
  auth.uid() = (SELECT owner_id FROM bakeries WHERE id = bakery_id)
);

-- AI sessions
CREATE POLICY "Users manage own AI sessions" ON ai_sessions FOR ALL USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

-- =============================================
-- REALTIME
-- =============================================
-- Enable realtime in Supabase Dashboard → Database → Replication
-- Enable for: messages, orders, notifications

-- =============================================
-- STORAGE BUCKETS
-- =============================================
-- Create in Supabase Dashboard → Storage:
-- 1. "bakery-assets" (public: true, max: 10MB)
-- 2. "generated-pdfs" (public: false, max: 20MB)

-- =============================================
-- AUTO-CREATE PROFILE ON SIGNUP TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, phone)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'role', 'client'),
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
