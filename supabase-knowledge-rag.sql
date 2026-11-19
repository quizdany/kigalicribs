-- Vector store for the assistant's knowledge base.
-- Run once in Supabase, then `npm run knowledge:ingest`.
-- Server-only: RLS on, no policies, function granted to service_role.

create extension if not exists vector;

create table if not exists public.knowledge_chunks (
  id text primary key,                 -- e.g. 'help#4-0'
  document_id text not null,
  document_title text not null,
  section_title text not null,
  url text not null,
  content text not null,
  content_hash text not null,
  embedding_model text not null,
  embedding vector(1536) not null,
  updated_at timestamptz not null default now()
);

create index if not exists knowledge_chunks_embedding_idx
  on public.knowledge_chunks using hnsw (embedding vector_cosine_ops);

alter table public.knowledge_chunks enable row level security;

-- nearest chunks above a similarity floor
create or replace function public.match_knowledge(
  query_embedding vector(1536),
  match_count integer default 6,
  min_similarity double precision default 0.3
)
returns table (id text, content text, similarity double precision)
language sql
stable
security definer
set search_path = public
as $$
  select k.id, k.content, 1 - (k.embedding <=> query_embedding) as similarity
  from public.knowledge_chunks k
  where 1 - (k.embedding <=> query_embedding) >= min_similarity
  order by k.embedding <=> query_embedding
  limit least(match_count, 20);
$$;

revoke all on function public.match_knowledge(vector, integer, double precision) from public, anon, authenticated;
grant execute on function public.match_knowledge(vector, integer, double precision) to service_role;
