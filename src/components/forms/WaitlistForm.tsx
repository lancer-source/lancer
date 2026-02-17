'use client';

import { useState, FormEvent } from 'react';

interface WaitlistFormProps {
  variant?: 'hero' | 'section';
  theme?: 'light' | 'dark';
  className?: string;
}

export function WaitlistForm({
  variant = 'section',
  theme = 'light',
  className = '',
}: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const isDark = theme === 'dark';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      setStatus('success');
      setEmail('');
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div
          className={`flex items-center gap-2 rounded-full px-5 py-3 ${
            isDark
              ? 'bg-brand-500/20 text-brand-300'
              : 'bg-brand-50 text-brand-700'
          }`}
        >
          <svg
            className="h-5 w-5"
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
          <span className="text-sm font-medium">
            You&apos;re on the list. We&apos;ll be in touch.
          </span>
        </div>
      </div>
    );
  }

  const isHero = variant === 'hero';

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div
        className={`flex gap-3 ${
          isHero ? 'flex-col sm:flex-row' : 'flex-col sm:flex-row'
        }`}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'error') setStatus('idle');
          }}
          placeholder="Enter your email"
          className={`flex-1 rounded-full border bg-white px-5 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
            isDark ? 'border-white/20' : 'border-slate-300'
          } ${isHero ? 'sm:min-w-[300px]' : ''}`}
          disabled={status === 'loading'}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="rounded-full bg-brand-600 px-8 py-3 text-base font-medium text-white transition-all hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap"
        >
          {status === 'loading' ? 'Joining...' : 'Get Early Access'}
        </button>
      </div>

      {status === 'error' && errorMessage && (
        <p className={`mt-2 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
          {errorMessage}
        </p>
      )}

      <p className={`mt-3 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        Free to join. No spam, ever.
      </p>
    </form>
  );
}
