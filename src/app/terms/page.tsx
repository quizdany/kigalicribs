import Link from 'next/link'

export const metadata = { title: 'Terms of use', description: 'The rules for renters and property owners using TuraKGL.' }

const sections = [
  ['What TuraKGL does', 'TuraKGL lists homes for rent in Kigali and puts renters in touch with property owners. We are not a party to any lease, and we do not collect rent or deposits.'],
  ['Owner listings', 'Owners must list only properties they own or are authorised to rent out, with accurate rent, photos and availability. Listings from brokers or agents posing as owners may be removed.'],
  ['Renter conduct', 'Use owner contact details only to ask about the listed property. Do not resell or publish them.'],
  ['Paid features', 'Listing upgrades and unlimited contact access are paid once through mobile money. The price is shown before you pay.'],
  ['Before you pay rent', 'Confirm who you are dealing with, view the property where possible, and read the full rental terms. A listing or a viewing request is not a guarantee that a home is available.'],
  ['Reporting problems', 'Use the report option on any listing for brokers, unavailable homes, incorrect details or suspected scams. Reports are reviewed by the TuraKGL team.'],
]

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
