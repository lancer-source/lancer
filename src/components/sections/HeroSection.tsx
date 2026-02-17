import { WaitlistForm } from '@/components/forms/WaitlistForm';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-50/50 to-white" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Launch badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 ring-1 ring-brand-100">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Launching 2026
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 md:text-7xl">
            Your Skills.
            <br />
            Your Income.
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg leading-relaxed text-slate-600 md:text-xl">
            Connect directly with homeowners who need your expertise.{' '}
            <span className="font-medium text-slate-900">
              Set your own rates. Work your own schedule.
            </span>{' '}
            No middleman taking your earnings.
          </p>

          {/* Email capture */}
          <div className="mt-10" id="waitlist">
            <WaitlistForm variant="hero" className="mx-auto max-w-lg" />
          </div>
        </div>
      </div>
    </section>
  );
}
