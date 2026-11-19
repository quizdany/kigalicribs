import { serviceClient } from '@/lib/agent-store';
import type { VectorHit } from './retrieve';

export const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
export const EMBEDDING_DIMENSIONS = 1536; // same as vector(1536) in the SQL
export const MIN_SIMILARITY = 0.3;

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is not configured');
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: texts, dimensions: EMBEDDING_DIMENSIONS }),
  });
  if (!res.ok) throw new Error(`Embedding request failed (${res.status})`);
  const json = (await res.json()) as { data: { index: number; embedding: number[] }[] };
  return json.data.sort((a, b) => a.index - b.index).map(d => d.embedding);
}

export async function supabaseVectorSearch(query: string, k: number): Promise<VectorHit[]> {
  const [embedding] = await embedTexts([query]);
  const { data, error } = await serviceClient().rpc('match_knowledge', {
    query_embedding: embedding,
    match_count: k,
    min_similarity: MIN_SIMILARITY,
  });
  if (error) throw error;
  return ((data ?? []) as { id: string; similarity: number }[]).map(r => ({ id: r.id, similarity: r.similarity }));
}
