'use client';

import React from 'react';
import {
  TrendingDown,
  PhoneCall,
  XCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Award,
} from 'lucide-react';

export interface CohortMetrics {
  totalDeliveries: number;
  deliveredCount: number;
  failedCount: number;
  rescheduledCount: number;
  failedDeliveryRatePct: number;
  totalCallAttempts: number;
  avgCallAttemptsPerDelivery: number;
  avgTransitDurationMinutes: number;
}

export interface PilotMetricsData {
  merchantName: string;
  baseline: CohortMetrics;
  pilot: CohortMetrics;
  improvements: {
    failedDeliveryRateReductionPct: number;
    callAttemptsReductionPct: number;
    avgMinutesSavedPerDelivery: number;
  };
  locationMaturity: {
    totalLocations: number;
    trustedLocations: number;
    unverifiedLocations: number;
    trustedRatePct: number;
  };
}

export default function PilotMetricsCard({ data }: { data: PilotMetricsData }) {
  const { baseline, pilot, improvements, locationMaturity } = data;

  return (
    <div className="flex flex-col gap-5 text-slate-100">
      {/* Top Banner: Success Highlights */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/30 p-4 rounded-2xl flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
              PRD Section 8 Validation Scorecard
            </span>
            <h3 className="text-sm font-bold text-white">
              {data.merchantName} — Live Pilot vs. Baseline
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5" />
            {improvements.failedDeliveryRateReductionPct}% Failure Reduction
          </span>
          <span className="text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5" />
            {improvements.callAttemptsReductionPct}% Fewer Calls
          </span>
        </div>
      </div>

      {/* KPI Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* KPI 1: Failed Delivery Rate */}
        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              Failed Delivery Rate
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              -{improvements.failedDeliveryRateReductionPct}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Pre-Pilot Baseline</span>
              <span className="text-lg font-bold font-mono text-red-400">
                {baseline.failedDeliveryRatePct}%
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                ({baseline.failedCount}/{baseline.totalDeliveries} drops)
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Landmaka Pilot</span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                {pilot.failedDeliveryRatePct}%
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                ({pilot.failedCount}/{pilot.totalDeliveries} drops)
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Average Call Attempts */}
        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              Rider Calls Per Delivery
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              -{improvements.callAttemptsReductionPct}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Pre-Pilot Baseline</span>
              <span className="text-lg font-bold font-mono text-amber-400">
                {baseline.avgCallAttemptsPerDelivery} <span className="text-xs font-normal">calls</span>
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                ({baseline.totalCallAttempts} total calls)
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Landmaka Pilot</span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                {pilot.avgCallAttemptsPerDelivery} <span className="text-xs font-normal">calls</span>
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                ({pilot.totalCallAttempts} total calls)
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Transit Duration & Time Saved */}
        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              Average Transit Time
            </span>
            <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
              {improvements.avgMinutesSavedPerDelivery}m saved/drop
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Pre-Pilot Baseline</span>
              <span className="text-lg font-bold font-mono text-slate-300">
                {baseline.avgTransitDurationMinutes} <span className="text-xs font-normal">mins</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Landmaka Pilot</span>
              <span className="text-lg font-bold font-mono text-purple-400">
                {pilot.avgTransitDurationMinutes} <span className="text-xs font-normal">mins</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Location Maturity Progress */}
      <div className="bg-slate-950/50 border border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="font-semibold text-slate-200">
              Location Database Maturity
            </span>
            <p className="text-[11px] text-slate-400">
              {locationMaturity.trustedLocations} of {locationMaturity.totalLocations} destinations promoted to TRUSTED status
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${locationMaturity.trustedRatePct}%` }}
            />
          </div>
          <span className="font-mono font-bold text-emerald-400">
            {locationMaturity.trustedRatePct}%
          </span>
        </div>
      </div>
    </div>
  );
}
