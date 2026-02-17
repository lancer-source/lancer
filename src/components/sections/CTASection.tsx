import { WaitlistForm } from '@/components/forms/WaitlistForm';

export function CTASection() {
  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-16 text-center md:px-16 md:py-24">
          {/* Subtle gradient decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-transparent to-brand-600/10" />

          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              Ready to work on your terms?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
              Join the waitlist and be among the first to access Lancer when we
              launch. Early members get priority.
            </p>
            <div className="mt-10 flex justify-center">
              <WaitlistForm
                variant="hero"
                theme="dark"
                className="w-full max-w-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
