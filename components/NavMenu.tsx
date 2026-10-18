'use client';

import Link from 'next/link';
import { useState } from 'react';

const LINKS = [
  { href: '/', label: 'Practice' },
  { href: '/verbs', label: 'Verbs' },
  { href: '/prepositions', label: 'Prepositions' },
];

export function NavMenu() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="relative border-b border-slate-200 dark:border-slate-800">
      <div className="mx-auto flex max-w-6xl items-center gap-5 px-4 py-3 text-sm">
        <Link href="/" className="font-semibold">
          Deutsch Lehrer
        </Link>

        <div className="hidden gap-5 lg:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
              {l.label}
            </Link>
          ))}
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
          aria-expanded={open}
          className="ml-auto -mr-2 px-2 py-1 text-2xl leading-none lg:hidden"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div className="absolute inset-x-0 top-full z-10 border-b border-slate-200 bg-white lg:hidden dark:border-slate-800 dark:bg-slate-950">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-base hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
