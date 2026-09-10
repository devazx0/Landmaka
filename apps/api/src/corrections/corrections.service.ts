import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateCorrectionDto } from './dto/create-correction.dto.js';
import type { QueryCorrectionsDto } from './dto/query-corrections.dto.js';
import type { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class CorrectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(merchantId: string, dto: CreateCorrectionDto) {
    const {
      deliveryRef,
      locationId,
      landmarkText,
      originalGate,
      reportedGate,
      pinDriftMeters = 0,
      riderName,
      riderConfidence = 80,
    } = dto;

    // Determine correction category per FR10–FR12
    let type = dto.type;
    let status = 'PENDING_REVIEW';

    if (!type) {
      if (pinDriftMeters > 200) {
        type = 'PIN_DRIFT_ALERT';
      } else if (
        originalGate &&
        reportedGate &&
        originalGate.toLowerCase().trim() !== reportedGate.toLowerCase().trim()
      ) {
        type = 'GATE_CONFLICT';
      } else {
        type = 'CONFIRMATION';
        status = 'ACCEPTED';
      }
    }

    const correction = await this.prisma.correction.create({
      data: {
        merchantId,
        deliveryRef: deliveryRef.trim(),
        locationId: locationId || null,
        landmarkText: landmarkText.trim(),
        originalGate: originalGate?.trim() || null,
        reportedGate: reportedGate.trim(),
        pinDriftMeters,
        riderName: riderName.trim(),
        riderConfidence,
        type,
        status,
      },
    });

    const isFlagged = status === 'PENDING_REVIEW';

    return {
      success: true,
      message: isFlagged
        ? 'Location change flagged for operations review due to conflict or excessive pin drift (>200m).'
        : 'Location confirmation recorded.',
      correction,
      isFlagged,
    };
  }

  async findAll(merchantId: string, query: QueryCorrectionsDto) {
    const { limit = 20, offset = 0, status, type } = query;

    const where: Prisma.CorrectionWhereInput = {
      merchantId,
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.correction.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.correction.count({ where }),
    ]);

    return {
      items,
      total,
      limit,
      offset,
    };
  }

  async accept(merchantId: string, id: string) {
    const correction = await this.prisma.correction.findFirst({
      where: { id, merchantId },
    });

    if (!correction) {
      throw new NotFoundException(`Correction audit record ${id} not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Mark correction as accepted
      const updatedCorrection = await tx.correction.update({
        where: { id },
        data: { status: 'ACCEPTED' },
      });

      // 2. If attached to a location, promote & create a new LocationVersion
      if (correction.locationId) {
        const location = await tx.location.findFirst({
          where: { id: correction.locationId, merchantId },
        });

        if (location) {
          const nextVersionNumber = location.version + 1;
          await tx.location.update({
            where: { id: location.id },
            data: {
              gateDescription: correction.reportedGate,
              version: nextVersionNumber,
              status: 'TRUSTED',
            },
          });

          await tx.locationVersion.create({
            data: {
              locationId: location.id,
              versionNumber: nextVersionNumber,
              latitude: location.latitude,
              longitude: location.longitude,
              landmarkText: location.landmarkText,
              gateDescription: correction.reportedGate,
              unitPath: location.unitPath,
              photoUrl: location.photoUrl,
              changeSummary: `Accepted rider correction (${correction.riderName}): ${correction.reportedGate}`,
            },
          });
        }
      }

      return {
        success: true,
        message: 'Correction accepted and new location version created.',
        correction: updatedCorrection,
      };
    });
  }

  async reject(merchantId: string, id: string) {
    const correction = await this.prisma.correction.findFirst({
      where: { id, merchantId },
    });

    if (!correction) {
      throw new NotFoundException(`Correction audit record ${id} not found.`);
    }

    const updated = await this.prisma.correction.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    return {
      success: true,
      message: 'Correction rejected.',
      correction: updated,
    };
  }
}
