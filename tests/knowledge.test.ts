import assert from 'node:assert/strict';
import { test } from 'node:test';
import { chunkDocuments, hashContent, splitBody } from '@/lib/knowledge/chunk';
import { Bm25Index, formatForModel, knowledgeCorpus, reciprocalRankFusion, retrieveKnowledge, tokenize } from '@/lib/knowledge/retrieve';
import { knowledgeDocuments } from '@/lib/knowledge/sources';

test('every section becomes at least one chunk with a stable, unique id', () => {
  const chunks = chunkDocuments(knowledgeDocuments);
  const sections = knowledgeDocuments.reduce((n, d) => n + d.sections.length, 0);
  assert.ok(chunks.length >= sections);
  assert.equal(new Set(chunks.map(c => c.id)).size, chunks.length);
  assert.deepEqual(chunkDocuments(knowledgeDocuments).map(c => c.id), chunks.map(c => c.id));
});

test('chunks carry their document and section title so they stand alone', () => {
  const c = knowledgeCorpus.find(x => x.id === 'privacy#3-0')!;
  assert.match(c.content, /^Privacy policy — Payments\n/);
});

test('long text is split on sentences, within the limit, with overlap', () => {
  const body = Array.from({ length: 12 }, (_, i) => `Sentence number ${i} explains one rule clearly.`).join(' ');
  const parts = splitBody(body, 160);
  assert.ok(parts.length > 1);
  for (const p of parts) assert.ok(p.length <= 160 + 60, `part too long: ${p.length}`);
  const lastOfFirst = parts[0].split('. ').pop()!;
  assert.ok(parts[1].startsWith(lastOfFirst.replace(/\.$/, '')), 'next part should repeat the last sentence');
});

test('content hash changes only when content changes', () => {
  assert.equal(hashContent('a'), hashContent('a'));
  assert.notEqual(hashContent('a'), hashContent('b'));
});

test('tokenizer drops stopwords and folds simple plurals', () => {
  assert.deepEqual(tokenize('How do I report the listings?'), ['report', 'listing']);
});

test('BM25 ranks the passage that contains the query terms first', () => {
  const index = new Bm25Index(knowledgeCorpus);
  assert.equal(index.search('mobile money PIN', 3)[0].chunk.id, 'privacy#3-0');
  assert.equal(index.search('zzzz qqqq', 3).length, 0);
});

test('reciprocal rank fusion rewards items both lists agree on', () => {
  const scores = reciprocalRankFusion([['a', 'b', 'c'], ['b', 'a', 'd']]);
  const order = [...scores.entries()].sort((x, y) => y[1] - x[1]).map(([id]) => id);
  assert.deepEqual(order.slice(0, 2).sort(), ['a', 'b']);
  assert.ok(scores.get('a')! > scores.get('d')!);
});

test('hybrid retrieval lets vector search rescue a paraphrase keyword search misses', async () => {
  const fakeVectors = async () => [{ id: 'privacy#2-0', similarity: 0.82 }];
  const keywordOnly = await retrieveKnowledge('Who can see the viewing requests I send?', { k: 4 });
  const hybrid = await retrieveKnowledge('Who can see the viewing requests I send?', { k: 4, vectorSearch: fakeVectors });
  assert.equal(keywordOnly.mode, 'keyword');
  assert.equal(hybrid.mode, 'hybrid');
  assert.ok(hybrid.chunks.some(c => c.id === 'privacy#2-0' && c.matchedBy.includes('vector')));
});

test('retrieval falls back to keyword search when the vector store fails', async () => {
  const broken = async () => { throw new Error('connection refused'); };
  const result = await retrieveKnowledge('free contact unlocks', { vectorSearch: broken });
  assert.equal(result.mode, 'keyword');
  assert.equal(result.chunks[0].id, 'help#4-0');
});

test('stale vector ids that are no longer in the corpus are ignored', async () => {
  const stale = async () => [{ id: 'help#999-0', similarity: 0.9 }];
  const result = await retrieveKnowledge('free contact unlocks', { vectorSearch: stale });
  assert.ok(result.chunks.every(c => c.id !== 'help#999-0'));
});

test('model input is numbered for citation, and empty results tell the model to decline', async () => {
  const found = formatForModel(await retrieveKnowledge('delete my account'));
  assert.equal(found.passages[0].citation, 1);
  assert.match(found.note, /cite/);
  const none = formatForModel({ mode: 'keyword', chunks: [] });
  assert.equal(none.passages.length, 0);
  assert.match(none.note, /do not know/);
});
