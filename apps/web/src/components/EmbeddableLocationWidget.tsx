'use client';

import React, { useState } from 'react';
import { MapPin, CheckCircle2, Copy, Check, ExternalLink } from 'lucide-react';

interface EmbeddableLocationWidgetProps {
  apiKey: string;
  apiUrl?: string;
  onCaptured?: (location: { id: string; landmark: string }) => void;
}

export default function EmbeddableLocationWidget({
  apiKey,
  apiUrl = 'http://localhost:3001',
  onCaptured,
}: EmbeddableLocationWidgetProps) {
  const [landmark, setLandmark] = useState('');
  const [gate, setGate] = useState('');
  const [unitPath, setUnitPath] = useState('');
  const [lat, setLat] = useState('6.4474');
  const [lng, setLng] = useState('3.4842');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedLocation, setCapturedLocation] = useState<{ id: string; landmark: string } | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!landmark.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/api/v1/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          landmarkText: landmark,
          gateDescription: gate || undefined,
          unitPath: unitPath || undefined,
          createdBy: 'CUSTOMER',
        }),
      });

      if (!res.ok) throw new Error('Location capture failed');
      const data = await res.json();
      const result = { id: data.id, landmark: data.landmarkText };
      setCapturedLocation(result);
      if (onCaptured) onCaptured(result);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyEmbedCode = () => {
    const code = `<script src="${apiUrl}/sdk/landmaka-widget.js" data-api-key="${apiKey}"></script>\n<div id="landmaka-checkout-widget" data-on-capture="handleLocationCapture"></div>`;
    navigator.clipboard.writeText(code);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 flex flex-col gap-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
            Partner Checkout Integration
          </span>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            Landmaka Address & Landmark Widget
          </h3>
        </div>
        <button
          onClick={copyEmbedCode}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          {copiedSnippet ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Checkout Snippet</span>
            </>
          )}
        </button>
      </div>

      {capturedLocation ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Location Bound to Checkout Order!</span>
          </div>
          <p className="text-xs text-slate-300">
            <span className="font-semibold">Captured Landmark:</span> {capturedLocation.landmark}
          </p>
          <div className="text-[11px] font-mono text-slate-400">
            ID: {capturedLocation.id}
          </div>
          <button
            onClick={() => setCapturedLocation(null)}
            className="text-[11px] text-emerald-400 hover:underline text-left mt-1"
          >
            Capture another location
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Prominent Landmark or Junction *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Opposite FCMB Bank, off Admiralty Way"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Gate & Compound Description
              </label>
              <input
                type="text"
                placeholder="e.g. Black sliding gate with spikes"
                value={gate}
                onChange={(e) => setGate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Path to Unit / Door
              </label>
              <input
                type="text"
                placeholder="e.g. Flat 4B, 2nd floor"
                value={unitPath}
                onChange={(e) => setUnitPath(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 mt-1"
          >
            {isSubmitting ? 'Saving Address...' : 'Confirm Delivery Location & Pin'}
          </button>
        </form>
      )}
    </div>
  );
}
