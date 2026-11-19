// Embed the knowledge base into Supabase (pgvector).
// Only new/changed chunks are embedded. Needs Supabase + OpenAI keys in .env.local.
// npm run knowledge:ingest [-- --dry-run]

import { serviceClient } from '@/lib/agent-store';
import { chunkDocuments } from '@/lib/knowledge/chunk';
import { knowledgeDocuments } from '@/lib/knowledge/sources';
import { EMBEDDING_MODEL, embedTexts } from '@/lib/knowledge/vector';

const BATCH = 64;
const dryRun = process.argv.includes('--dry-run');

async function main() {
  const chunks = chunkDocuments(knowledgeDocuments);
  console.log(`Knowledge base: ${knowledgeDocuments.length} documents, ${chunks.length} chunks.`);

  if (dryRun && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    for (const c of chunks) console.log(`  ${c.id.padEnd(12)} ${c.content.length.toString().padStart(4)} chars  ${c.sectionTitle}`);
    console.log('Dry run without database credentials: nothing compared or written.');
    return;
  }

  const db = serviceClient();
  const { data: existing, error } = await db.from('knowledge_chunks').select('id, content_hash, embedding_model');
  if (error) throw error;
  const stored = new Map((existing ?? []).map(r => [r.id as string, r]));

  const changed = chunks.filter(c => {
    const row = stored.get(c.id);
    return !row || row.content_hash !== c.contentHash || row.embedding_model !== EMBEDDING_MODEL;
  });
  const currentIds = new Set(chunks.map(c => c.id));
  const stale = [...stored.keys()].filter(id => !currentIds.has(id));

  console.log(`To embed: ${changed.length} · unchanged: ${chunks.length - changed.length} · to delete: ${stale.length}`);
  if (dryRun) return;

  for (let i = 0; i < changed.length; i += BATCH) {
    const batch = changed.slice(i, i + BATCH);
    const embeddings = await embedTexts(batch.map(c => c.content));
    const rows = batch.map((c, j) => ({
      id: c.id,
      document_id: c.documentId,
      document_title: c.documentTitle,
      section_title: c.sectionTitle,
      url: c.url,
      content: c.content,
      content_hash: c.contentHash,
      embedding_model: EMBEDDING_MODEL,
      embedding: embeddings[j],
      updated_at: new Date().toISOString(),
    }));
    const { error: upsertError } = await db.from('knowledge_chunks').upsert(rows);
    if (upsertError) throw upsertError;
    console.log(`  embedded ${Math.min(i + BATCH, changed.length)}/${changed.length}`);
  }

  if (stale.length) {
    const { error: deleteError } = await db.from('knowledge_chunks').delete().in('id', stale);
    if (deleteError) throw deleteError;
  }
  console.log('Done.');
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
