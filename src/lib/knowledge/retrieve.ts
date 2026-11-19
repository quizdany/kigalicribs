import { chunkDocuments, type KnowledgeChunk } from './chunk';
import { knowledgeDocuments } from './sources';

// ---------- Keyword retrieval (BM25) ----------
// Runs in-process over the bundled corpus. It catches exact terms such as
// "MoMo" or "unlock" that embeddings can blur, and keeps the assistant working
// if the vector store is not set up yet.

const STOPWORDS = new Set('a an and are as at be by can do does for from how i if in is it its my of on or the this to was what when where which who why will with you your'.split(' '));

export function tokenize(text: string): string[] {
  return (text.toLowerCase().normalize('NFKD').match(/[\p{L}\p{N}]+/gu) ?? [])
    .filter(t => t.length > 1 && !STOPWORDS.has(t))
    .map(t => (t.length > 4 && t.endsWith('s') ? t.slice(0, -1) : t)); // light plural folding
}

export class Bm25Index {
  private docs: { chunk: KnowledgeChunk; tf: Map<string, number>; len: number }[];
  private df = new Map<string, number>();
  private avgLen: number;

  constructor(chunks: KnowledgeChunk[], private k1 = 1.2, private b = 0.75) {
    this.docs = chunks.map(chunk => {
      const tokens = tokenize(chunk.content);
      const tf = new Map<string, number>();
      for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
      for (const t of tf.keys()) this.df.set(t, (this.df.get(t) ?? 0) + 1);
      return { chunk, tf, len: tokens.length };
    });
    this.avgLen = this.docs.reduce((s, d) => s + d.len, 0) / Math.max(this.docs.length, 1);
  }

  search(query: string, k: number): { chunk: KnowledgeChunk; score: number }[] {
    const terms = [...new Set(tokenize(query))];
    const n = this.docs.length;
    return this.docs
      .map(({ chunk, tf, len }) => {
        let score = 0;
        for (const t of terms) {
          const f = tf.get(t);
          if (!f) continue;
          const df = this.df.get(t) ?? 0;
          const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5));
          score += idf * ((f * (this.k1 + 1)) / (f + this.k1 * (1 - this.b + (this.b * len) / this.avgLen)));
        }
        return { chunk, score };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  }
}

// ---------- Fusion ----------
// Reciprocal Rank Fusion combines ranked lists without having to calibrate
// BM25 scores against cosine similarities.
export function reciprocalRankFusion(lists: string[][], k = 60): Map<string, number> {
  const scores = new Map<string, number>();
  for (const list of lists) list.forEach((id, rank) => scores.set(id, (scores.get(id) ?? 0) + 1 / (k + rank + 1)));
  return scores;
}

// ---------- Hybrid retrieval ----------
export type VectorHit = { id: string; similarity: number };
export type VectorSearch = (query: string, k: number) => Promise<VectorHit[]>;

export type RetrievedChunk = KnowledgeChunk & { citation: number; matchedBy: ('keyword' | 'vector')[] };
export type RetrievalResult = { mode: 'hybrid' | 'keyword'; chunks: RetrievedChunk[] };

const corpus = chunkDocuments(knowledgeDocuments);
const byId = new Map(corpus.map(c => [c.id, c]));
const keywordIndex = new Bm25Index(corpus);

export async function retrieveKnowledge(query: string, opts: { k?: number; vectorSearch?: VectorSearch } = {}): Promise<RetrievalResult> {
  const k = opts.k ?? 4;
  const candidates = k * 2;
  const keyword = keywordIndex.search(query, candidates);

  let vector: VectorHit[] = [];
  let mode: RetrievalResult['mode'] = 'keyword';
  if (opts.vectorSearch) {
    try {
      // Ignore ids that are no longer in the corpus (stale rows awaiting re-ingestion).
      vector = (await opts.vectorSearch(query, candidates)).filter(h => byId.has(h.id));
      mode = 'hybrid';
    } catch {
      mode = 'keyword'; // vector store unavailable: degrade, don't fail
    }
  }

  const keywordIds = keyword.map(r => r.chunk.id);
  const vectorIds = vector.map(h => h.id);
  const fused = reciprocalRankFusion([keywordIds, vectorIds]);
  const ranked = [...fused.entries()].sort((a, b) => b[1] - a[1]).slice(0, k);

  return {
    mode,
    chunks: ranked.map(([id], i) => ({
      ...byId.get(id)!,
      citation: i + 1,
      matchedBy: [
        ...(keywordIds.includes(id) ? (['keyword'] as const) : []),
        ...(vectorIds.includes(id) ? (['vector'] as const) : []),
      ],
    })),
  };
}

// What the model sees: numbered passages it must cite, and nothing else.
export function formatForModel(result: RetrievalResult) {
  if (!result.chunks.length) return { passages: [], note: 'No relevant TuraKGL help or policy text was found. Say you do not know and suggest a support request.' };
  return {
    passages: result.chunks.map(c => ({ citation: c.citation, source: `${c.documentTitle} — ${c.sectionTitle}`, text: c.content })),
    note: 'Answer only from these passages and cite them like [1]. If they do not answer the question, say so.',
  };
}

export function sourcesForUser(result: RetrievalResult) {
  return result.chunks.map(c => ({ citation: c.citation, title: `${c.documentTitle}: ${c.sectionTitle}`, url: c.url }));
}

export { corpus as knowledgeCorpus };
