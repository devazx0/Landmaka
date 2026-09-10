'use client';

import React, { useState, useEffect } from 'react';
import {
  getAdminPricing,
  saveAdminPricing,
  getAdminBusinesses,
  INITIAL_INVOICES,
  appendAdminAuditLog,
  type AdminPricingConfig,
  type AdminInvoiceRecord,
  type AdminBusiness,
} from '@/lib/admin-data';

export default function AdminFinancesPage() {
  const [pricing, setPricing] = useState<AdminPricingConfig>(getAdminPricing());
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [invoices, setInvoices] = useState<AdminInvoiceRecord[]>(INITIAL_INVOICES);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'OVERDUE'>('ALL');

  // Form states for custom charging configuration
  const [captureFee, setCaptureFee] = useState(pricing.baseLocationCaptureNgn);
  const [routingFee, setRoutingFee] = useState(pricing.baseRouteOptimizationStopNgn);
  const [podFee, setPodFee] = useState(pricing.basePodVerificationNgn);
  const [starterFee, setStarterFee] = useState(pricing.starterMonthlyFeeNgn);
  const [growthFee, setGrowthFee] = useState(pricing.growthMonthlyFeeNgn);
  const [enterpriseFee, setEnterpriseFee] = useState(pricing.enterpriseMonthlyFeeNgn);
  const [discount10k, setDiscount10k] = useState(pricing.bulkDiscountPercentOver10k);
  const [discount50k, setDiscount50k] = useState(pricing.bulkDiscountPercentOver50k);

  // Feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeInvoiceModal, setActiveInvoiceModal] = useState<AdminInvoiceRecord | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    setPricing(getAdminPricing());
    setBusinesses(getAdminBusinesses());
  }, []);

  const totalRevenue = businesses.reduce((acc, b) => acc + b.totalSpendNgn, 0);
  const totalWalletBalances = businesses.reduce((acc, b) => acc + Math.max(0, b.walletBalanceNgn), 0);
  const totalOverdueDebt = businesses.reduce((acc, b) => acc + (b.walletBalanceNgn < 0 ? Math.abs(b.walletBalanceNgn) : 0), 0);
  
  // Calculate estimated Monthly Recurring Revenue (MRR) based on tiers
  const estimatedMrr = businesses.reduce((acc, b) => {
    if (b.status === 'SUSPENDED') return acc;
    if (b.tier === 'Enterprise') return acc + pricing.enterpriseMonthlyFeeNgn;
    if (b.tier === 'Growth') return acc + pricing.growthMonthlyFeeNgn;
    return acc + pricing.starterMonthlyFeeNgn;
  }, 0);

  const handleSavePricingConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AdminPricingConfig = {
      ...pricing,
      baseLocationCaptureNgn: captureFee,
      baseRouteOptimizationStopNgn: routingFee,
      basePodVerificationNgn: podFee,
      starterMonthlyFeeNgn: starterFee,
      growthMonthlyFeeNgn: growthFee,
      enterpriseMonthlyFeeNgn: enterpriseFee,
      bulkDiscountPercentOver10k: discount10k,
      bulkDiscountPercentOver50k: discount50k,
    };

    setPricing(updated);
    saveAdminPricing(updated);

    appendAdminAuditLog({
      adminUser: 'Azeem Sanusi',
      action: 'GLOBAL_PRICING_UPDATED',
      targetEntity: 'Platform Charging Engine',
      details: `Updated Base Rates: Capture ₦${captureFee}, Routing ₦${routingFee}, PoD ₦${podFee}`,
      ipAddress: '197.210.44.18',
      level: 'INFO',
    });

    showToast('Platform charging rates & billing thresholds saved successfully.');
  };

  const handleResetDefaults = () => {
    setCaptureFee(25.0);
    setRoutingFee(40.0);
    setPodFee(15.0);
    setStarterFee(35000);
    setGrowthFee(95000);
    setEnterpriseFee(280000);
    setDiscount10k(12);
    setDiscount50k(25);
    showToast('Rates reset to standard pilot defaults.');
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter === 'ALL') return true;
    return inv.status === statusFilter;
  });

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
              Platform Finances & Charging Engine
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-label-caps text-[10px] font-bold border border-emerald-200">
              PRD §10 PRICING & REVENUE
            </span>
          </div>
          <p className="font-body-md text-on-surface-variant text-xs mt-1">
            Superadmin financial control: customize API per-transaction rates, manage partner billing tiers, track collected fees, and review invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs font-mono-sm text-on-surface">
            Currency: <strong className="text-primary font-bold">NGN (₦)</strong>
          </div>
        </div>
      </div>

      {/* Financial Health KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-xs font-medium uppercase font-label-caps">Gross Revenue LTD</span>
            <span className="material-symbols-outlined text-[20px] text-tertiary">account_balance</span>
          </div>
          <div className="text-2xl font-bold font-headline-lg text-on-surface">
            ₦{totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-on-surface-variant flex items-center justify-between pt-1 border-t border-outline-variant/20 font-mono-sm">
            <span>Collected via Gateways:</span>
            <span className="font-bold text-tertiary">100%</span>
          </div>
        </div>

        {/* MRR */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-xs font-medium uppercase font-label-caps">Platform Base MRR</span>
            <span className="material-symbols-outlined text-[20px] text-indigo-600">event_repeat</span>
          </div>
          <div className="text-2xl font-bold font-headline-lg text-on-surface">
            ₦{estimatedMrr.toLocaleString()}
          </div>
          <div className="text-[11px] text-on-surface-variant flex items-center justify-between pt-1 border-t border-outline-variant/20 font-mono-sm">
            <span>From Active Partner Tiers:</span>
            <span className="font-bold text-indigo-600">{businesses.filter((b) => b.status === 'ACTIVE').length} Fleets</span>
          </div>
        </div>

        {/* Prepaid Wallet Balances in Escrow */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-xs font-medium uppercase font-label-caps">Prepaid Escrow Held</span>
            <span className="material-symbols-outlined text-[20px] text-primary">account_balance_wallet</span>
          </div>
          <div className="text-2xl font-bold font-headline-lg text-on-surface">
            ₦{totalWalletBalances.toLocaleString()}
          </div>
          <div className="text-[11px] text-on-surface-variant flex items-center justify-between pt-1 border-t border-outline-variant/20 font-mono-sm">
            <span>Available for Instant Draw:</span>
            <span className="font-bold text-primary">Live API Metering</span>
          </div>
        </div>

        {/* Delinquent Overdue */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-xs font-medium uppercase font-label-caps">Delinquent Debt / Deficit</span>
            <span className="material-symbols-outlined text-[20px] text-error">money_off</span>
          </div>
          <div className="text-2xl font-bold font-headline-lg text-error">
            ₦{totalOverdueDebt.toLocaleString()}
          </div>
          <div className="text-[11px] text-on-surface-variant flex items-center justify-between pt-1 border-t border-outline-variant/20 font-mono-sm">
            <span>Auto-suspension applied:</span>
            <span className="font-bold text-error">1 Tenant</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Charging Customizer Engine & Revenue Service Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Charging Engine Form */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/30 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
            <div>
              <h2 className="font-headline-sm text-sm font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-[20px]">tune</span>
                <span>Customize Platform Charging Rates & Unit Economics</span>
              </h2>
              <p className="font-mono-sm text-[11px] text-on-surface-variant mt-0.5">
                Modifications affect all standard tenants immediately. Custom-negotiated enterprise rates remain intact.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs font-mono-sm text-on-surface-variant hover:text-on-surface underline"
            >
              Reset to Defaults
            </button>
          </div>

          <form onSubmit={handleSavePricingConfig} className="space-y-4">
            {/* Unit Transaction Pricing */}
            <div>
              <h3 className="text-xs font-bold uppercase font-label-caps text-indigo-700 tracking-wider mb-2">
                1. Unit API Transaction Pricing (Per Call / Action)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono-sm text-xs">
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-1">
                  <label className="block font-semibold text-on-surface">
                    Location Capture Fee (Flow A)
                  </label>
                  <p className="text-[10px] text-on-surface-variant font-sans">
                    Charged when partner records pin + landmark + photo.
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-on-surface-variant font-bold">₦</span>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      className="w-full p-1.5 rounded bg-surface-container-lowest border border-outline-variant/50 focus:border-indigo-600 focus:outline-none font-bold text-on-surface"
                      value={captureFee}
                      onChange={(e) => setCaptureFee(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-1">
                  <label className="block font-semibold text-on-surface">
                    Route Stop Fee (Flow B)
                  </label>
                  <p className="text-[10px] text-on-surface-variant font-sans">
                    OSRM multi-stop sequencing fee per package stop.
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-on-surface-variant font-bold">₦</span>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      className="w-full p-1.5 rounded bg-surface-container-lowest border border-outline-variant/50 focus:border-indigo-600 focus:outline-none font-bold text-on-surface"
                      value={routingFee}
                      onChange={(e) => setRoutingFee(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-1">
                  <label className="block font-semibold text-on-surface">
                    Proof-of-Delivery / OTP (Flow C)
                  </label>
                  <p className="text-[10px] text-on-surface-variant font-sans">
                    Geotag, drop-off photo & OTP storage per delivery.
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-on-surface-variant font-bold">₦</span>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      className="w-full p-1.5 rounded bg-surface-container-lowest border border-outline-variant/50 focus:border-indigo-600 focus:outline-none font-bold text-on-surface"
                      value={podFee}
                      onChange={(e) => setPodFee(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Subscription Tiers */}
            <div>
              <h3 className="text-xs font-bold uppercase font-label-caps text-indigo-700 tracking-wider mb-2">
                2. Base Monthly Platform Commitments (Tier Retainers)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono-sm text-xs">
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
                  <label className="block font-semibold text-on-surface">Starter Tier (₦/mo)</label>
                  <span className="text-[10px] text-on-surface-variant font-sans">Up to 1,000 req/min</span>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-on-surface-variant font-bold">₦</span>
                    <input
                      type="number"
                      step="1000"
                      className="w-full p-1.5 rounded bg-surface-container-lowest border border-outline-variant/50 focus:border-indigo-600 focus:outline-none font-bold text-on-surface"
                      value={starterFee}
                      onChange={(e) => setStarterFee(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
                  <label className="block font-semibold text-on-surface">Growth Tier (₦/mo)</label>
                  <span className="text-[10px] text-on-surface-variant font-sans">Up to 2,500 req/min</span>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-on-surface-variant font-bold">₦</span>
                    <input
                      type="number"
                      step="1000"
                      className="w-full p-1.5 rounded bg-surface-container-lowest border border-outline-variant/50 focus:border-indigo-600 focus:outline-none font-bold text-on-surface"
                      value={growthFee}
                      onChange={(e) => setGrowthFee(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
                  <label className="block font-semibold text-on-surface">Enterprise Tier (₦/mo)</label>
                  <span className="text-[10px] text-on-surface-variant font-sans">Up to 5,000 req/min</span>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-on-surface-variant font-bold">₦</span>
                    <input
                      type="number"
                      step="1000"
                      className="w-full p-1.5 rounded bg-surface-container-lowest border border-outline-variant/50 focus:border-indigo-600 focus:outline-none font-bold text-on-surface"
                      value={enterpriseFee}
                      onChange={(e) => setEnterpriseFee(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Volume Discounts & Safety */}
            <div>
              <h3 className="text-xs font-bold uppercase font-label-caps text-indigo-700 tracking-wider mb-2">
                3. Automated Volume Discounts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono-sm text-xs">
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-on-surface block">&gt; 10,000 monthly deliveries</span>
                    <span className="text-[10px] text-on-surface-variant font-sans">Automatic discount on unit fees</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      className="w-16 p-1.5 rounded bg-surface-container-lowest border border-outline-variant/50 text-center font-bold text-on-surface"
                      value={discount10k}
                      onChange={(e) => setDiscount10k(parseFloat(e.target.value) || 0)}
                    />
                    <span className="font-bold">%</span>
                  </div>
                </div>

                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-on-surface block">&gt; 50,000 monthly deliveries</span>
                    <span className="text-[10px] text-on-surface-variant font-sans">Enterprise scale discount</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="70"
                      className="w-16 p-1.5 rounded bg-surface-container-lowest border border-outline-variant/50 text-center font-bold text-on-surface"
                      value={discount50k}
                      onChange={(e) => setDiscount50k(parseFloat(e.target.value) || 0)}
                    />
                    <span className="font-bold">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Apply Platform Charging Config</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Platform Fee Breakdown & Economics Summary */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/30 p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="font-headline-sm text-sm font-semibold text-on-surface pb-3 border-b border-outline-variant/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">pie_chart</span>
              <span>Revenue Distribution by Service</span>
            </h2>

            <div className="space-y-4 mt-3">
              {/* Route Optimization Stop Fee */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono-sm">
                  <span className="text-on-surface font-medium">OSRM Route Sequencing</span>
                  <span className="font-bold text-indigo-700">46% (₦2.32M)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '46%' }} />
                </div>
              </div>

              {/* Location Capture Fee */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono-sm">
                  <span className="text-on-surface font-medium">Location Capture (Flow A)</span>
                  <span className="font-bold text-primary">34% (₦1.72M)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '34%' }} />
                </div>
              </div>

              {/* Proof of Delivery */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono-sm">
                  <span className="text-on-surface font-medium">Proof of Delivery / OTP</span>
                  <span className="font-bold text-tertiary">20% (₦1.01M)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full bg-tertiary rounded-full" style={{ width: '20%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Unit Economics Simulation Callout */}
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1.5 text-xs">
            <span className="font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-tertiary">calculate</span>
              <span>Average Cost per Delivery Run:</span>
            </span>
            <div className="text-2xl font-bold font-mono-sm text-on-surface">
              ₦{(captureFee * 0.3 + routingFee + podFee).toFixed(2)}
            </div>
            <p className="text-[11px] text-on-surface-variant font-body-sm leading-relaxed">
              Based on ~30% first-time location capture rate + 1 routing stop + 1 proof-of-delivery confirmation.
            </p>
          </div>
        </div>
      </div>

      {/* Partner Invoices & Billing Ledger */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/30 overflow-hidden">
        <div className="p-4 border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-sm text-on-surface">Merchant Invoicing & Settlement Ledger</h3>
            <p className="text-xs font-mono-sm text-on-surface-variant">Monthly consolidated billing statements across all Nigerian fleets</p>
          </div>

          <div className="flex items-center gap-1.5">
            {(['ALL', 'PAID', 'PENDING', 'OVERDUE'] as const).map((st) => (
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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-sm">
            <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/30 uppercase text-[10px]">
              <tr>
                <th className="px-4 py-2.5">Invoice #</th>
                <th className="px-4 py-2.5">Partner Fleet</th>
                <th className="px-4 py-2.5">Billing Period</th>
                <th className="px-4 py-2.5">Amount (₦)</th>
                <th className="px-4 py-2.5">Payment Method</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-on-surface">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-primary">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 font-sans font-medium text-on-surface">{inv.businessName}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{inv.period}</td>
                  <td className="px-4 py-3 font-bold">₦{inv.amountNgn.toLocaleString()}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{inv.paymentGateway}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'PAID'
                          ? 'bg-tertiary/10 text-tertiary'
                          : inv.status === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-700'
                          : 'bg-error-container text-on-error-container'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setActiveInvoiceModal(inv)}
                      className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-[11px] font-medium transition-colors"
                    >
                      View Breakdown
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Breakdown Modal */}
      {activeInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/50 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div>
                <span className="text-xs font-mono-sm text-primary font-bold">{activeInvoiceModal.invoiceNumber}</span>
                <h3 className="font-headline-sm text-sm font-semibold text-on-surface">
                  {activeInvoiceModal.businessName}
                </h3>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono-sm ${
                  activeInvoiceModal.status === 'PAID'
                    ? 'bg-tertiary/10 text-tertiary'
                    : 'bg-amber-500/10 text-amber-700'
                }`}
              >
                {activeInvoiceModal.status}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono-sm">
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span>Billing Period:</span>
                <span className="font-semibold text-on-surface">{activeInvoiceModal.period}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span>Location Captures ({activeInvoiceModal.itemBreakdown.locationCaptures.toLocaleString()}):</span>
                <span className="font-semibold text-on-surface">
                  ₦{(activeInvoiceModal.itemBreakdown.locationCaptures * pricing.baseLocationCaptureNgn).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span>Route Optimization Stops ({activeInvoiceModal.itemBreakdown.routeStops.toLocaleString()}):</span>
                <span className="font-semibold text-on-surface">
                  ₦{(activeInvoiceModal.itemBreakdown.routeStops * pricing.baseRouteOptimizationStopNgn).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span>Proof of Delivery ({activeInvoiceModal.itemBreakdown.podVerifications.toLocaleString()}):</span>
                <span className="font-semibold text-on-surface">
                  ₦{(activeInvoiceModal.itemBreakdown.podVerifications * pricing.basePodVerificationNgn).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 text-sm font-bold text-on-surface pt-2">
                <span>Total Amount:</span>
                <span>₦{activeInvoiceModal.amountNgn.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveInvoiceModal(null)}
                className="px-4 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-xs font-medium text-on-surface"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
