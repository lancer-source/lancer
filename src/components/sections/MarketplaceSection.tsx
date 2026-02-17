export function MarketplaceSection() {
  const workerBenefits = [
    'Set your own hourly rates',
    'Choose jobs that fit your schedule',
    'Build direct client relationships',
    'Keep more of what you earn',
    'Grow your independent business',
  ];

  const homeownerBenefits = [
    'Find trusted local professionals',
    'See transparent pricing upfront',
    'Communicate directly — no middleman',
    'Read real reviews from neighbors',
    'Book services in minutes',
  ];

  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            A better way for everyone
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Lancer connects skilled workers directly with homeowners. Better for
            both sides.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {/* For Workers */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 md:p-10">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.42 15.17l-5.1-3.06A1.5 1.5 0 015 10.81V6.7a1.5 1.5 0 01.82-1.34l5.1-3.06a1.5 1.5 0 011.56 0l5.1 3.06A1.5 1.5 0 0118.5 6.7v4.11a1.5 1.5 0 01-.82 1.34l-5.1 3.06a1.5 1.5 0 01-1.56 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              For Skilled Workers
            </h3>
            <ul className="mt-6 space-y-4">
              {workerBenefits.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 shrink-0 text-brand-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                  <span className="text-slate-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* For Homeowners */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 md:p-10">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              For Homeowners
            </h3>
            <ul className="mt-6 space-y-4">
              {homeownerBenefits.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 shrink-0 text-brand-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                  <span className="text-slate-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
