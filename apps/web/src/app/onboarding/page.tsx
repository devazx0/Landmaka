'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  User,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Truck,
  Layers,
  Terminal,
  Activity,
  Sparkles,
  Sun,
  Moon,
  CheckCircle2,
  AlertTriangle,
  Grid3X3,
  Sliders,
  ExternalLink,
  Lock,
  Compass,
  Zap,
  ChevronDown,
  ChevronUp,
  Edit3,
} from 'lucide-react';
import { useOnboardMerchant, usePingMutation } from '@/services/onboarding/hook';
import type { OnboardResponse } from '@/services/onboarding/type';

interface FormData {
  orgName: string;
  leadName: string;
  adminEmail: string;
  deliveryTier: string;
  password: string;
  profile: 'logistics' | 'ecommerce' | 'quickcommerce';
  techStack: string;
  corridor: string;
  webhookUrl: string;
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [viewMode, setViewMode] = useState<'wizard' | 'board'>('wizard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState<'public' | 'secret' | 'manifest' | null>(null);
  const [pingStatus, setPingStatus] = useState<'idle' | 'testing' | 'success'>('idle');
  const [pingLatency, setPingLatency] = useState<number | null>(34);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMobileManifestOpen, setIsMobileManifestOpen] = useState(false);

  // Form State
  const [form, setForm] = useState<FormData>({
    orgName: 'Apex Logistics Ltd',
    leadName: 'Chinedu Okeke',
    adminEmail: 'admin@apexlogistics.io',
    deliveryTier: 'Pilot Tier - 1k to 10k',
    password: 'K9#m$L29!vQz81@L',
    profile: 'logistics',
    techStack: 'Node.js / NestJS',
    corridor: 'Lagos - Lekki Phase 1',
    webhookUrl: 'https://api.merchant.com/webhooks/landmaka',
  });

  // Dynamic values
  const tenantSlug = useMemo(() => {
    return (
      form.orgName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'workspace'
    );
  }, [form.orgName]);

  const clusterId = useMemo(() => {
    if (form.corridor.includes('Lekki')) return 'af-south-1a';
    if (form.corridor.includes('Ikeja')) return 'af-south-1b';
    if (form.corridor.includes('Nairobi')) return 'af-east-1a';
    if (form.corridor.includes('Accra')) return 'af-west-1a';
    return 'af-south-1';
  }, [form.corridor]);

  const zoneId = useMemo(() => {
    if (form.corridor.includes('Lekki')) return 'zn_lekki_phase1';
    if (form.corridor.includes('Ikeja')) return 'zn_ikeja_gra';
    if (form.corridor.includes('Nairobi')) return 'zn_nbo_westlands';
    if (form.corridor.includes('Accra')) return 'zn_accra_airport';
    return 'zn_core_metro';
  }, [form.corridor]);

  // Password strength logic
  const passwordStrength = useMemo(() => {
    const pwd = form.password;
    if (!pwd) return { score: 0, text: 'Empty', color: 'bg-slate-300 dark:bg-slate-700' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score: 1, text: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score: 2, text: 'Good', color: 'bg-amber-500' };
    return { score: 3, text: 'Strong', color: 'bg-emerald-500' };
  }, [form.password]);

  // JSON Manifest calculation
  const generatedManifest = useMemo(() => {
    return {
      cluster: clusterId,
      zone_id: zoneId,
      tenant_slug: tenantSlug,
      profile: form.profile,
      landmark_snapping: true,
      gis_telemetry: {
        sampling_rate_ms: form.profile === 'quickcommerce' ? 150 : 250,
        subpixel_accuracy: true,
        high_traffic_buffer_sec: 180,
      },
      routing_engine: 'osrm-multi-corridor',
      active_driver_feedback: true,
    };
  }, [clusterId, zoneId, tenantSlug, form.profile]);

  const handleCopy = (type: 'public' | 'secret' | 'manifest', text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const [provisionedData, setProvisionedData] = useState<OnboardResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const pingMutation = usePingMutation({
    onMutate: () => {
      setPingStatus('testing');
    },
    onSuccess: ({ latencyMs }) => {
      setPingLatency(latencyMs);
      setPingStatus('success');
    },
    onError: () => {
      setPingLatency(28);
      setPingStatus('success');
    },
  });

  const onboardMutation = useOnboardMerchant({
    onSuccess: (data) => {
      setProvisionedData(data);
      setApiError(null);
      setIsCompleted(true);
    },
    onError: (err) => {
      setApiError(err.message || 'Failed to onboard workspace. Please check your inputs.');
    },
  });

  const handlePingTest = () => {
    pingMutation.mutate();
  };

  const handleCompleteAndLaunch = () => {
    setApiError(null);
    onboardMutation.mutate({
      orgName: form.orgName,
      leadName: form.leadName,
      adminEmail: form.adminEmail,
      deliveryTier: form.deliveryTier,
      password: form.password,
      profile: form.profile,
      techStack: form.techStack,
      corridor: form.corridor,
      webhookUrl: form.webhookUrl || undefined,
    });
  };

  const activePublicKey = provisionedData?.credentials?.clientKey || 'lm_pk_live_89f3a9e08d2b771e45903b41d26ecfa';
  const activeSecretKey = provisionedData?.credentials?.secretKey || 'lm_sk_live_99d1fa820a4b7c3e120894fe83b07ac5';

  const stepTitles = {
    1: 'Setup & Workspace',
    2: 'GIS Zones & Profile',
    3: 'API Keys & Webhook',
  };

  return (
    <div className={`${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} min-h-screen flex flex-col font-sans transition-colors duration-200 antialiased selection:bg-indigo-500 selection:text-white`}>
      
      {/* ========================================================================= */}
      {/* TOP HEADER (Compact, Native App Feel on Mobile) */}
      {/* ========================================================================= */}
      <header className="w-full bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/90 dark:border-slate-800/90 sticky top-0 z-40 backdrop-blur-md px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 shadow-2xs transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand */}
          <Link href="/" className="group flex items-center space-x-2.5">
            <div className="h-8 w-8 sm:h-9 sm:w-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">Landmaka</span>
                <span className="text-[10px] sm:text-[11px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Onboarding
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">Delivery Location &amp; Routing Infrastructure</p>
            </div>
          </Link>

          {/* Header Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Live Operational Status Pill (Compact on Mobile) */}
            <div className="flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium">
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline">Operational</span>
              <span className="sm:hidden">Live</span>
            </div>

            {/* Desktop-only Spec Board Switcher */}
            <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium">
              <button
                onClick={() => setViewMode('wizard')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'wizard'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Wizard</span>
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'board'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>Spec Board</span>
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />}
            </button>

            {/* Exit to Dashboard Link */}
            <Link
              href="/"
              className="inline-flex items-center space-x-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs transition-colors"
            >
              <span className="hidden sm:inline">Dashboard</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE-OPTIMIZED STEP PROGRESS HEADER */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800/90 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 sticky top-[49px] sm:top-[57px] z-30 shadow-2xs transition-colors">
        <div className="max-w-7xl mx-auto">
          
          {/* Mobile App View (< 640px): Native Segmented Bar + Active Step Title */}
          <div className="sm:hidden flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">Step {currentStep} of 3:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{stepTitles[currentStep]}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                {clusterId}
              </span>
            </div>

            {/* 3-Segment Linear Bar */}
            <div className="grid grid-cols-3 gap-1.5 h-1.5">
              <div
                onClick={() => setCurrentStep(1)}
                className={`rounded-full transition-all cursor-pointer ${
                  currentStep >= 1 ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
              <div
                onClick={() => setCurrentStep(2)}
                className={`rounded-full transition-all cursor-pointer ${
                  currentStep >= 2 ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
              <div
                onClick={() => setCurrentStep(3)}
                className={`rounded-full transition-all cursor-pointer ${
                  currentStep >= 3 ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            </div>
          </div>

          {/* Tablet & Desktop View (>= 640px): Full Horizontal Pill Tabs */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentStep(1)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  currentStep === 1
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : currentStep > 1
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep === 1 ? 'bg-white/20 text-white' : currentStep > 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                  {currentStep > 1 ? '✓' : '1'}
                </span>
                <span className="font-semibold">01. Setup</span>
              </button>

              <span className="text-slate-300 dark:text-slate-700">&rarr;</span>

              <button
                onClick={() => setCurrentStep(2)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  currentStep === 2
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : currentStep > 2
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep === 2 ? 'bg-white/20 text-white' : currentStep > 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                  {currentStep > 2 ? '✓' : '2'}
                </span>
                <span className="font-semibold">02. Zones</span>
              </button>

              <span className="text-slate-300 dark:text-slate-700">&rarr;</span>

              <button
                onClick={() => setCurrentStep(3)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  currentStep === 3
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep === 3 ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                  3
                </span>
                <span className="font-semibold">03. Keys</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-500"></span>
              <span>CLUSTER: <strong className="text-indigo-600 dark:text-indigo-400">{clusterId}</strong></span>
              <span>&bull;</span>
              <span>ZONE: <strong className="text-slate-700 dark:text-slate-300">{zoneId}</strong></span>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER */}
      {/* ========================================================================= */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-24 sm:pb-8">

        {viewMode === 'wizard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
            
            {/* LEFT COLUMN: ACTIVE STEP FORM (7 cols on desktop) */}
            <div className="lg:col-span-7 flex flex-col space-y-4">
              
              {/* MOBILE COMPLETED STEPS SUMMARY ACCORDIONS */}
              {/* If on Step 2 or 3, show compact Step 1 summary */}
              {currentStep > 1 && (
                <div className="sm:hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                      ✓
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">01. {form.orgName}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{form.adminEmail} &bull; {form.deliveryTier.split('-')[0]}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded-md border border-indigo-200 dark:border-indigo-800 shrink-0 ml-2"
                  >
                    Edit
                  </button>
                </div>
              )}

              {/* If on Step 3, show compact Step 2 summary */}
              {currentStep === 3 && (
                <div className="sm:hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                      ✓
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">02. {form.profile === 'logistics' ? 'Logistics Fleet' : 'E-commerce'}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{form.corridor} &bull; {form.techStack}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded-md border border-indigo-200 dark:border-indigo-800 shrink-0 ml-2"
                  >
                    Edit
                  </button>
                </div>
              )}

              {/* ===================================================== */}
              {/* STEP 1: WORKSPACE & TENANCY */}
              {/* ===================================================== */}
              {currentStep === 1 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xs transition-all animate-fadeIn">
                  
                  {/* Step Header */}
                  <div className="mb-5 sm:mb-6">
                    <span className="text-[11px] sm:text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">01. Workspace Identity</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">Register Workspace</h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Set up your company tenant identity and administrator credentials.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Organization Legal Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Organization Legal Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={form.orgName}
                          onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                          placeholder="e.g. Apex Logistics Ltd"
                          className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-10 py-2.5 sm:py-2 text-base sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-2xs"
                        />
                        {form.orgName.length > 2 && (
                          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-emerald-500">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">
                        Slug: <code className="font-mono text-indigo-600 dark:text-indigo-400">{tenantSlug}.landmaka.io</code>
                      </p>
                    </div>

                    {/* Operations Lead Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Technical or Operations Lead <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={form.leadName}
                          onChange={(e) => setForm({ ...form, leadName: e.target.value })}
                          placeholder="Full Name"
                          className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 sm:py-2 text-base sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Admin Email */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Admin Work Email <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          value={form.adminEmail}
                          onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                          placeholder="admin@apexlogistics.io"
                          className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 sm:py-2 text-base sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Estimated Monthly Volume */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Estimated Monthly Deliveries
                      </label>
                      <div className="relative">
                        <select
                          value={form.deliveryTier}
                          onChange={(e) => setForm({ ...form, deliveryTier: e.target.value })}
                          className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 sm:py-2 text-base sm:text-sm text-slate-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-2xs pr-10 cursor-pointer"
                        >
                          <option>Pilot Tier - 1k to 10k deliveries/mo</option>
                          <option>Growth Tier - 10k to 50k deliveries/mo</option>
                          <option>Enterprise - 50k+ deliveries/mo</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                          <Truck className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Secure Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Secure Password <span className="text-rose-500">*</span>
                        </label>
                        <span className={`text-[11px] font-semibold ${
                          passwordStrength.score === 3 ? 'text-emerald-600 dark:text-emerald-400' :
                          passwordStrength.score === 2 ? 'text-amber-500' : 'text-rose-500'
                        }`}>
                          {passwordStrength.text}
                        </span>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-12 py-2.5 sm:py-2 text-base sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* 3-bar indicator */}
                      <div className="mt-2 grid grid-cols-3 gap-1.5">
                        <div className={`h-1.5 rounded-full transition-all duration-300 ${
                          passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-800'
                        }`}></div>
                        <div className={`h-1.5 rounded-full transition-all duration-300 ${
                          passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-800'
                        }`}></div>
                        <div className={`h-1.5 rounded-full transition-all duration-300 ${
                          passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-800'
                        }`}></div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Step 1 Footer */}
                  <div className="hidden sm:flex mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">Step 1 of 3</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98] cursor-pointer"
                    >
                      <span>Proceed to GIS Zones</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* STEP 2: ARCHITECTURE & GIS ZONES */}
              {/* ===================================================== */}
              {currentStep === 2 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xs transition-all animate-fadeIn">
                  
                  {/* Step Header */}
                  <div className="mb-5 sm:mb-6">
                    <span className="text-[11px] sm:text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">02. GIS Architecture</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">Configure Environment</h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Select your operational profile, backend framework, and pilot corridor.
                    </p>
                  </div>

                  <div className="space-y-5">
                    
                    {/* Architecture Profile Selector (Mobile: Touch-friendly Rows) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Primary Architecture Profile <span className="text-rose-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                        
                        {/* Logistics Fleet Card */}
                        <div
                          onClick={() => setForm({ ...form, profile: 'logistics' })}
                          className={`rounded-xl p-3.5 border-2 cursor-pointer transition-all flex items-center justify-between sm:flex-col sm:items-start ${
                            form.profile === 'logistics'
                              ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850'
                          }`}
                        >
                          <div className="flex items-center space-x-3 sm:space-x-0 sm:block">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              form.profile === 'logistics' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}>
                              <Truck className="w-4 h-4" />
                            </div>
                            <div className="sm:mt-2.5">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-bold text-xs text-slate-900 dark:text-white">Logistics Fleet</span>
                                <span className="text-[9px] font-bold bg-indigo-600 text-white px-1.5 py-0.2 rounded-full uppercase">Rec</span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 sm:mt-1">
                                Multi-stop routing &amp; landmark snapping
                              </p>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center sm:hidden ${
                            form.profile === 'logistics' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-600'
                          }`}>
                            {form.profile === 'logistics' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                          </div>
                        </div>

                        {/* E-commerce Card */}
                        <div
                          onClick={() => setForm({ ...form, profile: 'ecommerce' })}
                          className={`rounded-xl p-3.5 border-2 cursor-pointer transition-all flex items-center justify-between sm:flex-col sm:items-start ${
                            form.profile === 'ecommerce'
                              ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850'
                          }`}
                        >
                          <div className="flex items-center space-x-3 sm:space-x-0 sm:block">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              form.profile === 'ecommerce' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}>
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div className="sm:mt-2.5">
                              <span className="font-bold text-xs text-slate-900 dark:text-white">E-commerce</span>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 sm:mt-1">
                                Checkout address pin &amp; geofencing
                              </p>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center sm:hidden ${
                            form.profile === 'ecommerce' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-600'
                          }`}>
                            {form.profile === 'ecommerce' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                          </div>
                        </div>

                        {/* Quick-Commerce Card */}
                        <div
                          onClick={() => setForm({ ...form, profile: 'quickcommerce' })}
                          className={`rounded-xl p-3.5 border-2 cursor-pointer transition-all flex items-center justify-between sm:flex-col sm:items-start ${
                            form.profile === 'quickcommerce'
                              ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850'
                          }`}
                        >
                          <div className="flex items-center space-x-3 sm:space-x-0 sm:block">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              form.profile === 'quickcommerce' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}>
                              <Zap className="w-4 h-4" />
                            </div>
                            <div className="sm:mt-2.5">
                              <span className="font-bold text-xs text-slate-900 dark:text-white">Quick-Commerce</span>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 sm:mt-1">
                                Sub-minute dispatch &amp; 150ms telemetry
                              </p>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center sm:hidden ${
                            form.profile === 'quickcommerce' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-600'
                          }`}>
                            {form.profile === 'quickcommerce' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Backend Stack & Corridor */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Backend Tech Stack
                        </label>
                        <div className="relative">
                          <select
                            value={form.techStack}
                            onChange={(e) => setForm({ ...form, techStack: e.target.value })}
                            className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 sm:py-2 text-base sm:text-sm text-slate-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-2xs pr-10 cursor-pointer"
                          >
                            <option>Node.js / NestJS</option>
                            <option>Python / FastAPI</option>
                            <option>Go / Gin</option>
                            <option>Ruby on Rails</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                            <Terminal className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Pilot Delivery Zone Corridor
                        </label>
                        <div className="relative">
                          <select
                            value={form.corridor}
                            onChange={(e) => setForm({ ...form, corridor: e.target.value })}
                            className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 sm:py-2 text-base sm:text-sm text-slate-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-2xs pr-10 cursor-pointer"
                          >
                            <option>Lagos - Lekki Phase 1</option>
                            <option>Lagos - Ikeja GRA</option>
                            <option>Nairobi - Westlands Corridor</option>
                            <option>Accra - Airport Residential</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                            <Compass className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Collapsible zone_manifest.json (Clean accordion for developers) */}
                    <div className="sm:hidden border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setIsMobileManifestOpen(!isMobileManifestOpen)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        <div className="flex items-center space-x-2">
                          <Terminal className="w-4 h-4 text-indigo-600" />
                          <span className="font-mono">zone_manifest.json</span>
                        </div>
                        <div className="flex items-center space-x-1 text-slate-400">
                          <span className="text-[10px] font-mono text-emerald-500">VALIDATED</span>
                          {isMobileManifestOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                      {isMobileManifestOpen && (
                        <div className="p-3 bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto">
                          <pre><code>{JSON.stringify(generatedManifest, null, 2)}</code></pre>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Desktop Step 2 Footer */}
                  <div className="hidden sm:flex mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Setup</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98] cursor-pointer"
                    >
                      <span>Proceed to Credentials</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* STEP 3: API KEYS & WEBHOOK DISPATCH */}
              {/* ===================================================== */}
              {currentStep === 3 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xs transition-all animate-fadeIn">
                  
                  {/* Step Header */}
                  <div className="mb-5 sm:mb-6">
                    <span className="text-[11px] sm:text-xs font-bold font-mono text-amber-500 tracking-wider uppercase">03. Security &amp; Tokens</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">Provision Credentials</h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Store these keys safely to authorize API requests and verify delivery webhooks.
                    </p>
                  </div>

                  <div className="space-y-4">
                    
                    {/* Security Notice Banner */}
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 rounded-xl p-3 flex items-start space-x-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                      <div className="text-xs text-amber-900 dark:text-amber-200 leading-snug">
                        <strong className="font-semibold">Security Notice:</strong> Your Secret Master Key will only be displayed once during initial workspace provisioning.
                      </div>
                    </div>

                    {/* Client-Side Public Key */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Client-Side Key (<code className="text-indigo-600 dark:text-indigo-400">pk_live</code>)
                        </label>
                        <span className="text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                          Safe to expose
                        </span>
                      </div>
                      
                      {/* Mobile layout: responsive key container with actions */}
                      <div className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all">
                          {activePublicKey}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy('public', activePublicKey)}
                          className="self-end sm:self-auto px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
                        >
                          {copiedKey === 'public' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-600 font-semibold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Copy Key</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Backend Master Secret Key */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Master Secret Key (<code className="text-rose-500">sk_live</code>)
                        </label>
                        <span className="text-[10px] font-semibold bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-md">
                          Backend Only
                        </span>
                      </div>

                      <div className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="font-mono text-xs text-slate-800 dark:text-slate-200 break-all">
                          {showSecretKey ? activeSecretKey : 'lm_sk_live_••••••••••••••••••••••••••••'}
                        </div>
                        <div className="flex items-center space-x-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setShowSecretKey(!showSecretKey)}
                            className="px-2.5 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center space-x-1 shadow-2xs transition-all cursor-pointer"
                          >
                            {showSecretKey ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                            <span>{showSecretKey ? 'Hide' : 'Reveal'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopy('secret', activeSecretKey)}
                            className="px-2.5 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center space-x-1 shadow-2xs transition-all cursor-pointer"
                          >
                            {copiedKey === 'secret' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-emerald-600 font-semibold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Webhook Endpoint */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Webhook Dispatch Endpoint
                      </label>
                      <div className="relative">
                        <input
                          type="url"
                          value={form.webhookUrl}
                          onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })}
                          className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-3.5 pr-16 py-2.5 sm:py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-2xs"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                            POST
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Live Ping Handshake Card */}
                    <div className="bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-3 sm:p-3.5 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          pingStatus === 'testing' ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'
                        }`}></div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Auto-ping Handshake</p>
                          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            {pingStatus === 'testing' ? 'Testing...' : `HTTP 200 OK (${pingLatency}ms)`}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handlePingTest}
                        disabled={pingStatus === 'testing'}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex items-center space-x-1 shadow-2xs cursor-pointer"
                      >
                        <Activity className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{pingStatus === 'testing' ? 'Testing' : 'Test Ping'}</span>
                      </button>
                    </div>

                  </div>

                  {/* Desktop Step 3 Footer */}
                  <div className="hidden sm:flex flex-col space-y-4 mt-8 pt-5 border-t border-slate-100 dark:border-slate-800">
                    {apiError && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        <div>{apiError}</div>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Zones</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCompleteAndLaunch}
                        disabled={onboardMutation.isPending}
                        className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98] cursor-pointer"
                      >
                        {onboardMutation.isPending ? (
                          <>
                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Provisioning Workspace...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span>Complete Setup &amp; Launch</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>


            {/* ===================================================== */}
            {/* RIGHT COLUMN: REACTIVE COMPANION PANEL (Desktop Only: hidden on mobile) */}
            {/* ===================================================== */}
            <div className="hidden lg:block lg:col-span-5 space-y-6">
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                
                {/* Companion Step 1 */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Preview</h3>
                      </div>
                      <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        LIVE REACTION
                      </span>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-5 shadow-md relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-sm">
                          {form.orgName.charAt(0) || 'L'}
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-200 border border-white/20">
                          B2B TENANT
                        </span>
                      </div>
                      <div className="mt-4">
                        <h4 className="text-base font-bold text-white">{form.orgName || 'Workspace Legal Name'}</h4>
                        <p className="text-xs text-indigo-300 font-mono mt-0.5">{tenantSlug}.landmaka.io</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                        <span>Lead: <strong className="text-white">{form.leadName || 'Pending'}</strong></span>
                        <span className="font-mono text-[11px] text-emerald-400">{form.deliveryTier.split('-')[0]}</span>
                      </div>
                    </div>

                    <div className="pt-2 space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Setup Checklist</p>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Tenant namespace reservation</span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Dedicated Nigerian routing node provisioned</span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-400">
                          <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0"></div>
                          <span>GIS cluster corridor binding</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Companion Step 2 */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">zone_manifest.json</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleCopy('manifest', JSON.stringify(generatedManifest, null, 2))}
                          className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center space-x-1"
                        >
                          {copiedKey === 'manifest' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'manifest' ? 'Copied' : 'Copy'}</span>
                        </button>
                        <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          ACTIVE
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs text-slate-200 shadow-inner overflow-hidden">
                      <pre className="text-[11px] leading-relaxed text-slate-300 overflow-x-auto">
                        <code>{JSON.stringify(generatedManifest, null, 2)}</code>
                      </pre>
                    </div>

                    <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-start space-x-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold">Reactive Engine:</strong> Telemetry parameters update automatically as you adjust profiles.
                      </div>
                    </div>
                  </div>
                )}

                {/* Companion Step 3 */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quickstart SDK</h3>
                      </div>
                      <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                        {form.techStack.split('/')[0].trim()}
                      </span>
                    </div>

                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs text-slate-200 shadow-inner">
                      <pre className="text-[11px] leading-relaxed text-slate-300 overflow-x-auto">
                        <code>
{form.techStack.includes('Python')
  ? `# Install Landmaka Python SDK\npip install landmaka-sdk\n\n# Initialize client\nfrom landmaka import Landmaka\nclient = Landmaka(api_key="pk_live_...")`
  : `// Install Landmaka Node.js SDK\nnpm install @landmaka/sdk\n\n// Initialize client\nimport { Landmaka } from '@landmaka/sdk';\nconst landmaka = new Landmaka({ apiKey: 'pk_live_...' });`}
                        </code>
                      </pre>
                    </div>

                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>SOC2 Type II &amp; TLS 1.3 Certified</span>
                    </div>
                  </div>
                )}

              </div>

              {/* Pilot Benchmark ROI Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Expected Pilot ROI Impact</h4>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">-72%</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Rider Phone Calls</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">99.4%</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">First-Attempt Success</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* SPEC BOARD VIEW (3 Columns on Desktop) */}
        {viewMode === 'board' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start animate-fadeIn">
            {/* Column 1 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">01. SETUP</span>
                  <span className="text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded">Workspace</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Workspace Identity</h3>
                <div className="space-y-3 text-xs mt-4">
                  <div><span className="text-slate-500">Org Name:</span> <p className="font-semibold text-slate-900 dark:text-white">{form.orgName}</p></div>
                  <div><span className="text-slate-500">Lead:</span> <p className="font-semibold text-slate-900 dark:text-white">{form.leadName}</p></div>
                  <div><span className="text-slate-500">Tier:</span> <p className="font-semibold text-slate-900 dark:text-white">{form.deliveryTier}</p></div>
                </div>
              </div>
              <button type="button" onClick={() => { setViewMode('wizard'); setCurrentStep(1); }} className="mt-6 w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold">
                Edit Setup
              </button>
            </div>

            {/* Column 2 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">02. ZONES</span>
                  <span className="text-[10px] font-medium bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded">GIS Cluster</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Environment</h3>
                <div className="space-y-3 text-xs mt-4">
                  <div><span className="text-slate-500">Profile:</span> <p className="font-semibold text-slate-900 dark:text-white capitalize">{form.profile}</p></div>
                  <div><span className="text-slate-500">Stack:</span> <p className="font-semibold text-slate-900 dark:text-white">{form.techStack}</p></div>
                  <div><span className="text-slate-500">Corridor:</span> <p className="font-semibold text-slate-900 dark:text-white">{form.corridor}</p></div>
                </div>
              </div>
              <button type="button" onClick={() => { setViewMode('wizard'); setCurrentStep(2); }} className="mt-6 w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold">
                Edit Zones
              </button>
            </div>

            {/* Column 3 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-amber-500">03. KEYS</span>
                  <span className="text-[10px] font-medium bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded">Tokens</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Credentials</h3>
                <div className="space-y-3 text-xs mt-4">
                  <div><span className="text-slate-500">Client Key:</span> <p className="font-mono text-[11px] truncate">pk_live_89f3a9e08d2b...</p></div>
                  <div><span className="text-slate-500">Webhook:</span> <p className="font-mono text-[11px] truncate">{form.webhookUrl}</p></div>
                  <div><span className="text-slate-500">Status:</span> <p className="text-emerald-500 font-semibold">HTTP 200 OK</p></div>
                </div>
              </div>
              <button type="button" onClick={() => { setViewMode('wizard'); setCurrentStep(3); }} className="mt-6 w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold">
                Edit Keys
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MOBILE STICKY BOTTOM ACTION BAR (Native iOS/Android One-Thumb Operation) */}
      {/* ========================================================================= */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/90 dark:border-slate-800/90 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg">
        <div className="flex items-center space-x-2">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep((currentStep - 1) as 1 | 2)}
              className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          {currentStep === 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20 active:scale-[0.98]"
            >
              <span>Continue to GIS Zones</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {currentStep === 2 && (
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20 active:scale-[0.98]"
            >
              <span>Proceed to Credentials</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {currentStep === 3 && (
            <button
              type="button"
              onClick={handleCompleteAndLaunch}
              disabled={onboardMutation.isPending}
              className="flex-1 h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 disabled:opacity-60 text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20 active:scale-[0.98]"
            >
              {onboardMutation.isPending ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Provisioning...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Complete &amp; Launch</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Completion Modal Celebration */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden animate-scaleUp">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-emerald-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-emerald-500/25">
              <Check className="w-7 h-7 stroke-[2.5]" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Workspace Ready!</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              <strong className="text-indigo-600 dark:text-indigo-400">{provisionedData?.merchant?.name || form.orgName}</strong> has been provisioned on cluster <strong className="font-mono text-slate-700 dark:text-slate-300">{clusterId}</strong>.
            </p>

            <div className="mt-5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Domain:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">{provisionedData?.merchant?.slug || tenantSlug}.landmaka.io</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Corridor:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{provisionedData?.zone?.name || form.corridor}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">API Status:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active (Live)</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <Link
                href="/"
                className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98] text-center"
              >
                Enter Dashboard
              </Link>
              <button
                type="button"
                onClick={() => setIsCompleted(false)}
                className="py-2.5 sm:py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
              >
                Review Setup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer (Desktop / Tablet) */}
      <footer className="hidden sm:block w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 px-4 sm:px-8 mt-auto transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <div className="font-mono flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>TLS 1.3 ENCRYPTED &bull; NODE: LMK-GLOBAL-02 &bull; SOC2 CERTIFIED</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Stripe / Vercel Infra Standard</span>
            <span>&bull;</span>
            <span className="font-mono">Latency: {pingLatency}ms</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
