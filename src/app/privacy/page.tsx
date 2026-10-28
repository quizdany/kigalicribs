import Link from 'next/link'

export const metadata = { title: 'Privacy policy', description: 'What TuraKGL stores about renters and property owners, and why.' }

const sections = [
  ['What we store', 'Your account email and name, the listings you publish, the viewing requests, reports and support messages you send, which owner contacts you have unlocked, and the status of payments you make for listing upgrades or contact access.'],
  ['What stays on your device', 'Your shortlist of saved homes is kept in your browser only. Clearing your browser data removes it.'],
  ['Who sees your details', 'Owner phone numbers and emails are shown only to signed in renters who have unlocked that listing. Viewing requests are visible to you and to the owner of the property. TuraKGL staff can read requests and reports to review them.'],
  ['Payments', 'Mobile money payments are processed by MTN MoMo or Airtel Money. We keep the payment reference and status, not your mobile money PIN.'],
  ['Your choices', 'You can update or mark your listings as rented at any time from My properties. To delete your account and the data linked to it, send a support request from the assistant page.'],
]

export default function Privacy() {
  return (
    <main className="tk-page bg-gray-50 px-4 py-12 text-gray-900 sm:px-6">
      <article className="mx-auto max-w-3xl">
        <h1 className="tk-title">Privacy policy</h1>
        <p className="mt-4 text-gray-600">A plain language summary of how TuraKGL handles your information.</p>
        <div className="mt-12 space-y-8">
          {sections.map(([title, body]) => (
            <section key={title}>
              <h2 className="tk-section-title">{title}</h2>
              <p className="mt-2 text-gray-600">{body}</p>
            </section>
          ))}
        </div>
        <p className="mt-12 text-sm text-gray-600">Questions about this policy? <Link href="/assistant#request" className="font-semibold text-emerald-800 underline underline-offset-4">Send a support request</Link>.</p>
      </article>
    </main>
  )
}
