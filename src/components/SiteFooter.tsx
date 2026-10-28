import Link from 'next/link'

const whatsapp = 'https://wa.me/250781448848?text=Hello%20TuraKGL%2C%20I%20need%20help%20with...'

// Three columns with the same number of rows each.
const columns = [
  {
    title: 'Renters',
    links: [
      { href: '/properties', label: 'Find a home' },
      { href: '/assistant', label: 'Rental assistant' },
      { href: '/requests', label: 'My requests' },
      { href: '/contracts/new', label: 'Lease agreement' },
    ],
  },
  {
    title: 'Property owners',
    links: [
      { href: '/properties/new', label: 'List a property' },
      { href: '/owners/start', label: 'Listing checklist' },
      { href: '/owners/properties', label: 'My properties' },
      { href: '/owners/inquiries', label: 'Owner inbox' },
    ],
  },
  {
    title: 'Help',
    links: [
      { href: '/help', label: 'How it works' },
      { href: '/assistant#request', label: 'Request support' },
      { href: whatsapp, label: 'Chat on WhatsApp' },
      { label: 'Kigali, Rwanda' },
    ],
  },
]

export default function SiteFooter() {
  return (
    <footer className="bg-ink-dark py-16 text-white print:hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
          {columns.map((c) => (
            <div key={c.title}>
              <h2 className="mb-4 text-sm font-semibold text-white">{c.title}</h2>
              <ul className="space-y-3 text-sm text-white/60">
                {c.links.map((l) => (
                  <li key={l.label}>
                    {!l.href ? (
                      l.label
                    ) : l.href.startsWith('http') ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">{l.label}</a>
                    ) : (
                      <Link href={l.href} className="transition-colors hover:text-white">{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center gap-3 border-t border-white/10 pt-6 text-sm text-white/60 sm:flex-row sm:justify-between">
          <p>&copy; {new Date().getFullYear()} TuraKGL. All rights reserved.</p>
          <p className="flex gap-6">
            <Link href="/privacy" className="transition-colors hover:text-white">Privacy policy</Link>
            <Link href="/terms" className="transition-colors hover:text-white">Terms of use</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
