'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [emergencyActive, setEmergencyActive] = useState(false);

  const isNavActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface antialiased">
      {/* Superadmin Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-sidebar-expanded bg-surface-container-lowest border-r border-outline-variant/30 z-50 flex flex-col justify-between select-none">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sidebar Header Brand */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-outline-variant/30 shrink-0 bg-slate-900 text-white">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-500 transition-colors">
                <span className="material-symbols-outlined text-[16px]">shield_person</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-sm text-white tracking-tight font-semibold">
                  Landmaka
                </span>
                <span className="text-[10px] text-indigo-300 font-mono-sm font-semibold">admin</span>
              </div>
            </Link>
            <div className="flex items-center gap-1 text-[11px] font-mono-sm">
              <span className={`w-2 h-2 rounded-full ${emergencyActive ? 'bg-amber-400 animate-ping' : 'bg-tertiary'}`} title="Cluster Status"></span>
              <span className={`text-[10px] ${emergencyActive ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                {emergencyActive ? 'LOCK' : 'PROD'}
              </span>
            </div>
          </div>

          {/* Sidebar Scrollable Nav Items */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
            {/* Control & Tenants */}
            <div className="space-y-0.5">
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/70 font-mono-sm">
                Control & Fleets
              </div>
              <nav className="space-y-0.5">
                <Link
                  href="/admin"
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isNavActive('/admin')
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">dashboard</span>
                  <span>Overview</span>
                </Link>

                <Link
                  href="/admin/businesses"
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isNavActive('/admin/businesses')
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">domain</span>
                  <span>Businesses & Fleets</span>
                </Link>

                <Link
                  href="/admin/corrections"
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isNavActive('/admin/corrections')
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px]">fact_check</span>
                    <span>Review Queue</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-error" title="Flags pending review"></span>
                </Link>
              </nav>
            </div>

            {/* Monetization & Security */}
            <div className="space-y-0.5">
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/70 font-mono-sm">
                Monetization & Security
              </div>
              <nav className="space-y-0.5">
                <Link
                  href="/admin/finances"
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isNavActive('/admin/finances')
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  <span>Finances & Charging</span>
                </Link>

                <Link
                  href="/admin/api-keys"
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isNavActive('/admin/api-keys')
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">key</span>
                  <span>API Key Vault</span>
                </Link>

                <Link
                  href="/admin/system"
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isNavActive('/admin/system')
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">terminal</span>
                  <span>Cluster & Audit Logs</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* Sidebar Minimal Switcher */}
          <div className="p-3 border-t border-outline-variant/30 space-y-1 bg-surface-container-low/30">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-primary hover:bg-primary/10 transition-colors font-medium group"
            >
              <span className="material-symbols-outlined text-[17px]">storefront</span>
              <span className="flex-1">Partner Dashboard</span>
              <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>

        {/* Sidebar Footer — Minimal Single-Line Node Telemetry */}
        <div className="px-4 py-2.5 border-t border-outline-variant/30 flex items-center justify-between text-on-surface-variant">
          <div className="flex items-center gap-2 text-[11px] font-mono-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            <span>lag-core-01</span>
          </div>
          <span className="text-[10px] font-mono-sm text-on-surface-variant/60">OSRM 14ms</span>
        </div>
      </aside>

      {/* Main Container with Top App Bar */}
      <div className="pl-sidebar-expanded">
        <header className="fixed top-0 left-sidebar-expanded right-0 h-14 bg-surface-container-lowest border-b border-outline-variant/40 z-40 px-6 flex items-center justify-between gap-6">
          {/* Left: Pilot Status & Global Scope */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-lg shadow-xs">
              <span className="material-symbols-outlined text-[16px] text-indigo-400">admin_panel_settings</span>
              <span className="font-body-sm font-semibold text-[12px] tracking-wide">PLATFORM SUPERADMIN</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-on-surface-variant font-mono-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
              <span>Lagos Metro Master Node (LOS)</span>
            </div>
          </div>

          {/* Center: Admin Global Quick Search */}
          <div className="flex-1 max-w-md">
            <div className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface-variant focus-within:border-indigo-600 focus-within:bg-surface-container-lowest transition-colors">
              <span className="material-symbols-outlined text-[16px]">search</span>
              <input
                className="bg-transparent w-full text-on-surface font-body-sm placeholder:text-on-surface-variant focus:outline-none text-xs"
                placeholder="Search business, API key prefix, merchant invoice, or rider..."
                type="text"
              />
              <kbd className="font-mono-sm text-[9px] bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant text-on-surface-variant">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right: Emergency Controls and Superadmin Profile */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => setEmergencyModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono-sm font-semibold transition-all ${
                emergencyActive
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : 'bg-surface-container-low border border-outline-variant/40 text-on-surface hover:bg-error-container hover:text-error'
              }`}
              title="Toggle API Throttle/Emergency Mode"
            >
              <span className="material-symbols-outlined text-[15px]">
                {emergencyActive ? 'lock' : 'security'}
              </span>
              <span>{emergencyActive ? 'EMERGENCY LOCK' : 'Safety Lockdown'}</span>
            </button>

            <div className="h-4 w-px bg-outline-variant/60"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-indigo-500 flex items-center justify-center text-indigo-300 font-bold text-xs">
                AS
              </div>
              <div className="flex flex-col text-left">
                <span className="font-body-sm text-[12px] font-semibold text-on-surface leading-tight">
                  Sanusi Azeem
                </span>
                <span className="font-mono-sm text-[9px] text-indigo-600 font-bold leading-tight">
                  Super Administrator
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

      {/* Emergency Lockdown Modal */}
      {emergencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/50 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-error">
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-sm font-semibold text-on-surface">
                  Platform Safety Lockdown Mode
                </h3>
                <p className="font-mono-sm text-[11px] text-on-surface-variant">
                  Global Rate Throttle & Ingestion Freeze
                </p>
              </div>
            </div>

            <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
              Activating emergency lockdown enforces strict rate-limiting (max 100 req/min across all merchants) and blocks new partner API key issuance to prevent cascade failures or DDoS incidents.
            </p>

            <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 text-xs font-mono-sm space-y-1">
              <div className="flex justify-between">
                <span>Current State:</span>
                <span className={emergencyActive ? 'text-amber-600 font-bold' : 'text-tertiary font-bold'}>
                  {emergencyActive ? 'LOCKED DOWN' : 'NORMAL OPERATIONS'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Active Merchants Protected:</span>
                <span className="font-semibold text-on-surface">6 Tenants</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEmergencyModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-xs font-medium text-on-surface"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setEmergencyActive(!emergencyActive);
                  setEmergencyModalOpen(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs ${
                  emergencyActive
                    ? 'bg-tertiary hover:bg-tertiary-container'
                    : 'bg-error hover:bg-red-700'
                }`}
              >
                {emergencyActive ? 'Deactivate Lockdown' : 'Engage Emergency Lockdown'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
