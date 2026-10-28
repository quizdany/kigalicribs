import Link from 'next/link'

export const metadata = { title: 'Page not found' }

export default function NotFound() {
  return (
    <main className="tk-page bg-gray-50 px-4 py-24 text-gray-900 sm:px-6">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-sm font-semibold text-emerald-800">404</p>
        <h1 className="tk-title mt-2">This page is not on the map</h1>
        <p className="mx-auto mt-4 text-gray-600">The link may be old, or the listing may have been removed by its owner.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/properties" className="tk-button bg-emerald-800 text-white hover:bg-emerald-900">Browse homes</Link>
          <Link href="/" className="tk-button text-emerald-800 hover:bg-emerald-50">Go to the home page</Link>
        </div>
      </div>
    </main>
  )
}
