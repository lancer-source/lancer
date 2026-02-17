export function HowItWorksSection() {
  const steps = [
    {
      number: '1',
      title: 'Create Your Profile',
      description:
        'Showcase your skills, experience, and service area. Set your own hourly rates. Takes 5 minutes.',
      icon: (
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      ),
    },
    {
      number: '2',
      title: 'Connect with Homeowners',
      description:
        'Browse jobs nearby or let homeowners find you. Accept the ones that match your skills and schedule.',
      icon: (
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      ),
    },
    {
      number: '3',
      title: 'Get Paid Directly',
      description:
        'Complete the work, receive secure payment. No middleman fees. Build lasting client relationships.',
      icon: (
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="bg-slate-50 py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Get started in minutes. Start earning on your terms.
          </p>
        </div>

        <div className="relative mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative text-center">
              {/* Connector line between steps (desktop only) */}
              {index < steps.length - 1 && (
                <div className="absolute top-10 left-[calc(50%+48px)] hidden h-px w-[calc(100%-96px)] bg-slate-300 md:block" />
              )}

              {/* Step icon */}
              <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm ring-1 ring-slate-200">
                {step.icon}
              </div>

              {/* Step label */}
              <div className="mb-2 text-sm font-semibold text-brand-600">
                Step {step.number}
              </div>

              <h3 className="text-xl font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mx-auto mt-3 max-w-xs text-base leading-relaxed text-slate-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
