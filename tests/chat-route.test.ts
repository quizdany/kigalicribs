import assert from 'node:assert/strict';
import { test } from 'node:test';

// chat route with OpenAI and Supabase mocked at fetch level

process.env.OPENAI_API_KEY = 'test';
process.env.OPENAI_MODEL = 'test-model';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service';

test('knowledge questions are answered from retrieved passages with sources', async () => {
  const modelInputs: unknown[][] = [];
  let modelTurn = 0;
  globalThis.fetch = (async (url: string | URL, init?: RequestInit) => {
    const u = String(url);
    const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
    if (u.includes('/auth/v1/user')) return json({ id: '11111111-1111-1111-1111-111111111111', aud: 'authenticated', role: 'authenticated', email: 'r@example.com', app_metadata: {}, user_metadata: {}, created_at: '' });
    if (u.includes('/rest/v1/rpc/increment_agent_limit')) return json(1);
    if (u.includes('/rest/v1/rpc/match_knowledge')) return json([{ id: 'help#4-0', content: '', similarity: 0.81 }]);
    if (u.includes('api.openai.com/v1/embeddings')) return json({ data: [{ index: 0, embedding: new Array(1536).fill(0.01) }] });
    if (u.includes('api.openai.com/v1/responses')) {
      const body = JSON.parse(String(init?.body));
      modelInputs.push(body.input);
      modelTurn++;
      if (modelTurn === 1) return json({ output: [{ type: 'function_call', name: 'search_knowledge', call_id: 'c1', arguments: JSON.stringify({ query: 'free contact unlocks' }) }] });
      return json({ output: [{ type: 'message', content: [{ type: 'output_text', text: 'You get three free contact unlocks [1].' }] }] });
    }
    throw new Error(`unexpected fetch ${u}`);
  }) as typeof fetch;

  const { POST } = await import('@/app/api/agents/chat/route');
  const res = await POST(new Request('http://localhost/api/agents/chat', {
    method: 'POST',
    headers: { Authorization: 'Bearer token', 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'How many owner contacts can I unlock for free?' }),
  }));
  const data = await res.json();

  assert.equal(res.status, 200, JSON.stringify(data));
  assert.match(data.message, /\[1\]/);
  assert.equal(data.sources[0].citation, 1);
  assert.equal(data.sources[0].url, '/help');
  const toolOutput = (modelInputs[1] as { type: string; output?: string }[]).find(x => x.type === 'function_call_output')!;
  const passages = JSON.parse(toolOutput.output!).passages;
  assert.equal(passages[0].citation, 1);
  assert.match(passages[0].text, /three free property contact unlocks/);
});
