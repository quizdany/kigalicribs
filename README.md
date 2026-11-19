# TuraKGL

Homes for rent in Kigali, directly from property owners. Next.js + Supabase.

## Setup for renter requests, owner inbox and operations queue

1. Run `supabase-agent-requests.sql` once in the Supabase SQL editor.
2. Set `SUPABASE_SERVICE_ROLE_KEY` in the server environment (already used by admin verification and listing expiry).
3. Optional: set `OPENAI_API_KEY` and `OPENAI_MODEL` to activate the AI conversation on `/assistant`. Search and request forms work without it.

## AI assistant with retrieval-augmented generation (RAG)

The assistant on `/assistant` has two tools:

- `search_properties` searches live listings in Supabase, so home recommendations come from real data.
- `search_knowledge` searches the help page, terms of use and privacy policy, so answers about how TuraKGL works are grounded in the site's own text and cite their sources, e.g. "You get three free contact unlocks [1]".

Retrieval is hybrid: pgvector similarity search (OpenAI embeddings) fused with keyword BM25 search using reciprocal rank fusion. If the vector store is unavailable, the assistant falls back to keyword search instead of failing. See [docs/RAG.md](docs/RAG.md) for the design.

To switch it on:

1. Run `supabase-knowledge-rag.sql` once in the Supabase SQL editor (enables `pgvector`).
2. Set `OPENAI_API_KEY`, `OPENAI_MODEL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. Optional: `OPENAI_EMBEDDING_MODEL` (default `text-embedding-3-small`).
3. Run `npm run knowledge:ingest` to embed the knowledge base. Re-run it after editing `src/lib/knowledge/sources.ts`; unchanged chunks are skipped.
4. Check quality with `npm run knowledge:eval` (offline, keyword) or `npm run knowledge:eval -- --hybrid`.

Tests: `npm test`.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
