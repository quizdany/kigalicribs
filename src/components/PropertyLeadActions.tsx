'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const reportReasons = [
  ['broker_or_agent', 'The advertiser appears to be a broker or agent'],
  ['already_rented', 'The home is already rented or unavailable'],
  ['incorrect_details', 'The listing has inaccurate details'],
  ['suspected_scam', 'I suspect a scam or unsafe listing'],
  ['duplicate', 'This listing appears more than once'],
] as const;

export default function PropertyLeadActions({ propertyId, available = true }: { propertyId: string; available?: boolean }) {
  const [viewingOpen, setViewingOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [when, setWhen] = useState('');
  const [note, setNote] = useState('');
  const [reason, setReason] = useState<(typeof reportReasons)[number][0]>('broker_or_agent');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  async function submit(body: object) {
    setBusy(true);
    setNotice('');
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw Error('Sign in before sending a request.');
      const res = await fetch('/api/agents/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok) throw Error(result.error || 'Unable to submit your request.');
      setNotice(result.message);
      setWhen(''); setNote(''); setDetails('');
    } catch (e) {
      setNotice((e as Error).message);
    } finally { setBusy(false); }
  }

  return <section className="mt-5 border-t pt-5" aria-label="Contact the owner or report the listing">
    <h4 className="font-semibold text-gray-900">Arrange a viewing directly</h4>
    <p className="mt-1 text-sm text-gray-600">Send your preferred time to the owner. It is a request until the owner confirms it.</p>
    {available ? <button type="button" onClick={() => { setViewingOpen(!viewingOpen); setNotice(''); }} className="mt-3 w-full rounded-lg border border-emerald-800 px-4 py-3 font-medium text-emerald-900 hover:bg-emerald-50">{viewingOpen ? 'Close viewing request' : 'Request a viewing'}</button> : <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Viewing requests are closed because this home is no longer available.</p>}
    {viewingOpen && <form className="mt-3 space-y-3" onSubmit={e => { e.preventDefault(); const message = `Preferred viewing time: ${when.trim()}\n${note.trim() ? `Message: ${note.trim()}` : ''}`; void submit({ kind: 'viewing', propertyId, message }); }}>
      <label className="block text-sm font-medium">When would you like to visit?<input required minLength={3} maxLength={120} value={when} onChange={e => setWhen(e.target.value)} className="mt-1 w-full rounded-lg border p-3" placeholder="For example, Saturday 24 October after 10:00" /></label>
      <label className="block text-sm font-medium">Message to the owner<textarea maxLength={900} rows={3} value={note} onChange={e => setNote(e.target.value)} className="mt-1 w-full rounded-lg border p-3" placeholder="Share any questions or alternative times." /></label>
      <button disabled={busy} className="tk-button rounded-lg bg-emerald-800 px-4 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Sending…' : 'Send viewing request'}</button>
      <p className="text-xs text-gray-500">Check the owner’s response in <Link href="/requests" className="underline">My requests</Link>. TuraKGL does not confirm appointments automatically.</p>
    </form>}

    <div className="mt-5 border-t pt-4">
      <button type="button" onClick={() => { setReportOpen(!reportOpen); setNotice(''); }} className="text-sm text-gray-600 underline">Report broker, unavailable home or incorrect information</button>
      {reportOpen && <form className="mt-3 space-y-3" onSubmit={e => { e.preventDefault(); void submit({ kind: 'listing_report', propertyId, reason, details }); }}>
        <label className="block text-sm font-medium">What should we review?<select value={reason} onChange={e => setReason(e.target.value as typeof reason)} className="mt-1 w-full rounded-lg border bg-white p-3">{reportReasons.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="block text-sm font-medium">Details (optional)<textarea maxLength={1200} rows={3} value={details} onChange={e => setDetails(e.target.value)} className="mt-1 w-full rounded-lg border p-3" placeholder="Tell us what you observed." /></label>
        <button disabled={busy} className="tk-button rounded-lg border border-slate-400 px-4 py-3 font-medium disabled:opacity-50">{busy ? 'Sending…' : 'Send report'}</button>
        <p className="text-xs text-gray-500">Reports go to the TuraKGL review queue. A report does not automatically remove a listing or prove wrongdoing.</p>
      </form>}
    </div>
    <p role="status" aria-live="polite" className="mt-3 text-sm text-emerald-900">{notice}</p>
  </section>;
}
