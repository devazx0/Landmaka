'use client';

import React, { useState, useEffect } from 'react';
import {
  getAdminApiKeys,
  saveAdminApiKeys,
  getAdminBusinesses,
  appendAdminAuditLog,
  type AdminApiKeyRecord,
  type AdminBusiness,
} from '@/lib/admin-data';

export default function AdminApiKeysPage() {
  const [keys, setKeys] = useState<AdminApiKeyRecord[]>([]);
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'REVOKED'>('ALL');

  // Modals state
  const [revokeModalKey, setRevokeModalKey] = useState<AdminApiKeyRecord | null>(null);
  const [rateLimitModalKey, setRateLimitModalKey] = useState<AdminApiKeyRecord | null>(null);
  const [newRateLimit, setNewRateLimit] = useState(1000);
  const [newKeyModalOpen, setNewKeyModalOpen] = useState(false);
  const [selectedBizId, setSelectedBizId] = useState('');
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState<'production' | 'staging' | 'sandbox'>('production');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    setKeys(getAdminApiKeys());
    const bizs = getAdminBusinesses();
    setBusinesses(bizs);
    if (bizs.length > 0) setSelectedBizId(bizs[0].id);
  }, []);

  const filteredKeys = keys.filter((k) => {
    const matchesSearch =
      k.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.keyPrefix.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || k.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Revoke Key Handler
  const handleConfirmRevoke = () => {
    if (!revokeModalKey) return;
    const updated = keys.map((k) =>
      k.id === revokeModalKey.id ? { ...k, status: 'REVOKED' as const } : k
    );
    setKeys(updated);
    saveAdminApiKeys(updated);

    appendAdminAuditLog({
      adminUser: 'Azeem Sanusi',
      action: 'API_KEY_REVOKED',
      targetEntity: `${revokeModalKey.maskedKey} (${revokeModalKey.businessName})`,
      details: `Revoked API key: ${revokeModalKey.label}`,
      ipAddress: '197.210.44.18',
      level: 'WARN',
    });

    showToast(`Revoked key: ${revokeModalKey.maskedKey}`);
    setRevokeModalKey(null);
  };

  // Rotate Key Handler
  const handleRotateKey = (keyRecord: AdminApiKeyRecord) => {
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const newPrefix = `lm_live_${keyRecord.businessId.replace('biz_', '')}_${Math.floor(1000 + Math.random() * 9000)}`;
    const rotatedKey: AdminApiKeyRecord = {
      id: `key_${Date.now()}`,
      keyPrefix: newPrefix,
      maskedKey: `${newPrefix}••••••••••••${randomSuffix}`,
      businessId: keyRecord.businessId,
      businessName: keyRecord.businessName,
      label: `${keyRecord.label} (Rotated)`,
      environment: keyRecord.environment,
      status: 'ACTIVE',
      rateLimitPerMin: keyRecord.rateLimitPerMin,
      lastUsedAt: 'Just now',
      createdAt: 'Just now',
    };

    // Mark previous as revoked and add new key
    const updated = keys.map((k) =>
      k.id === keyRecord.id ? { ...k, status: 'REVOKED' as const } : k
    );
    const finalKeys = [rotatedKey, ...updated];
    setKeys(finalKeys);
    saveAdminApiKeys(finalKeys);

    appendAdminAuditLog({
      adminUser: 'Azeem Sanusi',
      action: 'API_KEY_ROTATED',
      targetEntity: `${keyRecord.businessName}`,
      details: `Rotated key ${keyRecord.maskedKey} -> ${rotatedKey.maskedKey}`,
      ipAddress: '197.210.44.18',
      level: 'INFO',
    });

    showToast(`Key rotated for ${keyRecord.businessName}. New token active.`);
  };

  // Adjust Rate Limit
  const handleSaveRateLimit = () => {
    if (!rateLimitModalKey) return;
    const updated = keys.map((k) =>
      k.id === rateLimitModalKey.id ? { ...k, rateLimitPerMin: newRateLimit } : k
    );
    setKeys(updated);
    saveAdminApiKeys(updated);

    appendAdminAuditLog({
      adminUser: 'Azeem Sanusi',
      action: 'RATE_LIMIT_MODIFIED',
      targetEntity: `${rateLimitModalKey.maskedKey}`,
      details: `Adjusted throughput to ${newRateLimit} req/min`,
      ipAddress: '197.210.44.18',
      level: 'INFO',
    });

    showToast(`Updated rate limit to ${newRateLimit} req/min`);
    setRateLimitModalKey(null);
  };

  // Provision New Key
  const handleProvisionKey = (e: React.FormEvent) => {
    e.preventDefault();
    const biz = businesses.find((b) => b.id === selectedBizId);
    if (!biz) return;

    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const prefix = `lm_${newKeyEnv === 'production' ? 'live' : 'test'}_${biz.slug.substring(0, 4)}_${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: AdminApiKeyRecord = {
      id: `key_${Date.now()}`,
      keyPrefix: prefix,
      maskedKey: `${prefix}••••••••••••${randomSuffix}`,
      businessId: biz.id,
      businessName: biz.name,
      label: newKeyLabel || 'Primary Integration Key',
      environment: newKeyEnv,
      status: 'ACTIVE',
      rateLimitPerMin: biz.rateLimitPerMin,
      lastUsedAt: 'Never',
      createdAt: 'Just now',
    };

    const updated = [newRecord, ...keys];
    setKeys(updated);
    saveAdminApiKeys(updated);

    appendAdminAuditLog({
      adminUser: 'Azeem Sanusi',
      action: 'API_KEY_PROVISIONED',
      targetEntity: `${biz.name}`,
      details: `Provisioned new ${newKeyEnv} key: ${newRecord.maskedKey}`,
      ipAddress: '197.210.44.18',
      level: 'INFO',
    });

    showToast(`Provisioned new key for ${biz.name}`);
    setNewKeyModalOpen(false);
    setNewKeyLabel('');
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
              Platform API Key Vault & Access Control
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-label-caps text-[10px] font-bold border border-indigo-200">
              PRD FR13 & SECURITY
            </span>
          </div>
          <p className="font-body-md text-on-surface-variant text-xs mt-1">
            Superadmin security console: inspect all issued merchant tokens, revoke compromised credentials, and enforce rate limits.
          </p>
        </div>

        <button
          onClick={() => setNewKeyModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-body-sm font-semibold shadow-xs transition-all shrink-0 text-xs"
        >
          <span className="material-symbols-outlined text-[18px]">key</span>
          <span>Provision New Key</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-96 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface-variant focus-within:border-indigo-600 text-xs">
          <span className="material-symbols-outlined text-[16px]">search</span>
          <input
            className="bg-transparent w-full text-on-surface placeholder:text-on-surface-variant focus:outline-none"
            placeholder="Search by business, key prefix, or label..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono-sm text-on-surface-variant">Status:</span>
          {(['ALL', 'ACTIVE', 'REVOKED'] as const).map((st) => (
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

      {/* Keys Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-sm">
            <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/30 uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Merchant & Label</th>
                <th className="px-4 py-3">Masked Secret Token</th>
                <th className="px-4 py-3">Environment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Rate Limit</th>
                <th className="px-4 py-3">Last Active</th>
                <th className="px-4 py-3 text-right">Superadmin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-on-surface">
              {filteredKeys.map((k) => (
                <tr key={k.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-on-surface font-sans">{k.businessName}</div>
                    <div className="text-[10px] text-on-surface-variant">{k.label}</div>
                  </td>

                  <td className="px-4 py-3">
                    <code className="bg-surface-container-low px-2 py-1 rounded border border-outline-variant/40 text-primary font-bold">
                      {k.maskedKey}
                    </code>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        k.environment === 'production'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {k.environment}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        k.status === 'ACTIVE'
                          ? 'bg-tertiary/10 text-tertiary'
                          : 'bg-error-container text-on-error-container'
                      }`}
                    >
                      {k.status}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span>{k.rateLimitPerMin.toLocaleString()} req/m</span>
                      <button
                        onClick={() => {
                          setRateLimitModalKey(k);
                          setNewRateLimit(k.rateLimitPerMin);
                        }}
                        className="text-primary hover:underline text-[10px]"
                        title="Edit rate limit"
                      >
                        edit
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-on-surface-variant">{k.lastUsedAt}</td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {k.status === 'ACTIVE' && (
                        <>
                          <button
                            onClick={() => handleRotateKey(k)}
                            className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-[11px] font-medium transition-colors"
                            title="Generate a replacement key"
                          >
                            Rotate
                          </button>
                          <button
                            onClick={() => setRevokeModalKey(k)}
                            className="px-2 py-1 rounded bg-error-container hover:bg-red-200 text-on-error-container text-[11px] font-bold transition-colors"
                            title="Immediately invalidate key"
                          >
                            Revoke
                          </button>
                        </>
                      )}
                      {k.status === 'REVOKED' && (
                        <span className="text-[11px] text-error font-medium">Decommissioned</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revoke Key Modal */}
      {revokeModalKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/50 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-error">
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
                <span className="material-symbols-outlined text-[24px]">key_off</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-sm font-semibold text-on-surface">
                  Revoke API Key
                </h3>
                <p className="font-mono-sm text-[11px] text-on-surface-variant">
                  {revokeModalKey.businessName}
                </p>
              </div>
            </div>

            <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
              Are you sure you want to revoke <code className="font-mono-sm text-error">{revokeModalKey.maskedKey}</code>? Any automated server or mobile rider application using this token will be rejected immediately with <code>401 Unauthorized</code>.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRevokeModalKey(null)}
                className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-xs font-medium text-on-surface"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevoke}
                className="px-3.5 py-1.5 rounded-lg bg-error hover:bg-red-700 text-white text-xs font-semibold shadow-xs"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rate Limit Modal */}
      {rateLimitModalKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/50 max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-headline-sm text-sm font-semibold text-on-surface">
              Adjust Rate Limit Throttle
            </h3>
            <p className="font-body-md text-xs text-on-surface-variant">
              Set maximum allowed calls per minute for {rateLimitModalKey.businessName}.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-mono-sm text-on-surface font-semibold">
                Requests per Minute
              </label>
              <input
                type="number"
                step="500"
                min="100"
                max="10000"
                className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant/40 font-mono-sm text-sm focus:border-indigo-600 focus:outline-none"
                value={newRateLimit}
                onChange={(e) => setNewRateLimit(parseInt(e.target.value) || 500)}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRateLimitModalKey(null)}
                className="px-3 py-1.5 rounded-lg bg-surface-container-low text-xs font-medium text-on-surface"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRateLimit}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
              >
                Update Limit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provision Key Modal */}
      {newKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleProvisionKey}
            className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/50 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-3 text-indigo-600 pb-2 border-b border-outline-variant/30">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <span className="material-symbols-outlined text-[24px]">vpn_key</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-sm font-semibold text-on-surface">
                  Provision Superadmin API Key
                </h3>
                <p className="font-mono-sm text-[11px] text-on-surface-variant">
                  Issue cryptographically signed token for partner
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-on-surface mb-1">Target Business Tenant *</label>
                <select
                  required
                  className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant/40 focus:border-indigo-600 focus:outline-none"
                  value={selectedBizId}
                  onChange={(e) => setSelectedBizId(e.target.value)}
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.tier})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Key Label / Purpose *</label>
                <input
                  required
                  placeholder="e.g. Lagos Island Dispatch Gateway"
                  className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant/40 focus:border-indigo-600 focus:outline-none"
                  value={newKeyLabel}
                  onChange={(e) => setNewKeyLabel(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Environment Scope</label>
                <select
                  className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant/40 focus:border-indigo-600 focus:outline-none font-mono-sm"
                  value={newKeyEnv}
                  onChange={(e) => setNewKeyEnv(e.target.value as any)}
                >
                  <option value="production">production (live traffic)</option>
                  <option value="staging">staging (sandbox test)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => setNewKeyModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-xs font-medium text-on-surface"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
              >
                Generate Token
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
