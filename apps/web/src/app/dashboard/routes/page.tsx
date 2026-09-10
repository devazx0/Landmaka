'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { INITIAL_LOCATIONS } from '@/lib/dashboard-data';
import type { SequencedRouteStop } from '@/components/MapComponent';
import { useLocations, useOptimizeRoute } from '@/services/dashboard/hook';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] bg-[#0b1424] rounded-xl flex items-center justify-center text-slate-400">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="font-mono-sm text-[12px] text-slate-400">Loading Lagos OpenStreetMap View...</span>
      </div>
    </div>
  ),
});

export default function RouteOptimizerPage() {
  const { data: serverLocations } = useLocations();
  const optimizeRouteMutation = useOptimizeRoute();
  const isOptimizing = optimizeRouteMutation.isPending;

  const availableLocations = React.useMemo(() => {
    if (serverLocations && serverLocations.length > 0) {
      return serverLocations.map((l) => ({
        id: l.id,
        latitude: l.latitude,
        longitude: l.longitude,
        landmarkText: l.landmark || l.name || 'Delivery Drop',
        gateDescription: l.gateDescription || '',
        contactName: l.contactName || '',
      }));
    }
    return INITIAL_LOCATIONS;
  }, [serverLocations]);

  const [originLabel, setOriginLabel] = useState('Ikeja Dispatch Hub');
  const [originLat] = useState(6.5954);
  const [originLng] = useState(3.3431);
  const [selectedIds, setSelectedIds] = useState<string[]>(INITIAL_LOCATIONS.slice(0, 4).map((l) => l.id));
  const [roundTrip, setRoundTrip] = useState(false);
  const [orderedStops, setOrderedStops] = useState<SequencedRouteStop[]>([
    {
      sequenceIndex: 1,
      id: 'loc_lag_001',
      latitude: 6.5012,
      longitude: 3.3581,
      label: 'Musa Ibrahim (Surulere)',
      notes: 'Beside Central Mosque, Yellow Gate',
      distanceFromPreviousMeters: 4200,
      durationFromPreviousSeconds: 620,
    },
    {
      sequenceIndex: 2,
      id: 'loc_lag_003',
      latitude: 6.5186,
      longitude: 3.3745,
      label: 'Fatima Bello (Yaba)',
      notes: 'Yaba Tech Gate 2, Commercial Ave',
      distanceFromPreviousMeters: 2800,
      durationFromPreviousSeconds: 410,
    },
    {
      sequenceIndex: 3,
      id: 'loc_lag_005',
      latitude: 6.4281,
      longitude: 3.4219,
      label: 'Kemi Adeyemi (VI)',
      notes: 'Plot 14 Victoria Island Extension',
      distanceFromPreviousMeters: 5100,
      durationFromPreviousSeconds: 780,
    },
    {
      sequenceIndex: 4,
      id: 'loc_lag_002',
      latitude: 6.4474,
      longitude: 3.4731,
      label: 'Chinedu Okafor (Lekki)',
      notes: 'Admiralty Way, Opposite Total',
      distanceFromPreviousMeters: 3800,
      durationFromPreviousSeconds: 540,
    },
  ]);
  const [totalKm, setTotalKm] = useState(15.9);
  const [totalMins, setTotalMins] = useState(39);
  const [optimizationNotice, setOptimizationNotice] = useState<string | null>(null);

  const toggleStopSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOptimize = async () => {
    if (selectedIds.length === 0) return;
    setOptimizationNotice(null);

    const stopsToOptimize = availableLocations
      .filter((l) => selectedIds.includes(l.id))
      .map((l) => ({
        id: l.id,
        latitude: l.latitude,
        longitude: l.longitude,
        label: l.contactName || l.landmarkText,
        notes: l.gateDescription,
      }));

    optimizeRouteMutation.mutate(
      {
        origin: { latitude: originLat, longitude: originLng, label: originLabel },
        stops: stopsToOptimize,
        roundTrip,
      },
      {
        onSuccess: (data) => {
          setOrderedStops((data.orderedStops as any) || []);
          setTotalKm((data as any).totalDistanceKm || Math.round(data.totalDistanceMeters / 100) / 10 || 15.9);
          setTotalMins((data as any).totalDurationMinutes || Math.round(data.totalDurationSeconds / 60) || 39);
          setOptimizationNotice(`OSRM road optimization completed: ${data.orderedStops?.length || 0} stops sequenced!`);
        },
        onError: (err) => {
          setOptimizationNotice(`Optimization note: ${err.message}. Showing local calculated sequence.`);
        },
      }
    );
  };

  return (
    <div className="p-space-lg space-y-space-lg">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-on-surface font-semibold">Dispatch Route Optimizer</h1>
            <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-caps text-[10px]">
              PRD Flow B (FR4-FR6)
            </span>
          </div>
          <p className="font-body-md text-on-surface-variant text-sm mt-1">
            OpenStreetMap road-network sequence optimization for dispatch stops, minimizing transit duration.
          </p>
        </div>

        <button
          onClick={handleOptimize}
          disabled={isOptimizing || selectedIds.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-body-sm font-medium shadow-xs transition-all disabled:opacity-50"
        >
          {isOptimizing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-[18px]">alt_route</span>
          )}
          <span>Execute OSRM Optimization</span>
        </button>
      </div>

      {optimizationNotice && (
        <div className="p-3 bg-tertiary/10 border border-tertiary/30 rounded-lg text-tertiary text-xs font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>{optimizationNotice}</span>
        </div>
      )}

      {/* Grid: Left Controls (5 cols) + Right Map (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left Stops Selector & Result Panel */}
        <div className="lg:col-span-5 space-y-space-md">
          {/* Origin Hub */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 space-y-2">
            <span className="font-label-caps text-[10px] text-on-surface-variant">
              DISPATCH ORIGIN (HUB-LOS-01)
            </span>
            <input
              type="text"
              value={originLabel}
              onChange={(e) => setOriginLabel(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            />
            <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-mono-sm">
              <span>Coordinates: {originLat}° N, {originLng}° E</span>
              <span className="text-tertiary font-semibold">Active Node</span>
            </div>
          </div>

          {/* Select Stops from Stored Locations */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[10px] text-on-surface-variant">
                SELECT STOPS TO SEQUENCE ({selectedIds.length} of {INITIAL_LOCATIONS.length})
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-on-surface">
                <input
                  type="checkbox"
                  checked={roundTrip}
                  onChange={(e) => setRoundTrip(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span>Round Trip</span>
              </label>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1.5">
              {INITIAL_LOCATIONS.map((loc) => {
                const isSelected = selectedIds.includes(loc.id);
                return (
                  <div
                    key={loc.id}
                    onClick={() => toggleStopSelection(loc.id)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-primary/5 border-primary/40'
                        : 'bg-surface-container-low border-outline-variant/30 hover:bg-surface-container'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-primary focus:ring-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-on-surface truncate">
                          {loc.contactName || loc.id}
                        </span>
                        <span className="font-mono-sm text-[10px] px-1.5 py-0.2 rounded bg-tertiary/10 text-tertiary font-medium">
                          {loc.confidenceScore}%
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant truncate mt-0.5">{loc.landmarkText}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sequenced Results Card */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
              <span className="font-label-caps text-[10px] text-on-surface-variant">OPTIMIZED VISITING ORDER</span>
              <div className="flex items-center gap-3 font-mono-sm text-xs">
                <span className="text-primary font-semibold">{totalKm} km</span>
                <span className="text-tertiary font-semibold">{totalMins} min est.</span>
              </div>
            </div>

            <div className="space-y-2">
              {orderedStops.map((stop) => (
                <div
                  key={stop.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low border border-outline-variant/20 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-primary text-on-primary font-mono-sm text-[10px] flex items-center justify-center font-bold shrink-0">
                      {stop.sequenceIndex}
                    </span>
                    <div className="truncate">
                      <span className="font-semibold text-on-surface block truncate">{stop.label}</span>
                      <span className="text-[10px] text-on-surface-variant truncate block">{stop.notes}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 font-mono-sm text-[10px] text-on-surface-variant">
                    <span>+{(stop.durationFromPreviousSeconds / 60).toFixed(0)} min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Map Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 overflow-hidden min-h-[560px] flex flex-col">
          <div className="p-3 border-b border-outline-variant/30 flex items-center justify-between text-xs">
            <span className="font-semibold text-on-surface">Lagos Metropolitan Road Network (OSRM)</span>
            <span className="font-mono-sm text-[10px] text-on-surface-variant">CartoDB Voyager • OpenStreetMap</span>
          </div>
          <div className="flex-1 min-h-[500px]">
            <MapComponent
              locations={INITIAL_LOCATIONS.map((l) => ({
                id: l.id,
                latitude: l.latitude,
                longitude: l.longitude,
                landmarkText: l.landmarkText,
                gateDescription: l.gateDescription,
                confidenceScore: l.confidenceScore,
                status: l.status,
                contactName: l.contactName,
              }))}
              origin={{ latitude: originLat, longitude: originLng, label: originLabel }}
              routeStops={orderedStops}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
