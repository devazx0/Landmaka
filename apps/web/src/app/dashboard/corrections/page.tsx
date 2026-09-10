'use client';

import React, { useState, useMemo } from 'react';
import { useCorrections } from '@/services/dashboard/hook';

interface CorrectionAuditItem {
  id: string;
  deliveryRef: string;
  landmarkText: string;
  originalGate: string;
  reportedGate: string;
  pinDriftMeters: number;
  riderName: string;
  riderConfidence: number;
  type: 'GATE_CONFLICT' | 'PIN_DRIFT_ALERT' | 'CONFIRMATION';
  status: 'PENDING_REVIEW' | 'ACCEPTED' | 'REJECTED';
  timestamp: string;
}

const INITIAL_CORRECTIONS: CorrectionAuditItem[] = [
  {
    id: 'cor_01',
    deliveryRef: 'KWK-LOS-9924',
    landmarkText: 'Ikeja GRA (Behind Zenith Bank, Isaac John St)',
    originalGate: 'Black gate with spike fence',
    reportedGate: 'Blue gate. Small tailor shop right beside gate entrance',
    pinDriftMeters: 45,
    riderName: 'Sunday Oladipo',
    riderConfidence: 54,
    type: 'GATE_CONFLICT',
    status: 'PENDING_REVIEW',
    timestamp: '51m ago',
  },
  {
    id: 'cor_02',
    deliveryRef: 'KWK-LOS-9918',
    landmarkText: 'Off Freedom Way, near Dome Church, Lekki',
    originalGate: 'White painted perimeter wall',
    reportedGate: 'White perimeter wall verified. Pin was 240m east of actual gate',
    pinDriftMeters: 240,
    riderName: 'Babatunde Alabi',
    riderConfidence: 61,
    type: 'PIN_DRIFT_ALERT',
    status: 'PENDING_REVIEW',
    timestamp: '2 hours ago',
  },
  {
    id: 'cor_03',
    deliveryRef: 'KWK-LOS-9922',
    landmarkText: 'Opposite TotalEnergies Station, Admiralty Way, Lekki Phase 1',
    originalGate: 'Black security gate with intercom buzzer',
    reportedGate: 'Gate confirmed accurate (3rd independent confirmation)',
    pinDriftMeters: 5,
    riderName: 'Emeka Nwosu',
    riderConfidence: 98,
    type: 'CONFIRMATION',
    status: 'ACCEPTED',
    timestamp: '4 hours ago',
  },
];

export default function CorrectionLoopPage() {
  const { data: serverCorrections } = useCorrections();
  const [localStatuses, setLocalStatuses] = useState<Record<string, 'ACCEPTED' | 'REJECTED'>>({});
  const [activeTab, setActiveTab] = useState<'PENDING' | 'RESOLVED'>('PENDING');

  const items: CorrectionAuditItem[] = useMemo(() => {
    if (serverCorrections && serverCorrections.length > 0) {
      return serverCorrections.map((c, idx) => ({
        id: c.id,
        deliveryRef: c.deliveryRef || `KWK-LOS-${9920 + idx}`,
        landmarkText: c.landmarkText || 'Lagos Address',
        originalGate: c.originalGate || 'Standard gate entrance',
        reportedGate: c.reportedGate || 'Updated gate notes from rider',
        pinDriftMeters: c.pinDriftMeters || 12,
        riderName: c.riderName || 'Field Rider',
        riderConfidence: c.riderConfidence || 85,
        type: c.type || 'CONFIRMATION',
        status: localStatuses[c.id] || c.status || 'PENDING_REVIEW',
        timestamp: c.timestamp || new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
    }
    return INITIAL_CORRECTIONS.map((item) => ({
      ...item,
      status: localStatuses[item.id] || item.status,
    }));
  }, [serverCorrections, localStatuses]);

  const handleAccept = (id: string) => {
    setLocalStatuses((prev) => ({ ...prev, [id]: 'ACCEPTED' }));
  };

  const handleReject = (id: string) => {
    setLocalStatuses((prev) => ({ ...prev, [id]: 'REJECTED' }));
  };

  const pendingItems = items.filter((i) => i.status === 'PENDING_REVIEW');
  const resolvedItems = items.filter((i) => i.status !== 'PENDING_REVIEW');
  const displayItems = activeTab === 'PENDING' ? pendingItems : resolvedItems;

  return (
    <div className="p-space-lg space-y-space-lg">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-on-surface font-semibold">Location Correction Loop & Audit</h1>
            <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-caps text-[10px]">
              PRD Flow D (FR10-FR12)
            </span>
          </div>
          <p className="font-body-md text-on-surface-variant text-sm mt-1">
            Post-delivery rider accuracy validation, conflict resolution, and pin drift threshold review.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'PENDING'
                ? 'bg-primary text-on-primary font-semibold shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant'
            }`}
          >
            Review Queue ({pendingItems.length})
          </button>
          <button
            onClick={() => setActiveTab('RESOLVED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'RESOLVED'
                ? 'bg-primary text-on-primary font-semibold shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant'
            }`}
          >
            Resolved History ({resolvedItems.length})
          </button>
        </div>
      </div>

      {/* Rules Information Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>FR11: Promotion Rule</span>
          </div>
          <p className="text-xs text-on-surface-variant">
            Locations automatically graduate from <strong>Unverified</strong> to <strong>Trusted</strong> after 2–3 independent rider confirmations.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            <span>FR11: Conflict Review</span>
          </div>
          <p className="text-xs text-on-surface-variant">
            Conflicting cues (e.g. blue gate vs black gate) are never overwritten silently; they are routed to this ops queue.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-error">
            <span className="material-symbols-outlined text-[18px]">near_me</span>
            <span>FR12: Pin Drift Detection</span>
          </div>
          <p className="text-xs text-on-surface-variant">
            Pin nudges beyond a 200-meter radius threshold trigger an alert for manual inspection to protect against bad data.
          </p>
        </div>
      </div>

      {/* Audit Items List */}
      <div className="space-y-space-md">
        {displayItems.length === 0 ? (
          <div className="p-12 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/30 text-on-surface-variant">
            <span className="material-symbols-outlined text-[36px] text-tertiary mb-2">task_alt</span>
            <p className="font-semibold text-sm text-on-surface">Queue is clear!</p>
            <p className="text-xs mt-1">No pending location conflicts or excessive pin drift alerts.</p>
          </div>
        ) : (
          displayItems.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container-lowest rounded-xl p-5 shadow-xs border border-outline-variant/30 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/30 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono-md text-primary font-bold text-xs">{item.deliveryRef}</span>
                  {item.type === 'GATE_CONFLICT' && (
                    <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-label-caps">
                      Conflicting Gate Description
                    </span>
                  )}
                  {item.type === 'PIN_DRIFT_ALERT' && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-label-caps border border-amber-300">
                      Pin Drift Alert (&gt;200m Threshold)
                    </span>
                  )}
                  {item.type === 'CONFIRMATION' && (
                    <span className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary text-[10px] font-label-caps">
                      Confirmed Accurate
                    </span>
                  )}
                </div>
                <span className="font-mono-sm text-xs text-on-surface-variant">{item.timestamp}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-surface-container-low rounded-lg space-y-1">
                  <span className="font-label-caps text-[10px] text-on-surface-variant">ORIGINAL RECORDED DATA</span>
                  <p className="text-xs font-semibold text-on-surface">{item.landmarkText}</p>
                  <p className="text-xs text-on-surface-variant">Gate: {item.originalGate}</p>
                </div>

                <div className="p-3 bg-surface-container-low rounded-lg space-y-1 border border-primary/20">
                  <span className="font-label-caps text-[10px] text-primary font-bold">RIDER CORRECTION REPORT</span>
                  <p className="text-xs font-semibold text-on-surface">{item.reportedGate}</p>
                  <div className="flex items-center justify-between text-[11px] font-mono-sm text-on-surface-variant pt-1">
                    <span>Courier: {item.riderName}</span>
                    <span className="font-semibold text-primary">Pin Nudge: {item.pinDriftMeters}m</span>
                  </div>
                </div>
              </div>

              {item.status === 'PENDING_REVIEW' && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/30">
                  <button
                    onClick={() => handleReject(item.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-error text-xs font-medium transition-colors"
                  >
                    Reject Correction
                  </button>
                  <button
                    onClick={() => handleAccept(item.id)}
                    className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-medium transition-all shadow-xs"
                  >
                    Accept & Create New Version (v2)
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
