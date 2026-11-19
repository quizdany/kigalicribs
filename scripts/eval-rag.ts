// Measures retrieval quality on scripts/rag-eval-set.ts.
//   npm run knowledge:eval              # keyword (BM25) retrieval, runs offline
//   npm run knowledge:eval -- --hybrid  # BM25 + pgvector (needs Supabase + OpenAI keys)
// Reports hit rate @k, mean reciprocal rank (MRR), and how often unanswerable
// questions wrongly retrieve passages. Exits non-zero if quality drops below
// the thresholds, so it can run in CI.

import { retrieveKnowledge } from '@/lib/knowledge/retrieve';
import { supabaseVectorSearch } from '@/lib/knowledge/vector';
import { evalSet } from './rag-eval-set';

const K = 4;
const MIN_HIT_RATE = 0.85;
const MIN_MRR = 0.7;

async function main() {
  const hybrid = process.argv.includes('--hybrid');
  let hits = 0, rrSum = 0, answerable = 0, falsePositives = 0, unanswerable = 0;

  for (const c of evalSet) {
    const { chunks, mode } = await retrieveKnowledge(c.question, { k: K, vectorSearch: hybrid ? supabaseVectorSearch : undefined });
    if (hybrid && mode !== 'hybrid') throw new Error('Vector search failed; check keys and that supabase-knowledge-rag.sql was run.');
    const ids = chunks.map(x => x.id);

    if ('unanswerable' in c) {
      unanswerable++;
      if (ids.length) falsePositives++;
      console.log(`${ids.length ? 'WARN' : 'ok  '}  [no answer expected] ${c.question} → ${ids.join(', ') || '(none)'}`);
      continue;
    }
    answerable++;
    const rank = ids.findIndex(id => c.relevant.includes(id));
    if (rank >= 0) { hits++; rrSum += 1 / (rank + 1); }
    console.log(`${rank >= 0 ? 'ok  ' : 'MISS'}  rank ${rank >= 0 ? rank + 1 : '-'}  ${c.question}`);
  }

  const hitRate = hits / answerable;
  const mrr = rrSum / answerable;
  console.log(`\nMode: ${hybrid ? 'hybrid (BM25 + pgvector)' : 'keyword (BM25)'}`);
  console.log(`Hit rate @${K}: ${(hitRate * 100).toFixed(1)}%  (${hits}/${answerable})`);
  console.log(`MRR: ${mrr.toFixed(3)}`);
  console.log(`Unanswerable questions that retrieved passages: ${falsePositives}/${unanswerable} (the model is instructed to decline these)`);

  if (hitRate < MIN_HIT_RATE || mrr < MIN_MRR) {
    console.error(`Below threshold (hit rate ≥ ${MIN_HIT_RATE}, MRR ≥ ${MIN_MRR}).`);
    process.exit(1);
  }
}

main().catch(err => { console.error(err instanceof Error ? err.message : err); process.exit(1); });
