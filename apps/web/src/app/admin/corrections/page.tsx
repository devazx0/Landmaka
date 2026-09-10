'use client';

import React, { useState, useEffect } from 'react';
import {
  getAdminCorrections,
  saveAdminCorrections,
  appendAdminAuditLog,
  type AdminCorrectionItem,
} from '@/lib/admin-data';

export default function AdminCorrectionsReviewPage() {
  const [corrections, setCorrections] = useState<AdminCorrectionItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'>('PENDING_REVIEW');
  const [selectedItem, setSelectedItem] = useState<AdminCorrectionItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    setCorrections(getAdminCorrections());
  }, []);

  const filteredItems = corrections.filter((c) => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  const handleApprove = (item: AdminCorrectionItem) => {
    const updated = corrections.map((c) =>
      c.id === item.id ? { ...c, status: 'APPROVED' as const } : c
    );
    setCorrections(updated);
    saveAdminCorrections(updated);

    appendAdminAuditLog({
      adminUser: 'Azeem Sanusi',
      action: 'CORRECTION_APPROVED',
      targetEntity: `${item.landmarkText} (${item.trackingRef})`,
      details: `Superadmin approved rider correction. Location promoted to TRUSTED with updated coordinates.`,
      ipAddress: '197.210.44.18',
      level: 'INFO',
    });

    showToast(`Approved correction for ${item.trackingRef}. Address updated.`);
    if (selectedItem?.id === item.id) setSelectedItem(null);
  };

  const handleReject = (item: AdminCorrectionItem) => {
    const updated = corrections.map((c) =>
      c.id === item.id ? { ...c, status: 'REJECTED' as const } : c
    );
    setCorrections(updated);
    saveAdminCorrections(updated);

    appendAdminAuditLog({
      adminUser: 'Azeem Sanusi',
      action: 'CORRECTION_REJECTED',
      targetEntity: `${item.landmarkText} (${item.trackingRef})`,
      details: `Superadmin rejected suspicious correction (${item.driftMeters}m drift). Original pin retained.`,
      ipAddress: '197.210.44.18',
      level: 'WARN',
    });

    showToast(`Rejected correction for ${item.trackingRef}. Original pin preserved.`);
    if (selectedItem?.id === item.id) setSelectedItem(null);
  };

  return (
    <div className="p-space-lg space-y-space-lg">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-lg border border-indigo-500/40 text-xs font-mono-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-space-lg rounded-2xl shadow-xs border border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-on-surface font-semibold text-xl">
              Global Address Correction & Fraud Review Queue
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-label-caps text-[10px] font-bold border border-amber-200">
              PRD §5 FLOW D & FR10–FR12
            </span>
          </div>
          <p className="font-body-md text-on-surface-variant text-xs mt-1">
            Superadmin arbitration for suspicious pin adjustments (&gt;100m drift), conflicting gate colors, and rider accuracy corrections across all fleets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs font-mono-sm text-on-surface">
            Pending Queue: <strong className="text-error font-bold">{corrections.filter((c) => c.status === 'PENDING_REVIEW').length}</strong>
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(['PENDING_REVIEW', 'ALL', 'APPROVED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-sm transition-all ${
                statusFilter === tab
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
              }`}
            >
              {tab === 'PENDING_REVIEW' ? 'Needs Review' : tab}
            </button>
          ))}
        </div>
        <span className="text-xs font-mono-sm text-on-surface-variant">Showing {filteredItems.length} items</span>
      </div>

      {/* Grid of Flagged Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono-sm text-xs font-bold text-primary">{item.trackingRef}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono-sm ${
                    item.severity === 'CRITICAL'
                      ? 'bg-error-container text-on-error-container'
                      : item.severity === 'WARNING'
                      ? 'bg-amber-500/15 text-amber-800'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {item.conflictType.replace(/_/g, ' ')}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-xs text-on-surface line-clamp-1">{item.landmarkText}</h4>
                <div className="text-[11px] font-mono-sm text-on-surface-variant">
                  Partner: <strong className="text-on-surface">{item.businessName}</strong>
                </div>
              </div>

              {/* Side by side diff comparison */}
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs font-mono-sm space-y-2">
                <div>
                  <span className="text-[10px] text-on-surface-variant block uppercase font-label-caps">Original Customer Gate</span>
                  <div className="text-on-surface text-[11px]">{item.originalGate}</div>
                  <div className="text-[10px] text-on-surface-variant">
                    Lat/Lng: {item.originalLat}, {item.originalLng}
                  </div>
                </div>

                <div className="pt-1.5 border-t border-outline-variant/30">
                  <span className="text-[10px] text-indigo-700 block uppercase font-label-caps font-bold">
                    Rider Reported ({item.riderName})
                  </span>
                  <div className="text-indigo-950 text-[11px] font-semibold">{item.reportedGate}</div>
                  <div className="text-[10px] text-indigo-700">
                    Drift: <strong className="text-error">{item.driftMeters} meters away</strong> (FR12 alert)
                  </div>
                </div>
              </div>

              <div className="p-2 rounded bg-surface-container text-[11px] text-on-surface-variant font-body-sm italic">
                &ldquo;{item.riderNote}&rdquo;
              </div>
            </div>

            <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono-sm text-on-surface-variant">{item.timestamp}</span>

              {item.status === 'PENDING_REVIEW' ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleReject(item)}
                    className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-error-container hover:text-error text-[11px] font-semibold transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(item)}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition-colors shadow-xs"
                  >
                    Approve & Trust
                  </button>
                </div>
              ) : (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono-sm ${
                    item.status === 'APPROVED' ? 'bg-tertiary/10 text-tertiary' : 'bg-error-container text-error'
                  }`}
                >
                  {item.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
