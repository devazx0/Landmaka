'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getAdminBusinesses,
  saveAdminBusinesses,
  appendAdminAuditLog,
  getAdminApiKeys,
  saveAdminApiKeys,
  type AdminBusiness,
} from '@/lib/admin-data';

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'Starter' | 'Growth' | 'Enterprise'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');

  // Modals state
  const [suspensionModalBiz, setSuspensionModalBiz] = useState<AdminBusiness | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [customRatesModalBiz, setCustomRatesModalBiz] = useState<AdminBusiness | null>(null);
  const [overrideCapture, setOverrideCapture] = useState('');
  const [overrideRouting, setOverrideRouting] = useState('');
  const [overridePod, setOverridePod] = useState('');
  const [newBizModalOpen, setNewBizModalOpen] = useState(false);
  const [newBizName, setNewBizName] = useState('');
  const [newBizCategory, setNewBizCategory] = useState<'3PL Logistics' | 'E-commerce' | 'Food Delivery' | 'Courier' | 'Fintech/KYC'>('3PL Logistics');
  const [newBizContact, setNewBizContact] = useState('');
  const [newBizEmail, setNewBizEmail] = useState('');
  const [newBizPhone, setNewBizPhone] = useState('');
  const [newBizTier, setNewBizTier] = useState<'Starter' | 'Growth' | 'Enterprise'>('Growth');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    setBusinesses(getAdminBusinesses());
  }, []);

  const filteredBusinesses = businesses.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'ALL' || b.tier === tierFilter;
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesTier && matchesStatus;
  });

  // Suspend business handler
  const handleConfirmSuspend = () => {
    if (!suspensionModalBiz) return;
    const reason = suspensionReason.trim() || 'Admin manual suspension';
    const updated = businesses.map((b) =>
      b.id === suspensionModalBiz.id
        ? { ...b, status: 'SUSPENDED' as const, suspensionReason: reason }
        : b
    );
    setBusinesses(updated);
    saveAdminBusinesses(updated);

    // Also revoke/suspend its keys
    const allKeys = getAdminApiKeys();
    const updatedKeys = allKeys.map((k) =>
      k.businessId === suspensionModalBiz.id ? { ...k, status: 'SUSPENDED' as const } : k
    );
    saveAdminApiKeys(updatedKeys);

    appendAdminAuditLog({
      adminUser: 'Azeem Sanusi',
      action: 'BUSINESS_SUSPENDED',
      targetEntity: `${suspensionModalBiz.name} (${suspensionModalBiz.id})`,
      details: `Suspended with reason: "${reason}". All API keys thottled/suspended.`,
      ipAddress: '197.210.44.18',
      level: 'CRITICAL',
    });

    showToast(`Suspended ${suspensionModalBiz.name}. All active API keys revoked.`);
    setSuspensionModalBiz(null);
    setSuspensionReason('');
  };

  // Reactivate business handler
  const handleReactivate = (biz: AdminBusiness) => {
    const updated = businesses.map((b) =>
      b.id === biz.id ? { ...b, status: 'ACTIVE' as const, suspensionReason: undefined } : b
    );
    setBusinesses(updated);
    saveAdminBusinesses(updated);

    // Reactivate keys
    const allKeys = getAdminApiKeys();
    const updatedKeys = allKeys.map((k) =>
      k.businessId === biz.id ? { ...k, status: 'ACTIVE' as const } : k
    );
    saveAdminApiKeys(updatedKeys);

    appendAdminAuditLog({
      adminUser: 'Azeem Sanusi',
      action: 'BUSINESS_REACTIVATED',
      targetEntity: `${biz.name} (${biz.id})`,
      details: `Restored full platform API dispatch access.`,
      ipAddress: '197.210.44.18',
      level: 'INFO',
    });

    showToast(`Reactivated ${biz.name}. API access restored.`);
  };

  // Custom rates handler
  const handleOpenCustomRates = (biz: AdminBusiness) => {
    setCustomRatesModalBiz(biz);
    setOverrideCapture(biz.customCaptureRateNgn ? String(biz.customCaptureRateNgn) : '20.0');
    setOverrideRouting(biz.customRoutingRateNgn ? String(biz.customRoutingRateNgn) : '35.0');
    setOverridePod(biz.customPodRateNgn ? String(biz.customPodRateNgn) : '12.0');
  };

  const handleSaveCustomRates = () => {
    if (!customRatesModalBiz) return;
    const updated = businesses.map((b) =>
      b.id === customRatesModalBiz.id
        ? {
            ...b,
            customCaptureRateNgn: parseFloat(overrideCapture) || undefined,
            customRoutingRateNgn: parseFloat(overrideRouting) || undefined,
            customPodRateNgn: parseFloat(overridePod) || undefined,
          }
        : b
    );
    setBusinesses(updated);
    saveAdminBusinesses(updated);

    appendAdminAuditLog({
      adminUser: 'Azeem Sanusi',
      action: 'CUSTOM_PRICING_UPDATED',
      targetEntity: `${customRatesModalBiz.name}`,
      details: `Set custom rates: Capture ₦${overrideCapture}, Routing ₦${overrideRouting}, PoD ₦${overridePod}`,
      ipAddress: '197.210.44.18',
      level: 'INFO',
    });

    showToast(`Updated custom billing rates for ${customRatesModalBiz.name}`);
    setCustomRatesModalBiz(null);
  };

  // Add new business handler
  const handleAddNewBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim()) return;

    const newBiz: AdminBusiness = {
      id: `biz_${Date.now()}`,
      name: newBizName,
      slug: newBizName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      category: newBizCategory,
      contactPerson: newBizContact || 'Primary Administrator',
      email: newBizEmail || `admin@${newBizName.toLowerCase().replace(/\s+/g, '')}.ng`,
      phone: newBizPhone || '+234 800 000 0000',
      tier: newBizTier,
      status: 'ACTIVE',
      walletBalanceNgn: 250000,
      totalSpendNgn: 0,
      activeDeliveriesToday: 0,
      totalLocationsCaptured: 0,
      apiKeyCount: 1,
      rateLimitPerMin: newBizTier === 'Enterprise' ? 4000 : newBizTier === 'Growth' ? 2000 : 1000,
      joinedDate: 'Just now',
      lastActive: 'Never',
    };

    const updated = [newBiz, ...businesses];
    setBusinesses(updated);
    saveAdminBusinesses(updated);

    appendAdminAuditLog({
      adminUser: 'Azeem Sanusi',
      action: 'BUSINESS_ONBOARDED',
      targetEntity: `${newBiz.name}`,
      details: `Direct superadmin onboarding into ${newBiz.tier} tier`,
      ipAddress: '197.210.44.18',
      level: 'INFO',
    });

    showToast(`Onboarded ${newBiz.name} successfully.`);
    setNewBizModalOpen(false);
    setNewBizName('');
    setNewBizContact('');
    setNewBizEmail('');
    setNewBizPhone('');
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
              Businesses & Fleet Tenants
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-label-caps text-[10px] font-bold border border-indigo-200">
              PRD FR13 & MULTI-TENANCY
            </span>
          </div>
          <p className="font-body-md text-on-surface-variant text-xs mt-1">
            Superadmin directory of logistics companies, couriers, and e-commerce partners consuming the Landmaka routing & address API.
          </p>
        </div>

        <button
          onClick={() => setNewBizModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-body-sm font-semibold shadow-xs transition-all shrink-0 text-xs"
        >
          <span className="material-symbols-outlined text-[18px]">add_business</span>
          <span>Onboard New Business</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-96 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface-variant focus-within:border-indigo-600 text-xs">
          <span className="material-symbols-outlined text-[16px]">search</span>
          <input
            className="bg-transparent w-full text-on-surface placeholder:text-on-surface-variant focus:outline-none"
            placeholder="Search business name, contact, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          <div className="flex items-center gap-1">
            <span className="text-xs font-mono-sm text-on-surface-variant">Tier:</span>
            {(['ALL', 'Starter', 'Growth', 'Enterprise'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono-sm transition-all ${
                  tierFilter === tier
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-outline-variant/60"></div>

          <div className="flex items-center gap-1">
            <span className="text-xs font-mono-sm text-on-surface-variant">Status:</span>
            {(['ALL', 'ACTIVE', 'SUSPENDED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono-sm transition-all ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Businesses Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/30 uppercase text-[10px] font-label-caps">
              <tr>
                <th className="px-4 py-3">Business & Category</th>
                <th className="px-4 py-3">Tier & Status</th>
                <th className="px-4 py-3">Wallet / Spend (₦)</th>
                <th className="px-4 py-3">Volume Today</th>
                <th className="px-4 py-3">Rate Limit</th>
                <th className="px-4 py-3">Custom Pricing</th>
                <th className="px-4 py-3 text-right">Superadmin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-on-surface">
              {filteredBusinesses.map((biz) => (
                <tr key={biz.id} className="hover:bg-surface-container-low/50 transition-colors">
                  {/* Name & Contact */}
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-on-surface text-sm">{biz.name}</span>
                        <span className="font-mono-sm text-[9px] px-1.5 py-0.2 rounded bg-surface-container-high text-on-surface-variant">
                          {biz.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-on-surface-variant flex items-center gap-2">
                        <span>{biz.contactPerson}</span>
                        <span>•</span>
                        <span className="font-mono-sm">{biz.phone}</span>
                      </div>
                    </div>
                  </td>

                  {/* Tier & Status */}
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full font-mono-sm text-[10px] font-bold ${
                          biz.status === 'ACTIVE'
                            ? 'bg-tertiary/10 text-tertiary'
                            : 'bg-error-container text-on-error-container'
                        }`}
                      >
                        {biz.status}
                      </span>
                      <div className="font-mono-sm text-[10px] text-on-surface-variant">
                        Tier: <strong>{biz.tier}</strong>
                      </div>
                    </div>
                  </td>

                  {/* Wallet / Spend */}
                  <td className="px-4 py-3 font-mono-sm">
                    <div className="space-y-0.5">
                      <div
                        className={`font-semibold ${
                          biz.walletBalanceNgn < 0 ? 'text-error font-bold' : 'text-on-surface'
                        }`}
                      >
                        ₦{biz.walletBalanceNgn.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-on-surface-variant">
                        LTD: ₦{(biz.totalSpendNgn / 1000).toFixed(0)}k
                      </div>
                    </div>
                  </td>

                  {/* Volume */}
                  <td className="px-4 py-3 font-mono-sm">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-on-surface">
                        {biz.activeDeliveriesToday} runs
                      </span>
                      <div className="text-[10px] text-on-surface-variant">
                        {biz.totalLocationsCaptured.toLocaleString()} saved
                      </div>
                    </div>
                  </td>

                  {/* Rate Limit */}
                  <td className="px-4 py-3 font-mono-sm">
                    <span className="px-2 py-1 rounded bg-surface-container-low border border-outline-variant/40 text-[11px]">
                      {biz.rateLimitPerMin.toLocaleString()} req/m
                    </span>
                  </td>

                  {/* Custom Pricing */}
                  <td className="px-4 py-3">
                    {biz.customCaptureRateNgn ? (
                      <div className="space-y-0.5 font-mono-sm text-[10px] text-indigo-700 bg-indigo-50/70 p-1.5 rounded border border-indigo-100">
                        <div>Capture: ₦{biz.customCaptureRateNgn.toFixed(2)}</div>
                        <div>Routing: ₦{biz.customRoutingRateNgn?.toFixed(2)}</div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-on-surface-variant font-mono-sm">Standard Base</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenCustomRates(biz)}
                        className="px-2 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-medium transition-colors"
                        title="Configure custom fee overrides"
                      >
                        Pricing
                      </button>

                      <Link
                        href="/admin/api-keys"
                        className="px-2 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-medium transition-colors"
                        title="View & revoke keys"
                      >
                        Keys ({biz.apiKeyCount})
                      </Link>

                      {biz.status === 'ACTIVE' ? (
                        <button
                          onClick={() => setSuspensionModalBiz(biz)}
                          className="px-2.5 py-1 rounded-lg bg-error-container hover:bg-red-200 text-on-error-container text-[11px] font-semibold transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">block</span>
                          <span>Suspend</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(biz)}
                          className="px-2.5 py-1 rounded-lg bg-tertiary-fixed hover:bg-emerald-300 text-on-tertiary-fixed font-semibold text-[11px] transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          <span>Reactivate</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspend Business Modal */}
      {suspensionModalBiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/50 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-error">
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
                <span className="material-symbols-outlined text-[24px]">gavel</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-sm font-semibold text-on-surface">
                  Suspend Business: {suspensionModalBiz.name}
                </h3>
                <p className="font-mono-sm text-[11px] text-on-surface-variant">
                  Tenant Cutoff & Key Revocation
                </p>
              </div>
            </div>

            <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
              Suspending this business immediately disables all associated API keys, halting address lookups, route optimization, and webhook dispatches.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">Suspension Reason / Note</label>
              <textarea
                className="w-full p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-xs font-body-sm focus:outline-none focus:border-error"
                rows={3}
                placeholder="e.g. Unpaid monthly billing invoice, fraudulent rider pin submissions, or SLA breach..."
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSuspensionModalBiz(null)}
                className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-xs font-medium text-on-surface"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSuspend}
                className="px-3.5 py-1.5 rounded-lg bg-error hover:bg-red-700 text-white text-xs font-semibold shadow-xs"
              >
                Confirm Immediate Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Rates Modal */}
      {customRatesModalBiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/50 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-indigo-600">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <span className="material-symbols-outlined text-[24px]">payments</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-sm font-semibold text-on-surface">
                  Custom Charging Rates Override
                </h3>
                <p className="font-mono-sm text-[11px] text-on-surface-variant">
                  {customRatesModalBiz.name} ({customRatesModalBiz.tier})
                </p>
              </div>
            </div>

            <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
              Define negotiated enterprise pricing per API transaction for this specific client. Overrides global base charging.
            </p>

            <div className="space-y-3 font-mono-sm text-xs">
              <div>
                <label className="block text-on-surface font-semibold mb-1">
                  Per Location Capture Fee (₦)
                </label>
                <input
                  type="number"
                  step="0.5"
                  className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant/40 focus:border-indigo-600 focus:outline-none"
                  value={overrideCapture}
                  onChange={(e) => setOverrideCapture(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-on-surface font-semibold mb-1">
                  Per Route Optimization / Stop Fee (₦)
                </label>
                <input
                  type="number"
                  step="0.5"
                  className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant/40 focus:border-indigo-600 focus:outline-none"
                  value={overrideRouting}
                  onChange={(e) => setOverrideRouting(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-on-surface font-semibold mb-1">
                  Per Proof-of-Delivery / OTP Verification Fee (₦)
                </label>
                <input
                  type="number"
                  step="0.5"
                  className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant/40 focus:border-indigo-600 focus:outline-none"
                  value={overridePod}
                  onChange={(e) => setOverridePod(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCustomRatesModalBiz(null)}
                className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-xs font-medium text-on-surface"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomRates}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
              >
                Save Custom Rates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboard New Business Modal */}
      {newBizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleAddNewBusiness}
            className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/50 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-3 text-indigo-600 pb-2 border-b border-outline-variant/30">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <span className="material-symbols-outlined text-[24px]">domain_add</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-sm font-semibold text-on-surface">
                  Onboard Logistics / Partner Business
                </h3>
                <p className="font-mono-sm text-[11px] text-on-surface-variant">
                  Provision new multi-tenant merchant workspace
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-on-surface font-semibold mb-1">Company / Fleet Name *</label>
                <input
                  required
                  placeholder="e.g. Red Star Express or Fez Delivery"
                  className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant/40 focus:border-indigo-600 focus:outline-none"
                  value={newBizName}
                  onChange={(e) => setNewBizName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-on-surface font-semibold mb-1">Category</label>
                <select
                  className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant/40 focus:border-indigo-600 focus:outline-none font-mono-sm"
                  value={newBizCategory}
                  onChange={(e) => setNewBizCategory(e.target.value as any)}
                >
                  <option value="3PL Logistics">3PL Logistics</option>
                  <option value="Courier">Courier</option>
                  <option value="Food Delivery">Food Delivery</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Fintech/KYC">Fintech/KYC</option>
                </select>
              </div>

              <div>
                <label className="block text-on-surface font-semibold mb-1">Partner Tier</label>
                <select
                  className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant/40 focus:border-indigo-600 focus:outline-none font-mono-sm"
                  value={newBizTier}
                  onChange={(e) => setNewBizTier(e.target.value as any)}
                >
                  <option value="Starter">Starter (1,000 req/min)</option>
                  <option value="Growth">Growth (2,000 req/min)</option>
                  <option value="Enterprise">Enterprise (4,000 req/min)</option>
                </select>
              </div>

              <div>
                <label className="block text-on-surface font-semibold mb-1">Contact Lead</label>
                <input
                  placeholder="e.g. Olusegun Obasanjo"
                  className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant/40 focus:border-indigo-600 focus:outline-none"
                  value={newBizContact}
                  onChange={(e) => setNewBizContact(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-on-surface font-semibold mb-1">Contact Email</label>
                <input
                  type="email"
                  placeholder="e.g. dispatch@redstar.ng"
                  className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant/40 focus:border-indigo-600 focus:outline-none"
                  value={newBizEmail}
                  onChange={(e) => setNewBizEmail(e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-on-surface font-semibold mb-1">Contact Phone</label>
                <input
                  placeholder="e.g. +234 803 123 4567"
                  className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant/40 focus:border-indigo-600 focus:outline-none"
                  value={newBizPhone}
                  onChange={(e) => setNewBizPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => setNewBizModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-xs font-medium text-on-surface"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
              >
                Create Partner Tenant
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
