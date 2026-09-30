-- Expose the public catalog through a purpose-built view. PostgREST requires
-- a table-level SELECT grant for API resources, so public roles access this
-- view rather than the base tables. Base-table column grants remain narrow.

grant select (is_active) on table public.categories to anon, authenticated;
grant select (is_active) on table public.products to anon, authenticated;

create or replace view public.storefront_catalog
with (security_invoker = true)
as
select
  p.id,
  p.name,
  c.name as category,
  p.description,
  p.price,
  p.compare_at_price,
  p.color,
  p.image_url,
  p.badge,
  p.rating,
  p.review_count
from public.products as p
join public.categories as c on c.id = p.category_id
where p.is_active = true and c.is_active = true;

revoke all on table public.storefront_catalog from public, anon, authenticated;
grant select on table public.storefront_catalog to anon, authenticated;
