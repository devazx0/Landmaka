'use client';

import React, { useState } from 'react';
import { useApiKeys, useCreateApiKey, useDeleteApiKey } from '@/services/dashboard/hook';

export default function ApiKeysPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  const { data: serverKeys, isLoading } = useApiKeys();
  const createApiKeyMutation = useCreateApiKey();
  const deleteApiKeyMutation = useDeleteApiKey();

  const activeKey = 'lm_test_key_pilot_01';

  const handleCopy = (id: string, keyText: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    createApiKeyMutation.mutate(
      { name: newKeyName.trim(), type: 'SECRET', rateLimitPerMin: 1000 },
      {
        onSuccess: () => {
          setNewKeyName('');
          setIsCreating(false);
        },
      }
    );
  };

  const handleRevoke = (id: string) => {
    if (confirm('Are you sure you want to revoke this API key?')) {
      deleteApiKeyMutation.mutate(id);
    }
  };

  const keys = serverKeys && serverKeys.length > 0 ? serverKeys : [
    {
      id: 'key_pilot_01',
      name: 'Pilot Production Key',
      key: activeKey,
      type: 'SECRET' as const,
      rateLimitPerMin: 1000,
      isActive: true,
      createdAt: '2026-09-01',
      merchantId: 'mer_pilot',
    },
  ];

  return (
    <div className="p-space-lg space-y-space-lg">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-on-surface font-semibold">API Keys & Authentication</h1>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-caps text-[10px]">
              PRD FR13 & FR15
            </span>
          </div>
          <p className="font-body-md text-on-surface-variant text-sm mt-1">
            Manage multi-tenant partner access tokens, rate limits, and authentication headers.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-body-sm font-medium shadow-xs transition-all shrink-0 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Generate New Key</span>
        </button>
      </div>

      {/* Create Modal */}
      {isCreating && (
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-primary/40 shadow-sm animate-fadeIn">
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-semibold text-on-surface">Key Name / Description</label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Staging Server Key or Driver App Key"
                className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/50 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createApiKeyMutation.isPending}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors disabled:opacity-60"
              >
                {createApiKeyMutation.isPending ? 'Generating...' : 'Save Key'}
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active API Keys List */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 overflow-hidden">
        <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-on-surface">Active Partner Keys</h3>
          <span className="text-xs font-mono-sm text-on-surface-variant">Tenant: KwikLogistics Nigeria</span>
        </div>

        <div className="p-4 space-y-3">
          {keys.map((k) => (
            <div key={k.id} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-on-surface">{k.name}</span>
                  <span className={`px-2 py-0.2 rounded-full text-[10px] font-label-caps font-bold ${
                    k.isActive ? 'bg-tertiary/10 text-tertiary' : 'bg-surface-variant text-on-surface-variant'
                  }`}>
                    {k.isActive ? 'ACTIVE' : 'REVOKED'}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-surface-container-lowest text-[10px] font-mono border border-outline-variant/40 text-on-surface-variant">
                    {k.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="font-mono-sm text-xs bg-surface-container-lowest px-2 py-1 rounded border border-outline-variant/40 text-primary">
                    {k.key}
                  </code>
                  <button
                    onClick={() => handleCopy(k.id, k.key)}
                    className="p-1 rounded hover:bg-surface-container text-on-surface-variant text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copiedId === k.id ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedId === k.id ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono-sm text-on-surface-variant">
                <div>
                  <span className="block text-[10px] text-on-surface-variant uppercase">Rate Limit</span>
                  <span className="text-on-surface font-semibold">{k.rateLimitPerMin?.toLocaleString() || 1000} req / min</span>
                </div>
                <div>
                  <span className="block text-[10px] text-on-surface-variant uppercase">Created</span>
                  <span className="text-on-surface">{new Date(k.createdAt).toLocaleDateString()}</span>
                </div>
                {k.id !== 'key_pilot_01' && (
                  <button
                    onClick={() => handleRevoke(k.id)}
                    disabled={deleteApiKeyMutation.isPending}
                    className="px-2.5 py-1 rounded bg-surface-container-lowest border border-outline-variant/40 hover:bg-error-container hover:text-on-error-container text-error transition-colors text-xs font-medium cursor-pointer"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Code Snippet */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 p-5 space-y-3">
        <h3 className="font-semibold text-sm text-on-surface">Quick Integration (cURL)</h3>
        <p className="text-xs text-on-surface-variant">
          Pass your API key in the <code>x-api-key</code> header with every request:
        </p>

        <pre className="p-4 rounded-lg bg-[#0b1424] text-slate-200 font-mono-sm text-xs overflow-x-auto">
{`curl -X POST http://localhost:3001/api/v1/locations \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${activeKey}" \\
  -d '{
    "latitude": 6.4474,
    "longitude": 3.4731,
    "landmarkText": "Beside Central Mosque, Yellow Gate, Surulere",
    "gateDescription": "Yellow double sliding gate",
    "contactName": "Musa Ibrahim"
  }'`}
        </pre>
      </div>
    </div>
  );
}
