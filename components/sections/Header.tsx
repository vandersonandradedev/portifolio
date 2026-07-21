'use client';

import { useState } from 'react';

const LINKS = [
  { href: '#home', label: 'Início' },
  { href: '#about', label: 'Sobre' },
  { href: '#projects', label: 'Projetos' },
  { href: '#skills', label: 'Stack' },
  { href: '#experience', label: 'Experiência' },
  { href: '#contact', label: 'Contato' }
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-axion/15 bg-[#03070a]/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <a href="#home" className="font-display text-lg font-semibold text-axion">
          Vanderson<span className="text-ink">Dev</span>
        </a>
        <nav className="hidden gap-5 md:flex" aria-label="Principal">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono text-xs uppercase tracking-wider text-muted transition hover:text-axion"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="border border-axion/30 px-2 py-1 font-mono text-xs text-axion md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          Menu
        </button>
      </div>
      {open ? (
        <nav className="border-t border-axion/10 px-6 py-3 md:hidden" aria-label="Mobile">
          <ul className="space-y-2">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-mono text-sm text-muted"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
