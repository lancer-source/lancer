'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'border-b border-slate-200 bg-white/80 backdrop-blur-lg'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link
          href="/"
          className="text-3xl font-bold tracking-tight text-brand-600 font-display"
        >
          Lancer
        </Link>

        <a
          href="#waitlist"
          className="rounded-full bg-brand-600 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-brand-700"
        >
          Join Waitlist
        </a>
      </nav>
    </header>
  );
}
