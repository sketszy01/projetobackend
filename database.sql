-- Execute once in a NEW Supabase database, using SQL Editor.
-- Existing tables are not migrated or dropped by this script.
begin;
create table public.categories (
    id uuid primary key default gen_random_uuid(),
    name text not null check (length(trim(name)) > 0),
    description text not null check (length(trim(description)) > 0),
    icon text not null default '',
    display_order integer not null default 0 check (display_order >= 0),
    active boolean not null default true
);
create table public.products (
    id uuid primary key default gen_random_uuid(),
    "categoryId" uuid not null references public.categories(id) on delete restrict,
    name text not null check (length(trim(name)) > 0),
    description text not null check (length(trim(description)) > 0),
    price numeric not null check (price > 0 and price < 'Infinity'::numeric),
    image text not null default '',
    available boolean not null default true,
    active boolean not null default true
);
create index products_category_id_idx on public.products ("categoryId");
-- The backend uses a secret/service_role key. Public clients have no access.
alter table public.categories enable row level security;
alter table public.products enable row level security;
revoke all on table public.categories, public.products from anon, authenticated;
grant select, insert, update, delete on table public.categories, public.products to service_role;
commit;
