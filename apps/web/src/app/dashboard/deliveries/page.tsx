'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { INITIAL_DELIVERIES, type DeliveryRecord } from '@/lib/dashboard-data';
import { useDeliveries } from '@/services/dashboard/hook';

export default function DeliveriesPage() {
  const { data: serverDeliveries } = useDeliveries();

  const deliveries: DeliveryRecord[] = useMemo(() => {
    if (serverDeliveries && serverDeliveries.length > 0) {
      return serverDeliveries.map((d, idx) => ({
        id: d.id,
        trackingReference: d.trackingReference || d.externalOrderId || `KWK-LOS-${1000 + idx}`,
        recipientName: d.recipientName || 'Recipient',
        landmarkText: d.landmarkText || 'Lagos Destination',
        gateDescription: d.gateDescription || 'Standard gate entrance',
        latitude: 6.4474,
        longitude: 3.4731,
        riderName: d.riderName || 'Pool Dispatcher',
        riderVehicle: d.riderVehicle || 'Motorcycle',
        status: (d.status === 'IN_TRANSIT' ? 'EN_ROUTE' : d.status === 'PENDING' ? 'ASSIGNED' : d.status) as any,
        confidenceScore: d.confidenceScore ?? 90,
        statusCategory: (d.confidenceScore && d.confidenceScore >= 80 ? 'TRUSTED' : 'UNVERIFIED') as any,
        timeAgo: d.timeAgo || new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        callAttempts: d.riderCallsCount || 0,
        podPhotoUrl: d.podPhotoUrl,
        otpVerified: d.otpVerified,
      }));
    }
    return INITIAL_DELIVERIES;
  }, [serverDeliveries]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DELIVERED' | 'EN_ROUTE' | 'ASSIGNED' | 'FAILED'>('ALL');

  const filtered = deliveries.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.trackingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.landmarkText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.riderName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-space-lg space-y-space-lg">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-on-surface font-semibold">Deliveries & Dispatch</h1>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-caps text-[10px]">
              PRD Flow B & C
            </span>
          </div>
          <p className="font-body-md text-on-surface-variant text-sm mt-1">
            Real-time delivery status, rider assignment, and proof-of-delivery logging across Lagos metro.
          </p>
        </div>

        <Link
          href="/dashboard/proof-of-delivery"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-body-sm font-medium shadow-xs transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>Log Proof of Delivery</span>
        </Link>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tracking #, recipient, rider, landmark..."
            className="w-full pl-9 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-surface-container-lowest border border-outline-variant/40 p-1 rounded-lg shadow-xs overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              statusFilter === 'ALL' ? 'bg-primary text-on-primary font-semibold' : 'text-on-surface-variant'
            }`}
          >
            All ({deliveries.length})
          </button>
          <button
            onClick={() => setStatusFilter('EN_ROUTE')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              statusFilter === 'EN_ROUTE' ? 'bg-primary text-on-primary font-semibold' : 'text-on-surface-variant'
            }`}
          >
            En Route
          </button>
          <button
            onClick={() => setStatusFilter('DELIVERED')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              statusFilter === 'DELIVERED' ? 'bg-tertiary text-on-tertiary font-semibold' : 'text-on-surface-variant'
            }`}
          >
            Delivered
          </button>
          <button
            onClick={() => setStatusFilter('ASSIGNED')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              statusFilter === 'ASSIGNED' ? 'bg-secondary text-on-secondary font-semibold' : 'text-on-surface-variant'
            }`}
          >
            Assigned
          </button>
          <button
            onClick={() => setStatusFilter('FAILED')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              statusFilter === 'FAILED' ? 'bg-error text-on-error font-semibold' : 'text-error'
            }`}
          >
            Failed
          </button>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body-sm">
            <thead>
              <tr className="bg-surface-container-low font-label-caps text-on-surface-variant border-b border-outline-variant/30">
                <th className="py-3 px-4">DISPATCH ID</th>
                <th className="py-3 px-4">TRACKING REF</th>
                <th className="py-3 px-4">RECIPIENT & DESTINATION</th>
                <th className="py-3 px-4">COURIER</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">CONFIDENCE</th>
                <th className="py-3 px-4">CALLS</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-surface-container-low/50 transition-colors ${
                    item.status === 'FAILED' ? 'bg-error-container/10' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-mono-sm font-semibold text-primary">
                    #{item.id}
                  </td>
                  <td className="py-3.5 px-4 font-mono-sm text-xs font-medium text-on-surface">
                    {item.trackingReference}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex flex-col">
                      <span className="font-semibold text-on-surface">{item.recipientName}</span>
                      <span className="text-on-surface-variant text-[11px] truncate">{item.landmarkText}</span>
                      {item.gateDescription && (
                        <span className="text-secondary text-[10px] truncate">{item.gateDescription}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-mono-sm text-[10px] font-bold">
                        {item.riderName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-on-surface">{item.riderName}</span>
                        <span className="text-[10px] text-on-surface-variant">{item.riderVehicle}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {item.status === 'DELIVERED' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-label-caps text-[10px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                        DELIVERED
                      </span>
                    )}
                    {item.status === 'EN_ROUTE' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-caps text-[10px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        EN ROUTE
                      </span>
                    )}
                    {item.status === 'ASSIGNED' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-caps text-[10px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                        ASSIGNED
                      </span>
                    )}
                    {item.status === 'FAILED' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-caps text-[10px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                        FAILED
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono-sm text-xs">
                    <span
                      className={`font-semibold ${
                        item.statusCategory === 'FLAGGED'
                          ? 'text-error'
                          : item.statusCategory === 'TRUSTED'
                          ? 'text-tertiary'
                          : 'text-amber-600'
                      }`}
                    >
                      {item.confidenceScore}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono-sm text-xs text-on-surface-variant">
                    {item.callAttempts} calls
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {item.status === 'DELIVERED' ? (
                      <Link
                        href="/dashboard/proof-of-delivery"
                        className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-tertiary font-label-caps transition-colors font-semibold"
                      >
                        Receipt
                      </Link>
                    ) : item.statusCategory === 'FLAGGED' ? (
                      <Link
                        href="/dashboard/corrections"
                        className="px-2.5 py-1 rounded bg-error-container text-on-error-container hover:bg-error/20 font-label-caps transition-colors font-bold"
                      >
                        Resolve
                      </Link>
                    ) : (
                      <Link
                        href="/dashboard/routes"
                        className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-primary font-label-caps transition-colors font-semibold"
                      >
                        Track
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
