// Loading placeholders shaped like the pages they stand in for.

export function ListingDetailSkeleton() {
  return (
    <div className="tk-page bg-gray-50" aria-busy="true" aria-label="Loading listing">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="tk-skeleton aspect-[16/7] w-full rounded-3xl" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div>
            <div className="tk-skeleton h-8 w-2/3" />
            <div className="tk-skeleton mt-4 h-4 w-1/3" />
            <div className="tk-skeleton mt-8 h-24 w-full" />
          </div>
          <div className="tk-skeleton h-48 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading form">
      <div className="tk-skeleton h-8 w-1/2" />
      <div className="mt-8 grid gap-6 rounded-2xl bg-white p-6">
        {Array.from({ length: fields }, (_, i) => (
          <div key={i}>
            <div className="tk-skeleton h-4 w-1/4" />
            <div className="tk-skeleton mt-2 h-11 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="tk-page bg-gray-50" aria-busy="true" aria-label="Loading">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="tk-skeleton h-8 w-1/3" />
        <div className="mt-8 grid gap-4">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="flex gap-4 rounded-2xl bg-white p-4">
              <div className="tk-skeleton h-20 w-28 shrink-0 rounded-xl" />
              <div className="flex-1">
                <div className="tk-skeleton h-5 w-1/2" />
                <div className="tk-skeleton mt-3 h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
