'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isNavActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface antialiased">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-sidebar-expanded bg-surface-container-lowest border-r border-outline-variant/30 z-50 flex flex-col justify-between select-none">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sidebar Header Brand */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-outline-variant/30 shrink-0">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-xs group-hover:bg-primary/90 transition-colors">
                <span className="material-symbols-outlined text-[16px]">location_searching</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-sm text-on-surface tracking-tight font-semibold">
                  Landmaka
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono-sm">ops</span>
              </div>
            </Link>
            <div className="flex items-center gap-1.5 text-xs font-mono-sm text-on-surface-variant" title="Lagos Metro Pilot Live">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
            </div>
          </div>

          {/* Sidebar Scrollable Nav Items */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
            {/* Operations Group */}
            <div className="space-y-0.5">
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/70 font-mono-sm">
                Operations
              </div>
              <nav className="space-y-0.5">
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isNavActive('/dashboard')
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>
                  <span>Overview</span>
                </Link>

                <Link
                  href="/dashboard/locations"
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isNavActive('/dashboard/locations')
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">pin_drop</span>
                  <span>Captured Locations</span>
                </Link>

                <Link
                  href="/dashboard/routes"
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isNavActive('/dashboard/routes')
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">alt_route</span>
                  <span>Route Optimizer</span>
                </Link>

                <Link
                  href="/dashboard/deliveries"
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isNavActive('/dashboard/deliveries')
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                  <span>Deliveries & Dispatch</span>
                </Link>

                <Link
                  href="/dashboard/proof-of-delivery"
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isNavActive('/dashboard/proof-of-delivery')
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Proof of Delivery</span>
                </Link>
              </nav>
            </div>

            {/* Quality & SLAs */}
            <div className="space-y-0.5">
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/70 font-mono-sm">
                Quality & Review
              </div>
              <nav className="space-y-0.5">
                <Link
                  href="/dashboard/corrections"
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isNavActive('/dashboard/corrections')
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px]">edit_location</span>
                    <span>Correction Loop</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-error" title="1 Flag"></span>
                </Link>

                <Link
                  href="/dashboard/metrics"
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isNavActive('/dashboard/metrics')
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">insights</span>
                  <span>Pilot SLA Metrics</span>
                </Link>
              </nav>
            </div>

            {/* Integration & Developer */}
            <div className="space-y-0.5">
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/70 font-mono-sm">
                Integration
              </div>
              <nav className="space-y-0.5">
                <Link
                  href="/dashboard/api-keys"
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isNavActive('/dashboard/api-keys')
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">key</span>
                  <span>API Keys & Auth</span>
                </Link>

                <Link
                  href="/dashboard/webhooks"
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isNavActive('/dashboard/webhooks')
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">webhook</span>
                  <span>Webhooks</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* Sidebar Minimal Switcher */}
          <div className="p-3 border-t border-outline-variant/30 space-y-1 bg-surface-container-low/30">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-indigo-700 hover:bg-indigo-50 transition-colors font-medium group"
            >
              <span className="material-symbols-outlined text-[17px] text-indigo-600">shield_person</span>
              <span className="flex-1">Admin Console</span>
              <span className="material-symbols-outlined text-[14px] text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>

        {/* Sidebar Footer — Minimal Single-Line Node Telemetry */}
        <div className="px-4 py-2.5 border-t border-outline-variant/30 flex items-center justify-between text-on-surface-variant">
          <div className="flex items-center gap-2 text-[11px] font-mono-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            <span>lag-edge-01</span>
          </div>
          <span className="text-[10px] font-mono-sm text-on-surface-variant/60">v1.1</span>
        </div>
      </aside>

      {/* Main Container with Clean Top App Bar */}
      <div className="pl-sidebar-expanded">
        {/* CLEAN, MINIMAL TOP HEADER */}
        <header className="fixed top-0 left-sidebar-expanded right-0 h-14 bg-surface-container-lowest border-b border-outline-variant/40 z-40 px-6 flex items-center justify-between gap-6">
          {/* Left: Clean Location Hub Indicator */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-low border border-outline-variant/30 rounded-lg">
              <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
              <span className="font-body-sm font-medium text-on-surface">Lagos Hub (LOS)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary ml-1" title="Operational"></span>
            </div>
          </div>

          {/* Center: Clean Search Bar with ⌘K */}
          <div className="flex-1 max-w-md">
            <div className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface-variant focus-within:border-primary focus-within:bg-surface-container-lowest transition-colors">
              <span className="material-symbols-outlined text-[16px]">search</span>
              <input
                className="bg-transparent w-full text-on-surface font-body-sm placeholder:text-on-surface-variant focus:outline-none"
                placeholder="Search packages, landmarks, gates, or geohashes..."
                type="text"
              />
              <kbd className="font-mono-sm text-[10px] bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant text-on-surface-variant">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right: Clean Status and Profile */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-mono-sm">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              <span>Operational</span>
            </div>

            <Link
              href="/admin"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors"
              title="Switch to Superadmin Mission Control"
            >
              <span className="material-symbols-outlined text-[15px]">shield_person</span>
              <span>Admin Console</span>
            </Link>

            <div className="h-4 w-px bg-outline-variant/60"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-body-sm text-[12px] font-medium text-on-surface leading-tight">
                  Sanusi Azeem
                </span>
                <span className="font-mono-sm text-[10px] text-on-surface-variant leading-tight">
                  Lead Dispatch
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="w-full pt-14 min-h-screen bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
