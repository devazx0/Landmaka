'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { MapLocation, SequencedRouteStop } from '@/components/MapComponent';
import type { PilotMetricsData } from '@/components/PilotMetricsCard';
import { INITIAL_DELIVERIES, INITIAL_LOCATIONS, type DeliveryRecord } from '@/lib/dashboard-data';
import ImageCapturePicker from '@/components/ImageCapturePicker';
import { useLocations, useDeliveries, usePilotMetrics, useCreateLocation } from '@/services/dashboard/hook';

// Dynamically import Leaflet map component (SSR safe)
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

export default function DashboardOverviewPage() {
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d'>('today');
  const [mapMode, setMapMode] = useState<'vector' | 'osm'>('vector');

  // Filters
  const [tableSearch, setTableSearch] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState<'ALL' | 'TRUSTED' | 'UNVERIFIED' | 'FLAGGED'>('ALL');
  const [selectedMapLocationId, setSelectedMapLocationId] = useState<string | null>(null);

  // Quick Action Modals
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [captureLat, setCaptureLat] = useState('6.4474');
  const [captureLng, setCaptureLng] = useState('3.4842');
  const [captureLandmark, setCaptureLandmark] = useState('');
  const [captureGate, setCaptureGate] = useState('');
  const [captureContact, setCaptureContact] = useState('');
  const [capturePhone, setCapturePhone] = useState('');
  const [capturePhotoUrl, setCapturePhotoUrl] = useState('');
  const [captureSuccessMsg, setCaptureSuccessMsg] = useState<string | null>(null);

  // TanStack Query Hooks
  const { data: serverLocations } = useLocations();
  const { data: serverDeliveries } = useDeliveries();
  const { data: serverPilotMetrics } = usePilotMetrics();
  const createLocationMutation = useCreateLocation();
  const isSavingLocation = createLocationMutation.isPending;

  // Real data with graceful fallback
  const locations: MapLocation[] = useMemo(() => {
    if (serverLocations && serverLocations.length > 0) {
      return serverLocations.map((loc) => ({
        id: loc.id,
        latitude: loc.latitude,
        longitude: loc.longitude,
        landmarkText: loc.landmark || loc.name || 'Captured Location',
        gateDescription: loc.gateDescription,
        status: (loc.verificationStatus === 'GOLD_STANDARD' || loc.verificationStatus === 'PHOTO_CONFIRMED' || loc.verificationStatus === 'PHYSICALLY_AUDITED' ? 'TRUSTED' : 'UNVERIFIED') as any,
        confidenceScore: loc.confidenceScore,
      }));
    }
    return INITIAL_LOCATIONS.map((loc) => ({
      id: loc.id,
      latitude: loc.latitude,
      longitude: loc.longitude,
      landmarkText: loc.landmarkText,
      gateDescription: loc.gateDescription,
      status: loc.status,
      confidenceScore: loc.confidenceScore,
    }));
  }, [serverLocations]);

  const deliveries: DeliveryRecord[] = useMemo(() => {
    if (serverDeliveries && serverDeliveries.length > 0) {
      return serverDeliveries.map((d, idx) => ({
        id: d.id,
        trackingReference: d.trackingReference || d.externalOrderId || `KWK-LOS-${1000 + idx}`,
        recipientName: d.recipientName || 'Recipient',
        landmarkText: d.landmarkText || 'Lekki Phase 1',
        gateDescription: d.gateDescription || 'Standard gate entrance',
        latitude: 6.4474,
        longitude: 3.4731,
        riderName: d.riderName || 'Fleet Pool',
        riderVehicle: d.riderVehicle || 'Motorcycle',
        status: (d.status === 'IN_TRANSIT' ? 'EN_ROUTE' : d.status === 'PENDING' ? 'ASSIGNED' : d.status) as any,
        confidenceScore: d.confidenceScore ?? 85,
        statusCategory: (d.confidenceScore && d.confidenceScore >= 80 ? 'TRUSTED' : 'UNVERIFIED') as any,
        timeAgo: d.timeAgo || 'Recent',
        callAttempts: d.riderCallsCount || 0,
        podPhotoUrl: d.podPhotoUrl,
        otpVerified: d.otpVerified,
      }));
    }
    return INITIAL_DELIVERIES;
  }, [serverDeliveries]);

  const pilotMetrics = (serverPilotMetrics as any) || null;

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!captureLandmark.trim()) return;

    createLocationMutation.mutate(
      {
        landmark: captureLandmark,
        gateDescription: captureGate || undefined,
        latitude: parseFloat(captureLat),
        longitude: parseFloat(captureLng),
        recipientName: captureContact || undefined,
        recipientPhone: capturePhone || undefined,
        photoUrl: capturePhotoUrl || undefined,
      },
      {
        onSuccess: () => {
          setCaptureSuccessMsg('Location captured successfully (Confidence: 50% Unverified)');
          setCaptureLandmark('');
          setCaptureGate('');
          setCaptureContact('');
          setCapturePhone('');
          setCapturePhotoUrl('');
          setTimeout(() => {
            setIsCaptureModalOpen(false);
            setCaptureSuccessMsg(null);
          }, 1200);
        },
        onError: (err) => {
          setCaptureSuccessMsg(`Failed to capture location: ${err.message}`);
        },
      }
    );
  };

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((item) => {
      const matchesSearch =
        !tableSearch ||
        item.trackingReference.toLowerCase().includes(tableSearch.toLowerCase()) ||
        item.recipientName.toLowerCase().includes(tableSearch.toLowerCase()) ||
        item.landmarkText.toLowerCase().includes(tableSearch.toLowerCase()) ||
        item.riderName.toLowerCase().includes(tableSearch.toLowerCase());

      const matchesConfidence =
        confidenceFilter === 'ALL' || item.statusCategory === confidenceFilter;

      return matchesSearch && matchesConfidence;
    });
  }, [deliveries, tableSearch, confidenceFilter]);

  return (
    <div className="p-space-lg space-y-space-lg">
      {/* Top Action & Context Banner */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30">
        <div className="space-y-1">
          <div className="flex items-center gap-space-sm flex-wrap">
            <h1 className="font-headline-lg text-headline-sm xl:text-headline-lg text-on-surface tracking-tight font-semibold">
              Lagos Metropolitan Dispatch Hub
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-label-caps">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping"></span>
              Live OSRM Engine
            </span>
            <span className="font-mono-sm text-mono-sm text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded">
              HUB-LOS-01
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Real-time dispatch overview • Pilot Fleet: <span className="font-mono-md text-on-surface font-semibold">48 couriers</span> • <span className="text-tertiary font-semibold">96.8%</span> verified gate landmark resolution
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-space-sm flex-wrap">
          <div className="flex items-center bg-surface-container-low rounded-lg p-1 border border-outline-variant/30">
            <button
              onClick={() => setDateRange('today')}
              className={`px-3 py-1 font-label-caps rounded-md transition-all ${
                dateRange === 'today'
                  ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateRange('7d')}
              className={`px-3 py-1 font-label-caps rounded-md transition-all ${
                dateRange === '7d'
                  ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Last 7d
            </button>
            <button
              onClick={() => setDateRange('30d')}
              className={`px-3 py-1 font-label-caps rounded-md transition-all ${
                dateRange === '30d'
                  ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              30d
            </button>
          </div>

          <Link
            href="/dashboard/routes"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-secondary-container hover:bg-secondary-fixed-dim text-on-secondary-container font-body-sm transition-colors shadow-xs font-medium"
          >
            <span className="material-symbols-outlined text-[16px]">alt_route</span>
            <span>Route Optimizer</span>
          </Link>

          <Link
            href="/dashboard/proof-of-delivery"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-body-sm transition-colors shadow-xs font-medium border border-outline-variant/40"
          >
            <span className="material-symbols-outlined text-[16px] text-tertiary">verified</span>
            <span>Log POD</span>
          </Link>

          <button
            onClick={() => setIsCaptureModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-body-sm font-medium shadow-xs transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
            <span>Capture Location</span>
          </button>
        </div>
      </div>

      {/* 6 KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-space-md">
        {/* Metric 1: Total Deliveries */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between space-y-space-sm hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-on-surface-variant">Total Deliveries</span>
            <span className="material-symbols-outlined text-primary text-[18px] bg-primary/10 p-1 rounded-md">
              local_shipping
            </span>
          </div>
          <div>
            <div className="font-display-lg text-display-lg text-on-surface font-bold leading-none tracking-tight">
              {pilotMetrics?.pilot.totalDeliveries || 1428}
            </div>
            <div className="flex items-center gap-1 mt-1.5 font-mono-sm text-mono-sm text-tertiary">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span>+14.2%</span>
              <span className="text-on-surface-variant font-body-sm text-[11px] ml-1">vs yesterday</span>
            </div>
          </div>
          <svg className="w-full h-5 text-primary" fill="none" viewBox="0 0 100 20">
            <path
              d="M0 16 Q 15 12, 30 14 T 60 7 T 85 10 T 100 3"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
            />
            <path
              d="M0 16 Q 15 12, 30 14 T 60 7 T 85 10 T 100 3 L 100 20 L 0 20 Z"
              fill="currentColor"
              fillOpacity="0.08"
            />
          </svg>
        </div>

        {/* Metric 2: Success SLA */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between space-y-space-sm hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-on-surface-variant">Success SLA</span>
            <span className="material-symbols-outlined text-tertiary text-[18px] bg-tertiary/10 p-1 rounded-md">
              check_circle
            </span>
          </div>
          <div>
            <div className="font-display-lg text-display-lg text-on-surface font-bold leading-none tracking-tight">
              {pilotMetrics?.pilot.deliveredCount || 1382}
            </div>
            <div className="flex items-center gap-1 mt-1.5 font-mono-sm text-mono-sm text-tertiary font-semibold">
              <span>96.8% SLA rate</span>
            </div>
          </div>
          <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden">
            <div className="bg-tertiary h-1.5 rounded-full" style={{ width: '96.8%' }}></div>
          </div>
        </div>

        {/* Metric 3: Failed Deliveries */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between space-y-space-sm hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-on-surface-variant">Failed / Aborted</span>
            <span className="material-symbols-outlined text-error text-[18px] bg-error-container/40 p-1 rounded-md">
              warning
            </span>
          </div>
          <div>
            <div className="font-display-lg text-display-lg text-on-surface font-bold leading-none tracking-tight">
              {pilotMetrics?.pilot.failedCount || 46}
            </div>
            <div className="flex items-center gap-1 mt-1.5 font-mono-sm text-mono-sm text-tertiary">
              <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
              <span>↓ {pilotMetrics?.improvements.failedDeliveryRateReductionPct || 18.2}%</span>
              <span className="text-on-surface-variant font-body-sm text-[11px]">vs baseline</span>
            </div>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant text-[11px] leading-tight">
            PRD target: -20% failed runs
          </p>
        </div>

        {/* Metric 4: Avg Delivery Time */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between space-y-space-sm hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-on-surface-variant">Avg Delivery Time</span>
            <span className="material-symbols-outlined text-secondary text-[18px] bg-secondary-container p-1 rounded-md">
              schedule
            </span>
          </div>
          <div>
            <div className="font-display-lg text-display-lg text-on-surface font-bold leading-none tracking-tight">
              {pilotMetrics?.pilot.avgTransitDurationMinutes || 28.4}{' '}
              <span className="font-body-md text-base text-on-surface-variant font-normal">min</span>
            </div>
            <div className="flex items-center gap-1 mt-1.5 font-mono-sm text-mono-sm text-tertiary">
              <span className="material-symbols-outlined text-[14px]">speed</span>
              <span>-{pilotMetrics?.improvements.avgMinutesSavedPerDelivery || 4.1} mins saved</span>
            </div>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant text-[11px] leading-tight">
            via OSRM auto-sequencing
          </p>
        </div>

        {/* Metric 5: Rider Call Rate */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between space-y-space-sm hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-on-surface-variant">Rider Call Rate</span>
            <span className="material-symbols-outlined text-primary text-[18px] bg-primary/10 p-1 rounded-md">
              call
            </span>
          </div>
          <div>
            <div className="font-display-lg text-display-lg text-on-surface font-bold leading-none tracking-tight">
              {pilotMetrics?.pilot.avgCallAttemptsPerDelivery || 1.2}{' '}
              <span className="font-body-md text-base text-on-surface-variant font-normal">calls</span>
            </div>
            <div className="flex items-center gap-1 mt-1.5 font-mono-sm text-mono-sm text-tertiary font-medium">
              <span>
                {pilotMetrics?.improvements.callAttemptsReductionPct
                  ? `↓ ${pilotMetrics.improvements.callAttemptsReductionPct}% calls`
                  : '64% fewer calls'}
              </span>
            </div>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant text-[11px] leading-tight">
            via structured gate metadata
          </p>
        </div>

        {/* Metric 6: Trusted Coordinates */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between space-y-space-sm hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-on-surface-variant">Trusted Coordinates</span>
            <span className="material-symbols-outlined text-tertiary text-[18px] bg-tertiary/10 p-1 rounded-md">
              verified
            </span>
          </div>
          <div>
            <div className="font-display-lg text-display-lg text-on-surface font-bold leading-none tracking-tight">
              {pilotMetrics?.locationMaturity.trustedRatePct || 89.4}%
            </div>
            <div className="flex items-center gap-1 mt-1.5 font-mono-sm text-mono-sm text-on-surface-variant">
              <span className="font-semibold text-on-surface">
                {pilotMetrics?.locationMaturity.trustedLocations || 14280}
              </span>{' '}
              verified gates
            </div>
          </div>
          <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-tertiary h-1.5 rounded-full"
              style={{ width: `${pilotMetrics?.locationMaturity.trustedRatePct || 89.4}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Interactive Lagos Map Canvas & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Map Canvas (8 Columns) */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 flex flex-col overflow-hidden relative min-h-[520px]">
          {/* Map Header Overlay */}
          <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none gap-2">
            <div className="pointer-events-auto flex items-center gap-1 bg-surface-container-lowest/95 backdrop-blur-md p-1 rounded-lg shadow-xs border border-outline-variant/40">
              <span className="material-symbols-outlined text-[18px] text-primary ml-2">layers</span>
              <button
                onClick={() => setMapMode('vector')}
                className={`px-2.5 py-1 text-label-caps rounded font-label-caps transition-all ${
                  mapMode === 'vector'
                    ? 'bg-primary text-on-primary font-semibold shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Lagos Vector
              </button>
              <button
                onClick={() => setMapMode('osm')}
                className={`px-2.5 py-1 text-label-caps rounded font-label-caps transition-all ${
                  mapMode === 'osm'
                    ? 'bg-primary text-on-primary font-semibold shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Live Leaflet OSM
              </button>
            </div>

            <div className="pointer-events-auto flex items-center gap-1 bg-surface-container-lowest/95 backdrop-blur-md p-1 rounded-lg shadow-xs border border-outline-variant/40">
              <div className="flex items-center gap-1 px-2 py-0.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-mono-sm text-mono-sm text-on-surface font-medium">
                  32 Active Couriers
                </span>
              </div>
            </div>
          </div>

          {/* Map Body: Vector SVG or Leaflet */}
          {mapMode === 'vector' ? (
            <div className="relative w-full flex-1 bg-[#0b1424] overflow-hidden select-none min-h-[480px]">
              <svg
                className="absolute inset-0 w-full h-full object-cover"
                fill="none"
                preserveAspectRatio="xMidYMid slice"
                viewBox="0 0 1000 650"
              >
                <defs>
                  <linearGradient id="lagoonWater" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#07101f"></stop>
                    <stop offset="100%" stopColor="#0c1a30"></stop>
                  </linearGradient>
                  <filter height="140%" id="glow" width="140%" x="-20%" y="-20%">
                    <feGaussianBlur result="blur" stdDeviation="3"></feGaussianBlur>
                    <feComposite in="SourceGraphic" in2="blur" operator="over"></feComposite>
                  </filter>
                </defs>
                <rect fill="url(#lagoonWater)" height="650" width="1000"></rect>
                <path
                  d="M 40,0 L 480,0 L 460,180 L 520,240 L 490,320 L 400,340 L 330,420 L 180,430 L 120,400 L 40,410 Z"
                  fill="#13213b"
                  stroke="#1d2f50"
                  strokeWidth="1.5"
                ></path>
                <path
                  d="M 380,440 L 620,430 L 980,410 L 1000,520 L 760,560 L 490,550 L 410,500 L 360,470 Z"
                  fill="#152440"
                  stroke="#1f3459"
                  strokeWidth="1.5"
                ></path>
                <path d="M 440,380 L 610,370 L 630,415 L 450,425 Z" fill="#122038" stroke="#1d2f50" strokeWidth="1"></path>
                <path d="M 330,420 Q 380,400 450,425" stroke="#334d77" strokeDasharray="4 2" strokeWidth="3"></path>
                <path d="M 420,335 Q 490,350 490,430" stroke="#385482" strokeWidth="4"></path>
                <text fill="#4d6f9f" fontFamily="JetBrains Mono" fontSize="9" transform="rotate(35 440,360)" x="440" y="360">
                  THIRD MAINLAND BRIDGE
                </text>
                <path d="M 80,40 L 220,120 L 360,240 L 420,335" stroke="#1c2f4f" strokeWidth="3"></path>
                <path d="M 490,430 L 700,435 L 940,425" stroke="#223b63" strokeWidth="4"></path>
                <text fill="#4d6f9f" fontFamily="JetBrains Mono" fontSize="10" x="730" y="425">
                  LEKKI-EPE EXPRESSWAY
                </text>
                <text fill="#657d9f" fontFamily="Inter" fontSize="12" fontWeight="700" letterSpacing="1.5" x="140" y="90">
                  IKEJA DISPATCH HUB
                </text>
                <text fill="#657d9f" fontFamily="Inter" fontSize="11" fontWeight="700" letterSpacing="1.5" x="210" y="220">
                  SURULERE
                </text>
                <text fill="#657d9f" fontFamily="Inter" fontSize="11" fontWeight="700" letterSpacing="1.5" x="360" y="270">
                  YABA TECH HUB
                </text>
                <text fill="#657d9f" fontFamily="Inter" fontSize="12" fontWeight="700" letterSpacing="1.5" x="480" y="475">
                  VICTORIA ISLAND
                </text>
                <text fill="#657d9f" fontFamily="Inter" fontSize="13" fontWeight="700" letterSpacing="1.5" x="730" y="490">
                  LEKKI PHASE 1
                </text>
                {/* Active Routes */}
                <path
                  d="M 180,110 L 260,170 L 350,250 L 280,310"
                  filter="url(#glow)"
                  stroke="#2563eb"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3.5"
                ></path>
                <path
                  d="M 350,250 L 420,335 L 490,430 L 640,435 L 750,460"
                  opacity="0.8"
                  stroke="#007f36"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                ></path>
                {/* Origin Hub */}
                <circle cx="180" cy="110" fill="#004ac6" r="5" stroke="#ffffff" strokeWidth="2"></circle>
                {/* En route Rider */}
                <g transform="translate(305, 290)">
                  <circle className="animate-ping" cx="0" cy="0" fill="#2563eb" fillOpacity="0.25" r="14"></circle>
                  <circle cx="0" cy="0" fill="#2563eb" r="9" stroke="#ffffff" strokeWidth="2"></circle>
                  <polygon fill="#ffffff" points="-3,-3 5,0 -3,3"></polygon>
                </g>
                {/* Stop 4 Surulere */}
                <g transform="translate(280, 310)">
                  <circle cx="0" cy="0" fill="#16a34a" r="8" stroke="#ffffff" strokeWidth="2"></circle>
                  <text fill="#ffffff" fontFamily="JetBrains Mono" fontSize="8" fontWeight="700" x="-3" y="3">
                    4
                  </text>
                </g>
              </svg>

              {/* Stop Preview Card */}
              <div className="absolute top-[210px] left-[130px] z-30 max-w-[270px] bg-surface-container-lowest/95 backdrop-blur-md p-3 rounded-xl shadow-md border border-outline-variant/30">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-mono-sm text-[10px] font-bold">
                      STOP #04
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-tertiary/10 text-tertiary font-label-caps text-[9px]">
                      96% Trusted
                    </span>
                  </div>
                  <span className="font-mono-sm text-[10px] text-primary font-semibold">ETA 6 min</span>
                </div>
                <div className="mt-2 space-y-0.5">
                  <p className="font-body-md text-[12px] font-semibold text-on-surface line-clamp-1">
                    Beside Central Mosque, Yellow Gate
                  </p>
                  <p className="font-body-sm text-[11px] text-on-surface-variant">
                    Surulere • <span className="font-mono-sm text-[10px]">6.5012, 3.3581</span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative w-full flex-1 min-h-[480px]">
              <MapComponent
                locations={deliveries.map((d) => ({
                  id: d.id,
                  latitude: d.latitude,
                  longitude: d.longitude,
                  landmarkText: d.landmarkText,
                  gateDescription: d.gateDescription,
                  confidenceScore: d.confidenceScore,
                  status: d.statusCategory,
                  contactName: d.recipientName,
                }))}
                origin={{ latitude: 6.5954, longitude: 3.3431, label: 'Ikeja Dispatch Hub' }}
                selectedLocationId={selectedMapLocationId}
              />
            </div>
          )}
        </div>

        {/* Right Side: Active Dispatch Stream & Hub Intelligence (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col space-y-space-md">
          {/* Live Geofence Stream */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 space-y-space-md flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <h2 className="font-headline-sm text-base text-on-surface font-semibold">
                  Active Dispatch Stream
                </h2>
              </div>
              <span className="font-mono-sm text-mono-sm text-on-surface-variant">AUTO-REFRESH 3s</span>
            </div>

            <div className="space-y-space-xs">
              <div className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono-sm text-mono-sm font-semibold text-primary">#DLV-10294</span>
                  <span className="font-label-caps text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                    APPROACHING GATE
                  </span>
                </div>
                <p className="font-body-sm text-[12px] text-on-surface font-medium">
                  Surulere Hub • Musa Ibrahim
                </p>
                <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-mono-sm">
                  <span>Distance: 420m</span>
                  <span className="text-tertiary font-semibold">Gate Match: 96%</span>
                </div>
              </div>

              <div className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono-sm text-mono-sm font-semibold text-secondary">#DLV-10295</span>
                  <span className="font-label-caps text-[9px] px-1.5 py-0.5 rounded bg-tertiary/10 text-tertiary font-bold">
                    DELIVERED
                  </span>
                </div>
                <p className="font-body-sm text-[12px] text-on-surface font-medium">
                  Lekki Phase 1 • Emeka Nwosu
                </p>
                <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-mono-sm">
                  <span>POD: Geostamp + OTP</span>
                  <span className="text-on-surface">24m ago</span>
                </div>
              </div>

              <Link
                href="/dashboard/corrections"
                className="block p-space-sm rounded-lg bg-error-container/20 hover:bg-error-container/30 transition-colors space-y-1 border border-error-container/60"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono-sm text-mono-sm font-semibold text-error">#DLV-10297</span>
                  <span className="font-label-caps text-[9px] px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-bold">
                    GATE CONFLICT
                  </span>
                </div>
                <p className="font-body-sm text-[12px] text-on-surface font-medium">
                  Ikeja GRA • Sunday Oladipo
                </p>
                <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-mono-sm">
                  <span className="text-error font-medium">Confidence: 54%</span>
                  <span className="text-primary font-semibold">Review Loop →</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Landmark Trust Health */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 space-y-space-md">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-base text-on-surface font-semibold">
                Lagos Landmark Trust
              </h3>
              <span className="font-label-caps px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold">
                OPTIMIZED
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-body-sm text-body-sm">
                <span className="text-on-surface-variant">Gate Landmark Trust Distribution</span>
                <span className="font-mono-sm text-mono-sm font-semibold text-on-surface">14,280 Pts</span>
              </div>
              <div className="w-full flex h-2 rounded-full overflow-hidden bg-surface-container-low">
                <div className="bg-tertiary h-full" style={{ width: '82%' }}></div>
                <div className="bg-[#d97706] h-full" style={{ width: '12%' }}></div>
                <div className="bg-error h-full" style={{ width: '6%' }}></div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-label-caps text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> 82% Gate Confirmed
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]"></span> 12% Inferred
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-error"></span> 6% Drift
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Delivery Activity Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 overflow-hidden flex flex-col space-y-space-md p-space-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm flex-1 max-w-md">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-surface-container-low text-on-surface placeholder:text-on-surface-variant text-body-sm rounded-lg focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all border border-outline-variant/40"
                placeholder="Filter deliveries by recipient, address landmark, rider..."
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-space-sm">
            <div className="flex items-center gap-1 px-2.5 py-1 bg-surface-container-low rounded-lg text-on-surface font-body-sm border border-outline-variant/40">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">filter_list</span>
              <select
                value={confidenceFilter}
                onChange={(e) => setConfidenceFilter(e.target.value as any)}
                className="bg-transparent border-none outline-none font-medium cursor-pointer text-primary"
              >
                <option value="ALL">All Confidences</option>
                <option value="TRUSTED">Trusted (≥80%)</option>
                <option value="UNVERIFIED">Unverified (&lt;80%)</option>
                <option value="FLAGGED">Flagged / Conflicts</option>
              </select>
            </div>
            <Link
              href="/dashboard/deliveries"
              className="text-primary font-body-sm hover:underline font-medium text-xs px-2 py-1"
            >
              View Full Dispatch Table →
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low font-label-caps text-label-caps text-on-surface-variant">
                <th className="py-2.5 px-3 rounded-l-lg">DELIVERY ID</th>
                <th className="py-2.5 px-3">RECIPIENT & DESTINATION METADATA</th>
                <th className="py-2.5 px-3">ASSIGNED RIDER</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3">GEO-CONFIDENCE</th>
                <th className="py-2.5 px-3">TIMELAPSE</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low font-body-sm">
              {filteredDeliveries.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-surface-container-low/60 transition-colors group ${
                    item.statusCategory === 'FLAGGED' ? 'bg-error-container/10' : ''
                  }`}
                >
                  <td className="py-3 px-3">
                    <span
                      className={`font-mono-md text-mono-md font-semibold ${
                        item.statusCategory === 'FLAGGED' ? 'text-error' : 'text-primary'
                      }`}
                    >
                      #{item.id}
                    </span>
                  </td>

                  <td className="py-3 px-3 max-w-xs">
                    <div className="flex flex-col">
                      <span className="font-medium text-on-surface font-body-md">{item.recipientName}</span>
                      <span className="text-on-surface-variant text-[11px] truncate">{item.landmarkText}</span>
                      {item.gateDescription && (
                        <span className="text-secondary text-[10px] truncate">{item.gateDescription}</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-mono-sm text-[10px] font-bold">
                        {item.riderName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-on-surface font-medium">{item.riderName}</span>
                        <span className="text-[10px] text-on-surface-variant">{item.riderVehicle}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    {item.status === 'DELIVERED' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-label-caps text-[10px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                        DELIVERED
                      </span>
                    )}
                    {item.status === 'EN_ROUTE' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-caps text-[10px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        EN ROUTE
                      </span>
                    )}
                    {item.status === 'ASSIGNED' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-caps text-[10px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                        ASSIGNED
                      </span>
                    )}
                    {item.status === 'FAILED' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-caps text-[10px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                        FAILED (RIDER LOOP)
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    {item.statusCategory === 'TRUSTED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-tertiary/10 text-tertiary font-mono-sm text-[11px] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> {item.confidenceScore}% Trusted
                      </span>
                    )}
                    {item.statusCategory === 'UNVERIFIED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#fffbeb] text-[#92400e] font-mono-sm text-[11px] font-medium border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]"></span> {item.confidenceScore}% Unverified
                      </span>
                    )}
                    {item.statusCategory === 'FLAGGED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-error-container text-on-error-container font-mono-sm text-[11px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-error"></span> {item.confidenceScore}% Conflict Flag
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 font-mono-sm text-mono-sm text-on-surface-variant">
                    {item.timeAgo}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {item.statusCategory === 'FLAGGED' ? (
                        <Link
                          href="/dashboard/corrections"
                          className="px-2 py-1 rounded bg-error-container text-on-error-container hover:bg-error/20 font-label-caps transition-colors font-bold"
                        >
                          Resolve
                        </Link>
                      ) : (
                        <Link
                          href="/dashboard/deliveries"
                          className="px-2 py-1 rounded bg-surface-container-low hover:bg-surface-container text-primary font-label-caps transition-colors font-semibold"
                        >
                          Details
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Location Capture Modal */}
      {isCaptureModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 max-w-lg w-full shadow-xl space-y-4 text-on-surface">
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
                    PRD FR1-FR3: Drop pin + landmark text + structured access fields
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCaptureModalOpen(false)}
                className="p-1 rounded hover:bg-surface-container-low text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {captureSuccessMsg && (
              <div className="p-3 bg-tertiary/10 border border-tertiary/30 rounded-lg text-tertiary text-xs font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>{captureSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveLocation} className="space-y-3 font-body-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={captureLat}
                    onChange={(e) => setCaptureLat(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface font-mono-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={captureLng}
                    onChange={(e) => setCaptureLng(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface font-mono-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1">
                  Landmark Description <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Beside Central Mosque, Yellow Gate, Surulere"
                  value={captureLandmark}
                  onChange={(e) => setCaptureLandmark(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1">
                    Gate Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Yellow double gate"
                    value={captureGate}
                    onChange={(e) => setCaptureGate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1">
                    Contact Recipient
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Musa Ibrahim"
                    value={captureContact}
                    onChange={(e) => setCaptureContact(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <ImageCapturePicker
                  value={capturePhotoUrl}
                  onChange={setCapturePhotoUrl}
                  label="Entrance / Gate Photo (Pick from device or use camera)"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsCaptureModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingLocation}
                  className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-medium transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSavingLocation && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>Save Location</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
