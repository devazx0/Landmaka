import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

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

export interface PilotSummaryReport {
  merchantId: string;
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
  failureReasonsDistribution: {
    baseline: Record<string, number>;
    pilot: Record<string, number>;
  };
}

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Aggregates live before vs. after pilot KPIs for the partner (PRD Section 8 & Phase 2 Roadmap).
   */
  async getPilotSummary(merchantId: string): Promise<PilotSummaryReport> {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    const [allDeliveries, allLocations] = await Promise.all([
      this.prisma.delivery.findMany({
        where: { merchantId },
      }),
      this.prisma.location.findMany({
        where: { merchantId },
      }),
    ]);

    const baselineDeliveries = allDeliveries.filter((d) => d.isBaseline);
    const pilotDeliveries = allDeliveries.filter((d) => !d.isBaseline);

    const computeCohort = (deliveries: typeof allDeliveries): CohortMetrics => {
      const total = deliveries.length;
      if (total === 0) {
        return {
          totalDeliveries: 0,
          deliveredCount: 0,
          failedCount: 0,
          rescheduledCount: 0,
          failedDeliveryRatePct: 0,
          totalCallAttempts: 0,
          avgCallAttemptsPerDelivery: 0,
          avgTransitDurationMinutes: 0,
        };
      }

      const delivered = deliveries.filter((d) => d.status === 'DELIVERED').length;
      const failed = deliveries.filter((d) => d.status === 'FAILED').length;
      const rescheduled = deliveries.filter((d) => d.status === 'RESCHEDULED').length;
      const totalCalls = deliveries.reduce((sum, d) => sum + d.callAttempts, 0);

      const transitWithDuration = deliveries.filter(
        (d): d is typeof d & { transitDurationMinutes: number } =>
          d.transitDurationMinutes !== null && d.transitDurationMinutes > 0,
      );
      const totalTransit = transitWithDuration.reduce(
        (sum, d) => sum + d.transitDurationMinutes,
        0,
      );

      return {
        totalDeliveries: total,
        deliveredCount: delivered,
        failedCount: failed,
        rescheduledCount: rescheduled,
        failedDeliveryRatePct: Number(((failed / total) * 100).toFixed(1)),
        totalCallAttempts: totalCalls,
        avgCallAttemptsPerDelivery: Number((totalCalls / total).toFixed(1)),
        avgTransitDurationMinutes:
          transitWithDuration.length > 0
            ? Math.round(totalTransit / transitWithDuration.length)
            : 0,
      };
    };

    const baseline = computeCohort(baselineDeliveries);
    const pilot = computeCohort(pilotDeliveries);

    // Calculate percentage improvements
    const failedReduction =
      baseline.failedDeliveryRatePct > 0
        ? Number(
            (
              ((baseline.failedDeliveryRatePct - pilot.failedDeliveryRatePct) /
                baseline.failedDeliveryRatePct) *
              100
            ).toFixed(1),
          )
        : 0;

    const callsReduction =
      baseline.avgCallAttemptsPerDelivery > 0
        ? Number(
            (
              ((baseline.avgCallAttemptsPerDelivery -
                pilot.avgCallAttemptsPerDelivery) /
                baseline.avgCallAttemptsPerDelivery) *
              100
            ).toFixed(1),
          )
        : 0;

    const minutesSaved = Math.max(
      0,
      baseline.avgTransitDurationMinutes - pilot.avgTransitDurationMinutes,
    );

    // Location maturity
    const totalLocs = allLocations.length;
    const trustedLocs = allLocations.filter((l) => l.status === 'TRUSTED').length;
    const unverifiedLocs = allLocations.filter((l) => l.status === 'UNVERIFIED').length;

    // Failure reasons breakdown
    const extractFailures = (deliveries: typeof allDeliveries) => {
      const counts: Record<string, number> = {};
      deliveries
        .filter((d) => d.status === 'FAILED' && d.failureReason)
        .forEach((d) => {
          const reason = d.failureReason!;
          counts[reason] = (counts[reason] || 0) + 1;
        });
      return counts;
    };

    return {
      merchantId,
      merchantName: merchant?.name || 'Partner',
      baseline,
      pilot,
      improvements: {
        failedDeliveryRateReductionPct: failedReduction,
        callAttemptsReductionPct: callsReduction,
        avgMinutesSavedPerDelivery: minutesSaved,
      },
      locationMaturity: {
        totalLocations: totalLocs,
        trustedLocations: trustedLocs,
        unverifiedLocations: unverifiedLocs,
        trustedRatePct:
          totalLocs > 0 ? Math.round((trustedLocs / totalLocs) * 100) : 0,
      },
      failureReasonsDistribution: {
        baseline: extractFailures(baselineDeliveries),
        pilot: extractFailures(pilotDeliveries),
      },
    };
  }
}
