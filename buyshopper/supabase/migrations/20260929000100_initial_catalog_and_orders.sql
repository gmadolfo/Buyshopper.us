-- Initial BuyShopper data model. This migration intentionally enables no client writes.

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(btrim(name)) between 1 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null check (length(btrim(name)) between 1 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text not null default '',
  price numeric(12, 2) not null check (price >= 0),
  compare_at_price numeric(12, 2) check (compare_at_price is null or compare_at_price >= price),
  currency char(3) not null default 'USD' check (currency = 'USD'),
  color text not null default '#e5e2d9' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  image_url text not null,
  badge text,
  rating numeric(2, 1) not null default 0 check (rating between 0 and 5),
  review_count integer not null default 0 check (review_count >= 0),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_active_category_name_idx
  on public.products (category_id, name)
  where is_active = true;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'pending',
  currency char(3) not null default 'USD' check (currency = 'USD'),
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_created_idx
  on public.orders (user_id, created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_idx on public.order_items (order_id);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- The public catalog is read-only. Product rows are visible only while active.
drop policy if exists "Anyone can read active categories" on public.categories;
create policy "Anyone can read active categories"
  on public.categories for select to anon, authenticated
  using (is_active = true);

drop policy if exists "Anyone can read active products" on public.products;
create policy "Anyone can read active products"
  on public.products for select to anon, authenticated
  using (is_active = true);

-- Reserved for a future authenticated order flow; there are intentionally no
-- INSERT, UPDATE, or DELETE policies for orders or order_items.
drop policy if exists "Users can read their own orders" on public.orders;
create policy "Users can read their own orders"
  on public.orders for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can read their own order items" on public.order_items;
create policy "Users can read their own order items"
  on public.order_items for select to authenticated
  using (
    exists (
      select 1
      from public.orders
      where public.orders.id = order_items.order_id
        and public.orders.user_id = (select auth.uid())
    )
  );

-- Do not rely only on RLS: remove client-side write privileges as well.
revoke all on table public.categories, public.products, public.orders, public.order_items
  from anon, authenticated;
grant select on table public.orders, public.order_items to authenticated;

-- Public roles may only read the fields needed by the storefront. RLS filters
-- rows, while column privileges prevent exposure of internal slugs/timestamps.
revoke select on table public.categories, public.products from anon, authenticated;
grant select (id, name) on table public.categories to anon, authenticated;
grant select (
  id,
  category_id,
  name,
  description,
  price,
  compare_at_price,
  color,
  image_url,
  badge,
  rating,
  review_count
) on table public.products to anon, authenticated;
