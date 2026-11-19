import Link from 'next/link'
import { termsSections } from '@/lib/knowledge/sources'

export const metadata = { title: 'Terms of use', description: 'The rules for renters and property owners using TuraKGL.' }

const sections = termsSections.map(s => [s.title, s.body])

export default function Terms() {
  return (
    <main className="tk-page bg-gray-50 px-4 py-12 text-gray-900 sm:px-6">
      <article className="mx-auto max-w-3xl">
        <h1 className="tk-title">Terms of use</h1>
        <p className="mt-4 text-gray-600">The rules that keep listings honest and renters safe.</p>
        <div className="mt-12 space-y-8">
          {sections.map(([title, body]) => (
            <section key={title}>
              <h2 className="tk-section-title">{title}</h2>
              <p className="mt-2 text-gray-600">{body}</p>
            </section>
          ))}
        </div>
        <p className="mt-12 text-sm text-gray-600">See also the <Link href="/privacy" className="font-semibold text-emerald-800 underline underline-offset-4">privacy policy</Link>.</p>
      </article>
    </main>
  )
}
