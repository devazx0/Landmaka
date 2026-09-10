'use client';

import React, { useState } from 'react';
import { INITIAL_DELIVERIES, type DeliveryRecord } from '@/lib/dashboard-data';
import ImageCapturePicker from '@/components/ImageCapturePicker';
import { useDeliveries, useRecordDeliveryOutcome } from '@/services/dashboard/hook';

const DEFAULT_POD_RECORDS: DeliveryRecord[] = [
  {
    id: 'DLV-10295',
    trackingReference: 'KWK-LOS-9922',
    recipientName: 'Chinedu Okafor',
    landmarkText: 'Opposite TotalEnergies, Admiralty Way, Lekki Phase 1',
    gateDescription: 'Black security gate with intercom buzzer',
    latitude: 6.4474,
    longitude: 3.4731,
    riderName: 'Emeka Nwosu',
    riderVehicle: 'TVS Neo XR',
    status: 'DELIVERED',
    confidenceScore: 98,
    statusCategory: 'TRUSTED',
    timeAgo: '24m ago',
    callAttempts: 1,
    podGeotag: '6.4474° N, 3.4731° E',
    otpVerified: true,
    podPhotoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
  },
  {
    id: 'DLV-10298',
    trackingReference: 'KWK-LOS-9925',
    recipientName: 'Kemi Adeyemi',
    landmarkText: 'Plot 14, Victoria Island Extension (Glass Building)',
    gateDescription: 'Underground parking security boom barrier',
    latitude: 6.4281,
    longitude: 3.4219,
    riderName: 'Musa Ibrahim',
    riderVehicle: 'Honda Ace 125',
    status: 'DELIVERED',
    confidenceScore: 88,
    statusCategory: 'TRUSTED',
    timeAgo: '1h 04m ago',
    callAttempts: 0,
    podGeotag: '6.4281° N, 3.4219° E',
    otpVerified: true,
    podPhotoUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400',
  },
  {
    id: 'DLV-10301',
    trackingReference: 'KWK-LOS-9930',
    recipientName: 'Babatunde Fashola',
    landmarkText: 'Bourdillon Road, Opposite Palmview, Ikoyi',
    gateDescription: 'Tall perimeter wall, buzzer on security pillar',
    latitude: 6.4529,
    longitude: 3.4354,
    riderName: 'Tunde Adeleke',
    riderVehicle: 'Bajaj Boxer BM',
    status: 'DELIVERED',
    confidenceScore: 95,
    statusCategory: 'TRUSTED',
    timeAgo: '1h 45m ago',
    callAttempts: 0,
    podGeotag: '6.4529° N, 3.4354° E',
    otpVerified: true,
    podPhotoUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400',
  },
  {
    id: 'DLV-10302',
    trackingReference: 'KWK-LOS-9931',
    recipientName: 'Amaka Eze',
    landmarkText: 'Isaac John St, Behind Zenith Bank, Ikeja GRA',
    gateDescription: 'Black sliding gate with security post',
    latitude: 6.5923,
    longitude: 3.3562,
    riderName: 'Sunday Oladipo',
    riderVehicle: 'Suzuki AX100',
    status: 'DELIVERED',
    confidenceScore: 92,
    statusCategory: 'TRUSTED',
    timeAgo: '2h 10m ago',
    callAttempts: 1,
    podGeotag: '6.5923° N, 3.3562° E',
    otpVerified: false,
    podPhotoUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
  },
  {
    id: 'DLV-10303',
    trackingReference: 'KWK-LOS-9932',
    recipientName: 'Damilola Adeleke',
    landmarkText: 'Commercial Ave, Near Yaba Tech Gate 2, Yaba',
    gateDescription: 'Grey gate next to the cybercafe shop',
    latitude: 6.5186,
    longitude: 3.3745,
    riderName: 'Babatunde Alabi',
    riderVehicle: 'Bajaj Boxer BM',
    status: 'DELIVERED',
    confidenceScore: 96,
    statusCategory: 'TRUSTED',
    timeAgo: '2h 40m ago',
    callAttempts: 0,
    podGeotag: '6.5186° N, 3.3745° E',
    otpVerified: true,
    podPhotoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400',
  },
  {
    id: 'DLV-10304',
    trackingReference: 'KWK-LOS-9933',
    recipientName: 'Mohammed Al-Hassan',
    landmarkText: 'Adeniran Ogunsanya St, Near Mall, Surulere',
    gateDescription: 'Brown double swing gate, compound access',
    latitude: 6.4981,
    longitude: 3.3524,
    riderName: 'Musa Ibrahim',
    riderVehicle: 'Honda Ace 125',
    status: 'DELIVERED',
    confidenceScore: 99,
    statusCategory: 'TRUSTED',
    timeAgo: '3h 15m ago',
    callAttempts: 0,
    podGeotag: '6.4981° N, 3.3524° E',
    otpVerified: true,
    podPhotoUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400',
  },
  {
    id: 'DLV-10305',
    trackingReference: 'KWK-LOS-9934',
    recipientName: 'Blessing Okon',
    landmarkText: 'Maryland Crescent, Behind Maryland Mall',
    gateDescription: 'Security barrier estate gate',
    latitude: 6.5714,
    longitude: 3.3688,
    riderName: 'Emeka Nwosu',
    riderVehicle: 'TVS Neo XR',
    status: 'DELIVERED',
    confidenceScore: 89,
    statusCategory: 'TRUSTED',
    timeAgo: '3h 50m ago',
    callAttempts: 2,
    podGeotag: '6.5714° N, 3.3688° E',
    otpVerified: false,
    podPhotoUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=400',
  },
  {
    id: 'DLV-10306',
    trackingReference: 'KWK-LOS-9935',
    recipientName: 'Segun Arinze',
    landmarkText: 'Lekki Expressway, Near Chevron Roundabout, Ajah',
    gateDescription: 'Green perimeter gate, unit 4B inside',
    latitude: 6.4385,
    longitude: 3.5358,
    riderName: 'Sunday Oladipo',
    riderVehicle: 'Suzuki AX100',
    status: 'DELIVERED',
    confidenceScore: 97,
    statusCategory: 'TRUSTED',
    timeAgo: '4h 10m ago',
    callAttempts: 0,
    podGeotag: '6.4385° N, 3.5358° E',
    otpVerified: true,
    podPhotoUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400',
  },
];

export default function ProofOfDeliveryPage() {
  const { data: serverDeliveries } = useDeliveries();
  const recordOutcomeMutation = useRecordDeliveryOutcome();

  const [localRecords, setLocalRecords] = useState<DeliveryRecord[]>([]);

  const records: DeliveryRecord[] = React.useMemo(() => {
    if (serverDeliveries && serverDeliveries.length > 0) {
      const serverMapped: DeliveryRecord[] = serverDeliveries
        .filter((d) => d.status === 'DELIVERED')
        .map((d, idx) => ({
          id: d.id,
          trackingReference: d.trackingReference || d.externalOrderId || `KWK-LOS-${9920 + idx}`,
          recipientName: d.recipientName || 'Recipient',
          landmarkText: d.landmarkText || 'Lekki Phase 1 Corridor',
          gateDescription: d.gateDescription || 'Verified perimeter gate',
          latitude: 6.4474,
          longitude: 3.4731,
          riderName: d.riderName || 'Emeka Nwosu',
          riderVehicle: d.riderVehicle || 'TVS Neo XR',
          status: 'DELIVERED',
          confidenceScore: d.confidenceScore || 95,
          statusCategory: 'TRUSTED',
          timeAgo: d.timeAgo || new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          callAttempts: d.riderCallsCount || 0,
          podGeotag: d.podGeotag || '6.4474° N, 3.4731° E',
          otpVerified: d.otpVerified ?? true,
          podPhotoUrl: d.podPhotoUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
        }));
      return [...localRecords, ...serverMapped];
    }
    return [...localRecords, ...DEFAULT_POD_RECORDS];
  }, [serverDeliveries, localRecords]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'OTP' | 'FLAGGED'>('ALL');
  const [cardWidthMode, setCardWidthMode] = useState<'slim' | 'compact'>('slim');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trackingRef, setTrackingRef] = useState('KWK-LOS-9988');
  const [recipient, setRecipient] = useState('Aisha Mohammed');
  const [landmark, setLandmark] = useState('Admiralty Way, Lekki Phase 1');
  const [gateDesc, setGateDesc] = useState('Black security gate with intercom buzzer');
  const [geotag, setGeotag] = useState('6.4474° N, 3.4731° E');
  const [otpCode, setOtpCode] = useState('7712');
  const [callCount, setCallCount] = useState(0);
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400');
  const [isLocating, setIsLocating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Dispute Dossier Inspection Modal
  const [activeDossierItem, setActiveDossierItem] = useState<DeliveryRecord | null>(null);

  // Auto-detect GPS Coordinates from Device
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(4);
        const lng = pos.coords.longitude.toFixed(4);
        setGeotag(`${lat}° N, ${lng}° E`);
        setIsLocating(false);
      },
      (err) => {
        console.warn('GPS lookup error', err);
        setIsLocating(false);
        alert('Could not determine GPS coordinates. Please ensure location permissions are enabled.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleLogPod = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: DeliveryRecord = {
      id: `DLV-${Math.floor(10400 + Math.random() * 500)}`,
      trackingReference: trackingRef,
      recipientName: recipient,
      landmarkText: landmark,
      gateDescription: gateDesc,
      latitude: parseFloat(geotag.split(',')[0]) || 6.4474,
      longitude: parseFloat(geotag.split(',')[1]) || 3.4731,
      riderName: 'Musa Ibrahim (Kwik Fleet)',
      riderVehicle: 'Honda Ace 125',
      status: 'DELIVERED',
      confidenceScore: 98,
      statusCategory: 'TRUSTED',
      timeAgo: 'Just now',
      callAttempts: callCount,
      podGeotag: geotag,
      otpVerified: Boolean(otpCode && otpCode.length >= 4),
      podPhotoUrl: photoUrl || undefined,
    };

    setLocalRecords((prev) => [newRecord, ...prev]);
    setSuccessMsg(`Proof of delivery recorded! Tamper-proof certificate generated.`);
    setTimeout(() => {
      setIsModalOpen(false);
      setSuccessMsg(null);
    }, 1200);
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.trackingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.landmarkText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.riderName.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'OTP') return matchesSearch && r.otpVerified;
    if (filterType === 'FLAGGED') return matchesSearch && r.statusCategory === 'FLAGGED';
    return matchesSearch;
  });

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  return (
    <div className="p-space-lg space-y-space-md">
      {/* Header Banner - Compact & Clean */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest px-5 py-4 rounded-xl shadow-xs border border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-sm text-on-surface font-semibold text-lg">
              Proof of Delivery (POD) Evidence Hub
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-label-caps text-[10px] font-bold border border-tertiary/30">
              PRD FLOW C
            </span>
          </div>
          <p className="font-body-sm text-on-surface-variant text-xs mt-0.5">
            Geostamped entrance photos, device GPS geotags, and recipient OTP verification.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold shadow-xs transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">verified</span>
          <span>Log Proof Record</span>
        </button>
      </div>

      {/* Proof Health KPIs - Compact Single-Row Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-medium uppercase font-label-caps text-on-surface-variant block">Total Proofs</span>
            <span className="text-lg font-bold font-mono-sm text-on-surface">1,428</span>
          </div>
          <span className="text-[10px] font-mono-sm text-tertiary font-semibold bg-tertiary/10 px-2 py-0.5 rounded">100% Safe</span>
        </div>

        <div className="px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-medium uppercase font-label-caps text-on-surface-variant block">OTP Match Rate</span>
            <span className="text-lg font-bold font-mono-sm text-tertiary">96.8%</span>
          </div>
          <span className="material-symbols-outlined text-[20px] text-tertiary">pin</span>
        </div>

        <div className="px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-medium uppercase font-label-caps text-on-surface-variant block">GPS Accuracy</span>
            <span className="text-lg font-bold font-mono-sm text-on-surface">±4.2m</span>
          </div>
          <span className="material-symbols-outlined text-[20px] text-indigo-600">my_location</span>
        </div>

        <div className="px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-medium uppercase font-label-caps text-on-surface-variant block">Calls Avoided</span>
            <span className="text-lg font-bold font-mono-sm text-tertiary">3,890</span>
          </div>
          <span className="text-[10px] font-mono-sm text-tertiary font-semibold bg-tertiary/10 px-2 py-0.5 rounded">-68%</span>
        </div>
      </div>

      {/* Search, Filter & View Toggle Toolbar */}
      <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface-variant focus-within:border-primary text-xs">
          <span className="material-symbols-outlined text-[16px]">search</span>
          <input
            className="bg-transparent w-full text-on-surface placeholder:text-on-surface-variant focus:outline-none"
            placeholder="Search tracking, recipient, gate, rider..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono-sm text-on-surface-variant">Filter:</span>
            {(['ALL', 'OTP', 'FLAGGED'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono-sm transition-all ${
                  filterType === t
                    ? 'bg-primary text-white font-bold'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                }`}
              >
                {t === 'ALL' ? 'All' : t === 'OTP' ? 'OTP Only' : 'Flags'}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-outline-variant/60"></div>

          {/* Card Width Size Selector (Slim vs Compact) */}
          {viewMode === 'grid' && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono-sm">
              <span className="text-on-surface-variant text-[10px]">Width:</span>
              <button
                onClick={() => setCardWidthMode('slim')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  cardWidthMode === 'slim'
                    ? 'bg-primary text-white font-bold'
                    : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                }`}
                title="Narrow cards (~205px wide)"
              >
                Slim
              </button>
              <button
                onClick={() => setCardWidthMode('compact')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  cardWidthMode === 'compact'
                    ? 'bg-primary text-white font-bold'
                    : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                }`}
                title="Medium cards (~245px wide)"
              >
                Compact
              </button>
            </div>
          )}

          <div className="h-4 w-px bg-outline-variant/60"></div>

          {/* View Mode Toggle: Compact Grid vs Dense Table */}
          <div className="flex items-center p-0.5 rounded-lg bg-surface-container-low border border-outline-variant/30">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded flex items-center justify-center transition-colors ${
                viewMode === 'grid' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant'
              }`}
              title="Narrow Card Grid"
            >
              <span className="material-symbols-outlined text-[17px]">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded flex items-center justify-center transition-colors ${
                viewMode === 'table' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant'
              }`}
              title="Compact Table List"
            >
              <span className="material-symbols-outlined text-[17px]">view_list</span>
            </button>
          </div>
        </div>
      </div>

      {/* SPACE-EFFICIENT NARROW CARD GRID */}
      {viewMode === 'grid' && (
        <div
          className={`grid gap-3 ${
            cardWidthMode === 'slim'
              ? 'grid-cols-[repeat(auto-fill,minmax(190px,215px))]'
              : 'grid-cols-[repeat(auto-fill,minmax(230px,255px))]'
          }`}
        >
          {filteredRecords.map((item) => (
            <div
              key={item.id}
              className={`bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 overflow-hidden flex flex-col justify-between hover:border-primary/50 hover:shadow-sm transition-all group ${
                cardWidthMode === 'slim' ? 'max-w-[215px]' : 'max-w-[255px]'
              }`}
            >
              <div>
                {/* Compact Photo Thumbnail Header */}
                <div
                  onClick={() => setActiveDossierItem(item)}
                  className="h-24 w-full bg-surface-container-low relative overflow-hidden border-b border-outline-variant/30 cursor-pointer"
                >
                  {item.podPhotoUrl ? (
                    <img
                      src={item.podPhotoUrl}
                      alt="Proof"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant gap-0.5">
                      <span className="material-symbols-outlined text-[18px] text-slate-400">photo_camera</span>
                      <span className="text-[9px] font-mono-sm">Geostamped Photo</span>
                    </div>
                  )}

                  <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                    {item.otpVerified && (
                      <span className="bg-emerald-600/90 text-white backdrop-blur-xs px-1.5 py-0.2 rounded text-[8px] font-mono-sm font-bold shadow-xs flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[9px]">check</span>
                        <span>OTP</span>
                      </span>
                    )}
                    <span className="bg-slate-900/80 text-white backdrop-blur-xs px-1 py-0.2 rounded text-[8px] font-mono-sm">
                      ±3m
                    </span>
                  </div>

                  <div className="absolute bottom-1 left-1.5 text-[8px] text-white font-mono-sm bg-black/60 backdrop-blur-xs px-1.5 py-0.2 rounded">
                    {item.timeAgo}
                  </div>
                </div>

                {/* Compact Metadata Body */}
                <div className="p-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-sm font-bold text-[11px] text-primary truncate">
                      {item.trackingReference}
                    </span>
                    <span className="text-[9px] text-on-surface-variant font-mono-sm">
                      LOS
                    </span>
                  </div>

                  <h3 className="font-semibold text-xs text-on-surface truncate">
                    {item.recipientName}
                  </h3>

                  <div className="text-[10px] text-on-surface-variant truncate flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] text-on-surface-variant/70 shrink-0">place</span>
                    <span className="truncate">{item.landmarkText}</span>
                  </div>

                  {item.gateDescription && (
                    <div className="text-[9px] text-on-surface-variant font-mono-sm truncate bg-surface-container-low px-1.5 py-0.5 rounded">
                      Gate: {item.gateDescription}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Action Row */}
              <div className="p-2 bg-surface-container-low/40 border-t border-outline-variant/20 flex items-center justify-between text-[10px] font-mono-sm">
                <span className="text-tertiary font-semibold truncate text-[9px]">
                  {item.callAttempts === 0 ? '0 calls' : `${item.callAttempts} call${item.callAttempts > 1 ? 's' : ''}`}
                </span>

                <button
                  onClick={() => setActiveDossierItem(item)}
                  className="text-primary hover:text-primary-container font-semibold flex items-center gap-0.5 shrink-0 text-[10px]"
                >
                  <span>Dossier</span>
                  <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SPACE-EFFICIENT DENSE DATA TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-sm">
              <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/30 uppercase text-[10px]">
                <tr>
                  <th className="px-3 py-2.5">Photo</th>
                  <th className="px-3 py-2.5">Tracking #</th>
                  <th className="px-3 py-2.5 font-sans">Recipient</th>
                  <th className="px-3 py-2.5 font-sans">Delivered Landmark</th>
                  <th className="px-3 py-2.5">Geotag Coordinates</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Courier</th>
                  <th className="px-3 py-2.5 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                {filteredRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-3 py-1.5">
                      <div
                        onClick={() => setActiveDossierItem(item)}
                        className="w-10 h-10 rounded overflow-hidden bg-surface-container-low cursor-pointer border border-outline-variant/30 relative shrink-0"
                      >
                        {item.podPhotoUrl ? (
                          <img src={item.podPhotoUrl} alt="Drop-off" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 font-bold text-primary whitespace-nowrap">{item.trackingReference}</td>
                    <td className="px-3 py-2 font-sans font-medium text-on-surface whitespace-nowrap">{item.recipientName}</td>
                    <td className="px-3 py-2 font-sans text-on-surface-variant max-w-xs truncate">{item.landmarkText}</td>
                    <td className="px-3 py-2 text-on-surface-variant whitespace-nowrap text-[11px]">{item.podGeotag || `${item.latitude}, ${item.longitude}`}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {item.otpVerified ? (
                        <span className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-bold text-[10px]">
                          OTP VERIFIED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px]">
                          PHOTO STAMP
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-on-surface-variant whitespace-nowrap">{item.riderName}</td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <button
                        onClick={() => setActiveDossierItem(item)}
                        className="px-2 py-1 rounded bg-surface-container-low hover:bg-surface-container text-primary font-semibold text-[11px]"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log POD Modal with Reusable ImageCapturePicker */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-on-surface max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-base text-on-surface font-semibold">
                    Record Proof of Delivery (Flow C)
                  </h3>
                  <p className="font-body-sm text-[11px] text-on-surface-variant">
                    PRD FR7–FR9: Geostamp, Photo Evidence & OTP Verification
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded hover:bg-surface-container-low text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {successMsg && (
              <div className="p-3 bg-tertiary/10 border border-tertiary/30 rounded-lg text-tertiary text-xs font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogPod} className="space-y-3 font-body-sm">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1">
                    Tracking Reference *
                  </label>
                  <input
                    type="text"
                    value={trackingRef}
                    onChange={(e) => setTrackingRef(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface font-mono-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1">
                  Delivered Landmark Address *
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  required
                  placeholder="e.g. Admiralty Way, Opposite TotalEnergies, Lekki"
                  className="w-full px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="text-xs">
                <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1">
                  Gate / Compound Description
                </label>
                <input
                  type="text"
                  value={gateDesc}
                  onChange={(e) => setGateDesc(e.target.value)}
                  placeholder="e.g. Yellow gate, ring bell at security post"
                  className="w-full px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Geotag Input with Current GPS detection */}
              <div className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-label-caps text-[10px] text-on-surface-variant">
                    Geotag Coordinates (PRD FR7) *
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectGps}
                    disabled={isLocating}
                    className="text-[10px] text-primary hover:underline font-mono-sm flex items-center gap-0.5"
                  >
                    <span className="material-symbols-outlined text-[13px]">my_location</span>
                    <span>{isLocating ? 'Locating...' : 'Use Current Device GPS'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={geotag}
                  onChange={(e) => setGeotag(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface font-mono-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1">
                    Drop-off OTP Code (FR8)
                  </label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="4-digit OTP code"
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface font-mono-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1">
                    Rider Phone Calls Made
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={callCount}
                    onChange={(e) => setCallCount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface font-mono-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Device File Pick or Live Camera Photo Evidence Component */}
              <div className="pt-1">
                <ImageCapturePicker
                  value={photoUrl}
                  onChange={setPhotoUrl}
                  label="Drop-off Photo Evidence (Pick from Device or Use Device Camera)"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white font-semibold transition-all shadow-xs text-xs"
                >
                  Confirm & Store Proof Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Resolution Dossier Certificate Modal */}
      {activeDossierItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-on-surface animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-sm font-semibold text-on-surface">
                    Landmaka POD Certificate & Audit Dossier
                  </h3>
                  <p className="font-mono-sm text-[10px] text-on-surface-variant">
                    Tracking Reference: {activeDossierItem.trackingReference}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveDossierItem(null)}
                className="p-1 rounded hover:bg-surface-container-low text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Photo preview in dossier */}
            {activeDossierItem.podPhotoUrl && (
              <div className="h-44 rounded-xl overflow-hidden border border-outline-variant/40 relative">
                <img
                  src={activeDossierItem.podPhotoUrl}
                  alt="Dossier evidence"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/75 text-white font-mono-sm text-[10px] px-2 py-0.5 rounded">
                  Geotag: {activeDossierItem.podGeotag || `${activeDossierItem.latitude}, ${activeDossierItem.longitude}`}
                </div>
              </div>
            )}

            {/* Tamper-proof metadata table */}
            <div className="space-y-2 text-xs font-mono-sm bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Verification Hash:</span>
                <span className="font-bold text-primary truncate max-w-[200px]">SHA256: 7f8a92b1c4e9</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Recipient:</span>
                <span className="font-semibold text-on-surface">{activeDossierItem.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Delivered Landmark:</span>
                <span className="font-semibold text-on-surface truncate max-w-[220px]">{activeDossierItem.landmarkText}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Gate Access Note:</span>
                <span className="text-on-surface truncate max-w-[220px]">{activeDossierItem.gateDescription || 'Verified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">OTP Confirmation:</span>
                <span className="text-tertiary font-bold">{activeDossierItem.otpVerified ? 'PASS (Confirmed by customer)' : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Courier In-Charge:</span>
                <span className="text-on-surface">{activeDossierItem.riderName}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/30">
              <button
                onClick={() => setActiveDossierItem(null)}
                className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-xs font-medium text-on-surface"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Audit PDF certificate exported for ${activeDossierItem.trackingReference}`);
                  setActiveDossierItem(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold shadow-xs"
              >
                Download Audit Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
