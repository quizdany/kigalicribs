import Link from 'next/link'
import { privacySections } from '@/lib/knowledge/sources'

export const metadata = { title: 'Privacy policy', description: 'What TuraKGL stores about renters and property owners, and why.' }

const sections = privacySections.map(s => [s.title, s.body])

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
