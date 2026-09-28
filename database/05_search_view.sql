-- View: photographer_overviews
-- Purpose: Aggregate photographer data (rating, pricing) for easier filtering.

drop view if exists photographer_overviews;

create or replace view photographer_overviews as
select 
  p.id,
  p.full_name,
  p.username,
  p.avatar_url,
  p.cover_photo_url,
  p.bio,
  p.location,
  p.role,
  -- Review Stats
  coalesce(avg(r.rating), 0) as avg_rating,
  count(r.id) as review_count,
  -- Pricing Stats
  coalesce(min(s.price), 0) as min_price,
  coalesce(max(s.price), 0) as max_price
from profiles p
left join reviews r on p.id = r.photographer_id
left join services s on p.id = s.photographer_id
where p.role = 'photographer'
group by p.id;

-- Grant access (if RLS is a concern, views often bypass RLS of underlying tables if not 'security invoker', but for public search this is fine)
-- If we want RLS on the view, we'd need 'with (security_invoker=true)' in Postgres 15+, or just rely on public access policy.
-- Since search is public, this is generally safe.
