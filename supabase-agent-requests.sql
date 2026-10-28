-- TuraKGL: renter requests (viewing requests, listing reports, support, owner drafts)
-- and daily per-user rate limits. Run once in the Supabase SQL editor.
--
-- Only the server (service role key) reads and writes these tables. Each API route
-- checks the signed-in user and property ownership before touching a row, so RLS is
-- enabled with no policies: anon/authenticated clients cannot access them directly.

create table if not exists public.agent_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('viewing', 'listing_report', 'support', 'content_draft')),
  property_id uuid references public.properties(id) on delete set null,
  message text not null,
  status text not null default 'pending'
    check (status in ('pending', 'reviewed', 'closed', 'confirmed', 'declined', 'cancelled')),
  reply text not null default '',
  replied_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists agent_requests_user_idx on public.agent_requests (user_id, created_at desc);
create index if not exists agent_requests_property_idx on public.agent_requests (property_id, created_at desc);

create table if not exists public.agent_limits (
  id text primary key,
  count integer not null default 0
);

alter table public.agent_requests enable row level security;
alter table public.agent_limits enable row level security;

-- Atomically increments a daily counter. Returns the new count, or null once the
-- limit has been reached.
create or replace function public.increment_agent_limit(limit_key text, max_count integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  insert into public.agent_limits (id, count) values (limit_key, 1)
  on conflict (id) do update set count = agent_limits.count + 1
  where agent_limits.count < max_count
  returning count into new_count;
  return new_count;
end;
$$;

revoke all on function public.increment_agent_limit(text, integer) from public, anon, authenticated;
grant execute on function public.increment_agent_limit(text, integer) to service_role;
