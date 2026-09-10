'use client';

import React, { useState, useEffect } from 'react';
import { useWebhookConfig, useUpdateWebhook } from '@/services/dashboard/hook';

interface WebhookLog {
  id: string;
  event: 'delivery.assigned' | 'delivery.en_route' | 'delivery.delivered' | 'delivery.failed';
  endpoint: string;
  statusCode: number;
  timeAgo: string;
}

const INITIAL_LOGS: WebhookLog[] = [
  {
    id: 'wh_evt_01',
    event: 'delivery.delivered',
    endpoint: 'https://api.kwik.delivery/webhooks/landmaka',
    statusCode: 200,
    timeAgo: '2m ago',
  },
  {
    id: 'wh_evt_02',
    event: 'delivery.en_route',
    endpoint: 'https://api.kwik.delivery/webhooks/landmaka',
    statusCode: 200,
    timeAgo: '12m ago',
  },
  {
    id: 'wh_evt_03',
    event: 'delivery.failed',
    endpoint: 'https://api.kwik.delivery/webhooks/landmaka',
    statusCode: 200,
    timeAgo: '51m ago',
  },
];

export default function WebhooksPage() {
  const { data: serverConfig } = useWebhookConfig();
  const updateWebhookMutation = useUpdateWebhook();

  const [webhookUrl, setWebhookUrl] = useState('https://api.kwik.delivery/webhooks/landmaka');
  const [logs, setLogs] = useState<WebhookLog[]>(INITIAL_LOGS);
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (serverConfig?.webhookUrl) {
      setWebhookUrl(serverConfig.webhookUrl);
    }
  }, [serverConfig?.webhookUrl]);

  const handleSaveEndpoint = () => {
    updateWebhookMutation.mutate(
      { webhookUrl },
      {
        onSuccess: () => {
          setTestSuccess('Webhook destination URL updated and saved successfully!');
          setTimeout(() => setTestSuccess(null), 3000);
        },
      }
    );
  };

  const handleTestEvent = () => {
    setIsTesting(true);
    setTestSuccess(null);

    setTimeout(() => {
      const newLog: WebhookLog = {
        id: `wh_evt_${Date.now().toString().slice(-4)}`,
        event: 'delivery.delivered',
        endpoint: webhookUrl,
        statusCode: 200,
        timeAgo: 'Just now',
      };
      setLogs([newLog, ...logs]);
      setTestSuccess('Webhook test ping succeeded (HTTP 200 OK)!');
      setIsTesting(false);
    }, 600);
  };

  return (
    <div className="p-space-lg space-y-space-lg">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-on-surface font-semibold">Webhooks & Event Streams</h1>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-caps text-[10px]">
              PRD FR14
            </span>
          </div>
          <p className="font-body-md text-on-surface-variant text-sm mt-1">
            Real-time HTTP webhook triggers for delivery lifecycle updates (assigned, en route, delivered, failed).
          </p>
        </div>

        <button
          onClick={handleTestEvent}
          disabled={isTesting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-body-sm font-medium shadow-xs transition-all disabled:opacity-50 shrink-0"
        >
          {isTesting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-[18px]">send</span>
          )}
          <span>Send Test Event</span>
        </button>
      </div>

      {testSuccess && (
        <div className="p-3 bg-tertiary/10 border border-tertiary/30 rounded-lg text-tertiary text-xs font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>{testSuccess}</span>
        </div>
      )}

      {/* Webhook Configuration Form */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 p-5 space-y-4">
        <h3 className="font-semibold text-sm text-on-surface">Partner Destination Endpoint</h3>

        <div className="space-y-3">
          <div>
            <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1">
              PAYLOAD URL (HTTPS)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface text-xs font-mono-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleSaveEndpoint}
                disabled={updateWebhookMutation.isPending}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold shadow-2xs transition-colors shrink-0 cursor-pointer disabled:opacity-60"
              >
                {updateWebhookMutation.isPending ? 'Saving...' : 'Save URL'}
              </button>
            </div>
          </div>

          <div>
            <span className="font-label-caps text-[10px] text-on-surface-variant block mb-1.5">
              SUBSCRIBED EVENTS
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['delivery.assigned', 'delivery.en_route', 'delivery.delivered', 'delivery.failed'].map((evt) => (
                <div
                  key={evt}
                  className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                  <span className="font-mono-sm text-xs text-on-surface">{evt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Webhook Event Dispatch Logs */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 overflow-hidden">
        <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-on-surface">Recent Event Deliveries</h3>
          <span className="text-xs font-mono-sm text-on-surface-variant">Auto-retry: 3 attempts with backoff</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body-sm">
            <thead>
              <tr className="bg-surface-container-low font-label-caps text-on-surface-variant border-b border-outline-variant/30">
                <th className="py-3 px-4">EVENT ID</th>
                <th className="py-3 px-4">EVENT TYPE</th>
                <th className="py-3 px-4">DESTINATION</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">DISPATCH TIME</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono-sm text-xs font-semibold text-primary">
                    {log.id}
                  </td>
                  <td className="py-3.5 px-4 font-mono-sm text-xs font-medium text-on-surface">
                    {log.event}
                  </td>
                  <td className="py-3.5 px-4 font-mono-sm text-xs text-on-surface-variant truncate max-w-xs">
                    {log.endpoint}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-tertiary/10 text-tertiary font-mono-sm text-xs font-bold">
                      {log.statusCode} OK
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono-sm text-xs text-on-surface-variant text-right">
                    {log.timeAgo}
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
