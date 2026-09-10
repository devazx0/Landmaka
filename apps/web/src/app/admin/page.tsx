'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  getAdminBusinesses,
  getAdminPricing,
  getAdminCorrections,
  type AdminBusiness,
} from '@/lib/admin-data';
import type { MapLocation } from '@/components/MapComponent';

// Dynamically import Leaflet map component (SSR safe)
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[460px] bg-[#0b1424] rounded-xl flex items-center justify-center text-slate-400">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="font-mono-sm text-[12px] text-slate-400">Loading Lagos Master Infrastructure Map...</span>
      </div>
    </div>
  ),
});

export default function AdminOverviewPage() {
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [correctionsCount, setCorrectionsCount] = useState(0);
  const [selectedHub, setSelectedHub] = useState<'ALL' | 'SURULERE' | 'LEKKI' | 'IKEJA' | 'YABA'>('ALL');

  useEffect(() => {
    const bizList = getAdminBusinesses();
    setBusinesses(bizList);
    const corrs = getAdminCorrections();
    setCorrectionsCount(corrs.filter((c) => c.status === 'PENDING_REVIEW').length);
  }, []);

  const totalRevenue = businesses.reduce((acc, b) => acc + b.totalSpendNgn, 0);
  const totalDeliveriesToday = businesses.reduce((acc, b) => acc + b.activeDeliveriesToday, 0);
  const totalLocationsCaptured = businesses.reduce((acc, b) => acc + b.totalLocationsCaptured, 0);
  const activeBusinessesCount = businesses.filter((b) => b.status === 'ACTIVE').length;
  const suspendedBusinessesCount = businesses.filter((b) => b.status === 'SUSPENDED').length;

  // Pilot corridor locations for the admin map overview
  const adminMapLocations: MapLocation[] = [
    {
      id: 'loc_adm_1',
      latitude: 6.5012,
      longitude: 3.3581,
      landmarkText: 'Kwik Hub 01 — Surulere Central Dispatch',
      confidenceScore: 98,
      status: 'TRUSTED',
      contactName: 'Musa Ibrahim (Kwik)',
    },
    {
      id: 'loc_adm_2',
      latitude: 6.4474,
      longitude: 3.4731,
      landmarkText: 'GIGL Hub 04 — Lekki Phase 1 Corridor',
      confidenceScore: 96,
      status: 'TRUSTED',
      contactName: 'Emeka Nwosu (GIGL)',
    },
    {
      id: 'loc_adm_3',
      latitude: 6.5923,
      longitude: 3.3562,
      landmarkText: 'MAX Fleet Hub — Ikeja GRA Express',
      confidenceScore: 54,
      status: 'FLAGGED',
      contactName: 'Sunday Oladipo (MAX)',
    },
    {
      id: 'loc_adm_4',
      latitude: 6.5186,
      longitude: 3.3745,
      landmarkText: 'Chowdeck Hub — Yaba Tech Food Corridor',
      confidenceScore: 92,
      status: 'TRUSTED',
      contactName: 'Ibrahim Saliu (Chowdeck)',
    },
    {
      id: 'loc_adm_5',
      latitude: 6.4281,
      longitude: 3.4219,
      landmarkText: 'Gokada Express Hub — Victoria Island Extension',
      confidenceScore: 90,
      status: 'TRUSTED',
      contactName: 'Kemi Adeyemi (Gokada)',
    },
  ];

  return (
    <div className="p-space-lg space-y-space-lg">
      {/* Top Banner: Mission Control Header & Superadmin Context */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-container-lowest p-space-lg rounded-2xl shadow-xs border border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <h1 className="font-headline-lg text-on-surface font-semibold text-xl">
              Superadmin Mission Control
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono-sm text-[10px] font-bold border border-indigo-200">
              CLUSTER: LAGOS-METRO-PROD
            </span>
          </div>
          <p className="font-body-md text-on-surface-variant text-xs mt-1">
            Global management of Nigerian address resolution infrastructure, multi-tenant fleet billing, rate metering, and fraud mitigation.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/finances"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-xs font-medium text-on-surface border border-outline-variant/30 transition-all"
          >
            <span className="material-symbols-outlined text-[16px] text-tertiary">tune</span>
            <span>Adjust Charging Rates</span>
          </Link>
          <Link
            href="/admin/businesses"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">domain_add</span>
            <span>Manage Businesses</span>
          </Link>
        </div>
      </div>

      {/* Critical Alert Bar */}
      {(suspendedBusinessesCount > 0 || correctionsCount > 0) && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[20px] text-amber-600 shrink-0">notifications_active</span>
            <div>
              <span className="font-bold">Administrative Attention Required:</span>{' '}
              <span>
                {suspendedBusinessesCount > 0 && `${suspendedBusinessesCount} business is currently suspended. `}
                {correctionsCount > 0 && `${correctionsCount} rider address corrections require superadmin fraud/conflict review.`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {correctionsCount > 0 && (
              <Link
                href="/admin/corrections"
                className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-medium transition-colors"
              >
                Review Flags ({correctionsCount})
              </Link>
            )}
            {suspendedBusinessesCount > 0 && (
              <Link
                href="/admin/businesses"
                className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 hover:bg-amber-200 font-medium transition-colors border border-amber-300"
              >
                View Suspended
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Executive Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Businesses */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-xs font-medium uppercase font-label-caps">Platform Businesses</span>
            <span className="material-symbols-outlined text-[20px] text-indigo-600">domain</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-headline-lg text-on-surface">{businesses.length}</span>
            <span className="text-xs font-mono-sm text-tertiary font-medium">
              {activeBusinessesCount} active
            </span>
          </div>
          <div className="text-[11px] text-on-surface-variant flex items-center justify-between pt-1 border-t border-outline-variant/20 font-mono-sm">
            <span>Suspended / Inactive:</span>
            <span className="font-bold text-error">{suspendedBusinessesCount}</span>
          </div>
        </div>

        {/* Deliveries Today */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-xs font-medium uppercase font-label-caps">Active Deliveries Today</span>
            <span className="material-symbols-outlined text-[20px] text-primary">local_shipping</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-headline-lg text-on-surface">
              {totalDeliveriesToday.toLocaleString()}
            </span>
            <span className="text-xs font-mono-sm text-tertiary font-medium">Flow B Live</span>
          </div>
          <div className="text-[11px] text-on-surface-variant flex items-center justify-between pt-1 border-t border-outline-variant/20 font-mono-sm">
            <span>Rider Call Reduction:</span>
            <span className="font-bold text-tertiary">-68.4% (PRD §8)</span>
          </div>
        </div>

        {/* Gross Platform Revenue */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-xs font-medium uppercase font-label-caps">Gross Platform Volume</span>
            <span className="material-symbols-outlined text-[20px] text-tertiary">payments</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-headline-lg text-on-surface">
              ₦{(totalRevenue / 1000000).toFixed(2)}M
            </span>
            <span className="text-xs font-mono-sm text-tertiary font-medium">LTD</span>
          </div>
          <div className="text-[11px] text-on-surface-variant flex items-center justify-between pt-1 border-t border-outline-variant/20 font-mono-sm">
            <span>Avg Revenue / Partner:</span>
            <span className="font-bold text-on-surface">₦{((totalRevenue / (businesses.length || 1)) / 1000).toFixed(0)}k</span>
          </div>
        </div>

        {/* Location Database Size */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-xs font-medium uppercase font-label-caps">PostGIS Address Pool</span>
            <span className="material-symbols-outlined text-[20px] text-indigo-600">pin_drop</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-headline-lg text-on-surface">
              {totalLocationsCaptured.toLocaleString()}
            </span>
            <span className="text-xs font-mono-sm text-tertiary font-medium">Indexed</span>
          </div>
          <div className="text-[11px] text-on-surface-variant flex items-center justify-between pt-1 border-t border-outline-variant/20 font-mono-sm">
            <span>Trusted Status Rate:</span>
            <span className="font-bold text-tertiary">84.2%</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Master Map & Top Fleets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Master Infrastructure Map */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/30 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-outline-variant/30">
            <div>
              <h2 className="font-headline-sm text-sm font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-[18px]">map</span>
                <span>Lagos Multi-Tenant Logistics Corridors</span>
              </h2>
              <p className="font-mono-sm text-[11px] text-on-surface-variant">
                Live OSRM routing hubs across Surulere, Lekki, Ikeja, and Yaba
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono-sm text-on-surface-variant">Hub:</span>
              {(['ALL', 'SURULERE', 'LEKKI', 'IKEJA'] as const).map((h) => (
                <button
                  key={h}
                  onClick={() => setSelectedHub(h)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono-sm transition-all ${
                    selectedHub === h
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-[450px] rounded-xl overflow-hidden border border-outline-variant/30 relative">
            <MapComponent locations={adminMapLocations} />
          </div>

          <div className="flex items-center justify-between text-xs text-on-surface-variant font-mono-sm pt-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span> Trusted Pin
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-error"></span> Flagged / Drift Conflict
              </span>
            </div>
            <span>Routing Engine: OSRM OpenStreetMap Nigeria v2026.1</span>
          </div>
        </div>

        {/* Right 1 Col: Top Businesses & Fleet Health */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/30 p-4 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
              <h2 className="font-headline-sm text-sm font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">domain</span>
                <span>Active Business Fleets</span>
              </h2>
              <Link
                href="/admin/businesses"
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
              >
                All ({businesses.length})
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </Link>
            </div>

            <div className="divide-y divide-outline-variant/20 mt-2">
              {businesses.slice(0, 5).map((biz) => (
                <div key={biz.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-xs text-on-surface truncate">{biz.name}</span>
                      <span
                        className={`text-[9px] font-mono-sm px-1.5 py-0.2 rounded font-semibold ${
                          biz.status === 'ACTIVE'
                            ? 'bg-tertiary/10 text-tertiary'
                            : 'bg-error-container text-on-error-container'
                        }`}
                      >
                        {biz.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-mono-sm mt-0.5">
                      <span>{biz.tier}</span>
                      <span>•</span>
                      <span>{biz.activeDeliveriesToday} runs today</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono-sm font-semibold text-on-surface">
                      ₦{(biz.walletBalanceNgn).toLocaleString()}
                    </div>
                    <span className="text-[9px] text-on-surface-variant font-mono-sm">Wallet Balance</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Admin Action Box */}
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
            <div className="flex items-center gap-2 text-indigo-900 font-semibold text-xs">
              <span className="material-symbols-outlined text-[18px] text-indigo-700">security_update_good</span>
              <span>Platform Charging Model</span>
            </div>
            <p className="text-[11px] text-indigo-950 leading-relaxed font-body-sm">
              Standard per-capture rate: <strong className="font-mono-sm">₦25.00</strong>. High-volume partners (Kwik, GIGL) utilize negotiated custom tiers.
            </p>
            <Link
              href="/admin/finances"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900"
            >
              <span>Manage pricing overrides</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Live API Telemetry Ingestion Feed */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/30 overflow-hidden">
        <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            <h3 className="font-semibold text-sm text-on-surface">Live Partner Ingestion Stream (Audit & Dispatch)</h3>
          </div>
          <span className="text-xs font-mono-sm text-on-surface-variant">Cluster: lag-edge-01.ng (14ms latency)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-sm">
            <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/30 uppercase text-[10px]">
              <tr>
                <th className="px-4 py-2.5">Timestamp</th>
                <th className="px-4 py-2.5">Partner Merchant</th>
                <th className="px-4 py-2.5">API Endpoint</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Latency</th>
                <th className="px-4 py-2.5">Geohash / Corridor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-on-surface">
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="px-4 py-2 text-on-surface-variant">Just now</td>
                <td className="px-4 py-2 font-medium text-primary">Kwik Delivery Nigeria</td>
                <td className="px-4 py-2">POST /api/v1/routing/optimize</td>
                <td className="px-4 py-2">
                  <span className="px-2 py-0.5 rounded bg-tertiary/10 text-tertiary font-bold">200 OK</span>
                </td>
                <td className="px-4 py-2 text-on-surface-variant">18ms</td>
                <td className="px-4 py-2">Surulere / LOS</td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="px-4 py-2 text-on-surface-variant">12s ago</td>
                <td className="px-4 py-2 font-medium text-primary">GIG Logistics (GIGL)</td>
                <td className="px-4 py-2">POST /api/v1/locations/capture</td>
                <td className="px-4 py-2">
                  <span className="px-2 py-0.5 rounded bg-tertiary/10 text-tertiary font-bold">201 CREATED</span>
                </td>
                <td className="px-4 py-2 text-on-surface-variant">24ms</td>
                <td className="px-4 py-2">Lekki Phase 1 / LOS</td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="px-4 py-2 text-on-surface-variant">34s ago</td>
                <td className="px-4 py-2 font-medium text-primary">Chowdeck Delivery</td>
                <td className="px-4 py-2">POST /api/v1/proof-of-delivery</td>
                <td className="px-4 py-2">
                  <span className="px-2 py-0.5 rounded bg-tertiary/10 text-tertiary font-bold">200 OK</span>
                </td>
                <td className="px-4 py-2 text-on-surface-variant">31ms</td>
                <td className="px-4 py-2">Yaba Tech / LOS</td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="px-4 py-2 text-on-surface-variant">1m ago</td>
                <td className="px-4 py-2 font-medium text-primary">MAX.ng Courier</td>
                <td className="px-4 py-2">POST /api/v1/corrections</td>
                <td className="px-4 py-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-800 font-bold">202 FLAGGED</span>
                </td>
                <td className="px-4 py-2 text-on-surface-variant">29ms</td>
                <td className="px-4 py-2">Ikeja GRA / LOS (Drift &gt;100m)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
