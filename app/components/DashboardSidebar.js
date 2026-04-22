'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: '/dashboard/wins',
    label: 'Daily Wins',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    href: '/dashboard/one-on-ones',
    label: '1-on-1s',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/dashboard/wishlist',
    label: 'Wishlist',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/goals',
    label: 'Goals',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    href: '/dashboard/wins/export',
    label: 'Export',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="db-topbar">
        <Link href="/dashboard" className="db-topbar-logo" onClick={close}>
          ted<span>.</span>
        </Link>
        <button
          className={`db-hamburger${open ? ' open' : ''}`}
          aria-label="Toggle sidebar"
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Overlay */}
      <div
        className={`db-overlay${open ? ' open' : ''}`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className={`db-sidebar${open ? ' open' : ''}`}>
        <div className="db-sidebar-inner">

          <div className="db-logo-wrap">
            <Link href="/dashboard" className="db-logo" onClick={close}>
              ted<span>.</span>
            </Link>
            <span className="db-logo-sub">dashboard</span>
          </div>

          <nav className="db-nav">
            <div className="db-nav-label">Navigation</div>
            <ul>
              {navItems.map(({ href, label, icon }) => {
                const active = pathname === href;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`db-nav-link${active ? ' active' : ''}`}
                      onClick={close}
                    >
                      <span className="db-nav-icon">{icon}</span>
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="db-sidebar-footer">
            <Link href="/" className="db-back-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back to site
            </Link>
          </div>

        </div>
      </aside>
    </>
  );
}
