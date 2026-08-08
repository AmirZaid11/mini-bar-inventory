-- Database Schema for Amir Stock Manager

-- Drop tables if they exist
drop table if exists transactions;
drop table if exists items;

-- Create items table
create table items (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text,
  quantity integer not null default 0,
  min_stock_level integer not null default 5,
  unit text default 'pcs',
  notes text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create transactions table
create table transactions (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references items(id) on delete cascade,
  type text check (type in ('in', 'out')),
  quantity integer not null,
  reason text,
  notes text,
  created_at timestamptz default now()
);

-- Enable RLS (optional, but let's make it simple. We can access via service role or anon key. 
-- Since we are doing direct client-side reads/writes once authenticated, we can enable RLS or 
-- disable it. To make setup as robust and bulletproof as possible for the user without 
-- requiring complex Supabase policy configurations, we can write simple policy or leave RLS disabled.)
-- Let's leave RLS disabled for public read/write if they want to access it directly, or write a policy 
-- that allows all operations for simplicity, or just not enable RLS. By default, new tables in Supabase 
-- have RLS disabled unless explicitly enabled, which is perfect for this simple prototype.
