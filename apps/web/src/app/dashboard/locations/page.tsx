'use client';
import React, { useState, useMemo } from 'react';
import { INITIAL_LOCATIONS, type CapturedLocationRecord } from '@/lib/dashboard-data';
import ImageCapturePicker from '@/components/ImageCapturePicker';
import { useLocations, useCreateLocation } from '@/services/dashboard/hook';

export default function CapturedLocationsPage() {
  const { data: serverLocations } = useLocations();
  const createLocationMutation = useCreateLocation();

  const locations: CapturedLocationRecord[] = useMemo(() => {
    if (serverLocations && serverLocations.length > 0) {
      return serverLocations.map((loc) => ({
        id: loc.id,
        landmarkText: loc.landmark || loc.name || 'Captured Address',
        gateDescription: loc.gateDescription,
        unitPath: loc.pathToUnit,
        photoUrl: loc.photoUrl,
        latitude: loc.latitude,
        longitude: loc.longitude,
        confidenceScore: loc.confidenceScore,
        status: (loc.verificationStatus === 'GOLD_STANDARD' || loc.verificationStatus === 'PHOTO_CONFIRMED' || loc.verificationStatus === 'PHYSICALLY_AUDITED' ? 'TRUSTED' : 'UNVERIFIED') as any,
        contactName: loc.contactName,
        contactPhone: loc.contactPhone,
        versionsCount: loc.versionsCount || 1,
        verifiedCount: loc.verifiedCount || loc.dropoffCount || 1,
        createdAt: new Date(loc.createdAt).toLocaleDateString() || 'Recently',
      }));
    }
    return INITIAL_LOCATIONS;
  }, [serverLocations]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'TRUSTED' | 'UNVERIFIED' | 'FLAGGED'>('ALL');

  // New Location Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [landmarkText, setLandmarkText] = useState('');
  const [gateDescription, setGateDescription] = useState('');
  const [unitPath, setUnitPath] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [lat, setLat] = useState('6.4520');
  const [lng, setLng] = useState('3.4350');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!landmarkText.trim()) return;

    createLocationMutation.mutate(
      {
        landmark: landmarkText,
        gateDescription: gateDescription || undefined,
        pathToUnit: unitPath || undefined,
        photoUrl: photoUrl || undefined,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        recipientName: contactName || undefined,
        recipientPhone: contactPhone || undefined,
      },
      {
        onSuccess: () => {
          setSuccessMsg('Location captured successfully (Confidence: 50% Unverified)!');
          setLandmarkText('');
          setGateDescription('');
          setUnitPath('');
          setPhotoUrl('');
          setContactName('');
          setContactPhone('');
          setTimeout(() => {
            setIsModalOpen(false);
            setSuccessMsg(null);
          }, 1200);
        },
        onError: (err) => {
          setSuccessMsg(`Failed to save: ${err.message}`);
        },
      }
    );
  };

  const filtered = locations.filter((loc) => {
    const matchesSearch =
      !searchTerm ||
      loc.landmarkText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.gateDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.contactName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || loc.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-space-lg space-y-space-lg">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-on-surface font-semibold">Captured Locations</h1>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-caps text-[10px]">
              PRD Flow A (FR1-FR3)
            </span>
          </div>
          <p className="font-body-md text-on-surface-variant text-sm mt-1">
            Permanent, reusable coordinate pins with structured gate & access cues for Nigerian addresses.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-body-sm font-medium shadow-xs transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
          <span>Capture Location</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search landmarks, gates, contacts..."
            className="w-full pl-9 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-surface-container-lowest border border-outline-variant/40 p-1 rounded-lg shadow-xs">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                filterStatus === 'ALL' ? 'bg-primary text-on-primary font-semibold' : 'text-on-surface-variant'
              }`}
            >
              All ({locations.length})
            </button>
            <button
              onClick={() => setFilterStatus('TRUSTED')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                filterStatus === 'TRUSTED' ? 'bg-tertiary text-on-tertiary font-semibold' : 'text-on-surface-variant'
              }`}
            >
              Trusted
            </button>
            <button
              onClick={() => setFilterStatus('UNVERIFIED')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                filterStatus === 'UNVERIFIED' ? 'bg-amber-600 text-white font-semibold' : 'text-on-surface-variant'
              }`}
            >
              Unverified
            </button>
            <button
              onClick={() => setFilterStatus('FLAGGED')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                filterStatus === 'FLAGGED' ? 'bg-error text-on-error font-semibold' : 'text-error'
              }`}
            >
              Flagged
            </button>
          </div>
        </div>
      </div>

      {/* Locations Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body-sm">
            <thead>
              <tr className="bg-surface-container-low font-label-caps text-on-surface-variant border-b border-outline-variant/30">
                <th className="py-3 px-4">LOCATION ID</th>
                <th className="py-3 px-4">LANDMARK & STRUCTURED CUES</th>
                <th className="py-3 px-4">COORDINATES</th>
                <th className="py-3 px-4">CONFIDENCE</th>
                <th className="py-3 px-4">CONFIRMATIONS</th>
                <th className="py-3 px-4">CONTACT</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {filtered.map((loc) => (
                <tr key={loc.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono-sm text-primary font-semibold">
                    {loc.id}
                  </td>
                  <td className="py-3.5 px-4 max-w-sm">
                    <div className="flex flex-col">
                      <span className="font-semibold text-on-surface">{loc.landmarkText}</span>
                      {loc.gateDescription && (
                        <span className="text-secondary text-xs mt-0.5">Gate: {loc.gateDescription}</span>
                      )}
                      {loc.unitPath && (
                        <span className="text-on-surface-variant text-[11px]">Path: {loc.unitPath}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono-sm text-on-surface-variant text-xs">
                    {loc.latitude.toFixed(4)}° N, {loc.longitude.toFixed(4)}° E
                  </td>
                  <td className="py-3.5 px-4">
                    {loc.status === 'TRUSTED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-mono-sm text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> {loc.confidenceScore}% Trusted
                      </span>
                    )}
                    {loc.status === 'UNVERIFIED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-mono-sm text-xs font-semibold border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> {loc.confidenceScore}% Unverified
                      </span>
                    )}
                    {loc.status === 'FLAGGED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-mono-sm text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-error"></span> {loc.confidenceScore}% Flagged
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono-sm text-xs text-on-surface-variant">
                    {loc.verifiedCount} riders • v{loc.versionsCount}
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <span className="font-medium text-on-surface block">{loc.contactName || '—'}</span>
                    <span className="text-on-surface-variant">{loc.contactPhone || '—'}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-primary font-label-caps transition-colors">
                      Edit Pin
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Capture Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-on-surface">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">add_location_alt</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-base text-on-surface font-semibold">
                    Capture New Location (Flow A)
                  </h3>
                  <p className="font-body-sm text-[11px] text-on-surface-variant">
                    PRD FR1: Lat/Lng + landmark text + structured access fields
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded hover:bg-surface-container-low text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {successMsg && (
              <div className="p-3 bg-tertiary/10 border border-tertiary/30 rounded-lg text-tertiary text-xs font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateLocation} className="space-y-3 font-body-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1">Latitude</label>
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface font-mono-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1">Longitude</label>
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface font-mono-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1">
                  Landmark Text <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Beside Central Mosque, Yellow Gate, Surulere"
                  value={landmarkText}
                  onChange={(e) => setLandmarkText(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1">Gate Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Black gate with spikes"
                    value={gateDescription}
                    onChange={(e) => setGateDescription(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1">Unit Path / Floor</label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 3, 2nd floor"
                    value={unitPath}
                    onChange={(e) => setUnitPath(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1">Contact Recipient</label>
                  <input
                    type="text"
                    placeholder="e.g. Musa Ibrahim"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. +234 802 000 0000"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <ImageCapturePicker
                  value={photoUrl}
                  onChange={setPhotoUrl}
                  label="Entrance / Gate Photo (Pick from device or use camera)"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-medium transition-all shadow-xs"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
