'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Inquiry = { id: string; property_id: string; property_title: string; message: string; status: string; created_at: string; reply?: string };
const terminal = (status: string) => ['confirmed', 'declined', 'cancelled'].includes(status);

export default function Inquiries() {
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState('');

  async function auth() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw Error('Sign in to see your property inquiries.');
    return { Authorization: `Bearer ${data.session.access_token}`, 'Content-Type': 'application/json' };
  }

  async function load() {
    try {
      const r = await fetch('/api/owners/inquiries', { headers: await auth(), cache: 'no-store' });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      setRows(d.requests);
      setReplies(Object.fromEntries(d.requests.map((r: Inquiry) => [r.id, r.reply || ''])));
      setDecisions(Object.fromEntries(d.requests.map((r: Inquiry) => [r.id, r.status === 'pending' ? 'reviewed' : r.status])));
      setLoaded(true);
      setNotice('');
    } catch (e) { setNotice((e as Error).message); }
  }

  useEffect(() => { load(); }, []);

  async function reply(id: string) {
    setBusy(id);
    try {
      const r = await fetch('/api/owners/inquiries', {
        method: 'PATCH', headers: await auth(),
        body: JSON.stringify({ id, reply: replies[id], decision: decisions[id] || 'reviewed' }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      await load();
      setNotice(d.status === 'confirmed' ? 'Viewing confirmed. The renter can see your confirmed time in My requests.' : d.status === 'declined' ? 'Request declined. The renter can see your response in My requests.' : 'Response saved. The renter can see it in My requests.');
    } catch (e) { setNotice((e as Error).message); }
    finally { setBusy(''); }
  }

  return <main className="tk-page min-h-[60vh] bg-gray-50 p-6 pb-24 text-gray-900"><div className="mx-auto max-w-4xl">
    <nav aria-label="Owner tools" className="tk-tabs"><Link href="/owners/properties">← My properties</Link></nav>
    <h1 className="tk-title mt-8 text-4xl font-bold">Property inquiries</h1>
    <p className="mt-4 text-gray-600">Review viewing requests for your listings. Reply with another time, confirm the agreed appointment, or decline the request. A confirmation should include the date and time.</p>
    <button onClick={load} disabled={!!busy} className="tk-button mt-6 rounded-xl border bg-white px-6 py-3">Refresh inquiries</button>
    <p className="my-4" role="status" aria-live="polite">{notice}</p>
    {loaded && !rows.length && <p>No viewing requests yet.</p>}
    {rows.map(r => <article key={r.id} className="tk-surface mt-4 rounded-2xl border bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="tk-section-title text-xl font-semibold">{r.property_title}</h2><span className="rounded-full bg-gray-100 px-3 py-1 text-sm">{r.status}</span></div>
      <p className="mt-2 text-sm text-gray-500">{new Date(r.created_at).toLocaleString()}</p>
      <p className="mt-4 whitespace-pre-wrap">{r.message}</p>
      <Link href={`/properties/${r.property_id}`} className="mt-3 inline-block text-emerald-800 underline">View property</Link>
      <label className="mt-6 block">Your response<textarea rows={3} maxLength={3000} disabled={terminal(r.status)} value={replies[r.id] || ''} onChange={e => setReplies({ ...replies, [r.id]: e.target.value })} className="mt-2 w-full rounded-xl border p-3" placeholder="Suggest a time, or state the confirmed date and time." /></label>
      <label className="mt-4 block">Request decision<select disabled={terminal(r.status)} value={decisions[r.id] || 'reviewed'} onChange={e => setDecisions({ ...decisions, [r.id]: e.target.value })} className="mt-2 rounded-xl border p-3"><option value="reviewed">Reply or suggest another time</option><option value="confirmed">Confirm appointment</option><option value="declined">Decline request</option></select></label>
      {decisions[r.id] === 'confirmed' && !terminal(r.status) && <p className="mt-2 text-sm text-amber-800">Include the agreed date and time in your response so the renter knows when to arrive.</p>}
      <button disabled={terminal(r.status) || !!busy || !replies[r.id]?.trim()} onClick={() => reply(r.id)} className="mt-4 rounded-xl bg-emerald-800 px-6 py-3 text-white disabled:opacity-40">{busy === r.id ? 'Saving…' : 'Save response'}</button>
    </article>)}
    <p className="mt-8 text-xs text-gray-500">Showing up to 100 recent viewing requests for your first 100 properties. Email and phone notifications are not connected.</p>
  </div></main>;
}
