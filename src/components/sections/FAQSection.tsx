'use client';

import { useState } from 'react';

const faqs = [
  {
    question: 'What types of jobs are available?',
    answer:
      'Everything from basic repairs to skilled trades — plumbing, electrical, carpentry, painting, general handyman work, landscaping, and more. You choose what fits your expertise.',
  },
  {
    question: 'Do I need a license?',
    answer:
      "It depends on the work and your location. Simple tasks like furniture assembly or painting usually don't require licensing. Specialized trades like electrical or plumbing may. You'll only see jobs you're qualified for.",
  },
  {
    question: 'What does Lancer cost?',
    answer:
      "We're designing Lancer to keep fees minimal — significantly lower than traditional agencies and platforms. You'll know the exact cost structure before you join. Our goal is for you to keep more of what you earn.",
  },
  {
    question: 'When does Lancer launch?',
    answer:
      "We're targeting Q2 2026 for our beta launch. Join the waitlist to get early access in your area and help shape the platform.",
  },
  {
    question: 'Can I work part-time?',
    answer:
      'Absolutely. Lancer is perfect for anyone seeking flexible income — retirees, students, side-hustlers, or anyone who wants to work on their own terms. There are no minimum hour requirements.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-slate-50 py-20 md:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Questions &amp; answers
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Everything you need to know about Lancer.
          </p>
        </div>

        <div className="mt-12 divide-y divide-slate-200">
          {faqs.map((faq, index) => (
            <div key={index} className="py-6">
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="flex w-full items-center justify-between text-left"
              >
                <span className="pr-4 text-lg font-medium text-slate-900">
                  {faq.question}
                </span>
                <svg
                  className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
              <div
                className={`grid transition-all duration-200 ${
                  openIndex === index
                    ? 'mt-4 grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="text-base leading-relaxed text-slate-600">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
