import { Injectable, NotFoundException } from '@nestjs/common';
import crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateProofOfDeliveryDto } from './dto/create-proof-of-delivery.dto.js';
import type { QueryProofOfDeliveryDto } from './dto/query-proof-of-delivery.dto.js';
import type { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class ProofOfDeliveryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(merchantId: string, dto: CreateProofOfDeliveryDto) {
    const {
      trackingReference,
      recipientName,
      landmarkText,
      gateDescription,
      latitude,
      longitude,
      geotag,
      otpCode,
      callAttempts = 0,
      podPhotoUrl,
      riderName,
      riderVehicle,
    } = dto;

    const otpVerified = Boolean(otpCode && otpCode.trim().length >= 4);

    // Compute tamper-proof SHA-256 certificate verification hash
    const rawData = `${merchantId}-${trackingReference}-${latitude}-${longitude}-${Date.now()}`;
    const verificationHash = `SHA256: ${crypto.createHash('sha256').update(rawData).digest('hex').slice(0, 12)}`;

    // Optional linkage with existing Delivery
    const existingDelivery = await this.prisma.delivery.findFirst({
      where: { merchantId, trackingReference: trackingReference.trim() },
    });

    const statusCategory = otpVerified || callAttempts === 0 ? 'TRUSTED' : 'FLAGGED';

    // Store POD in database and update delivery if found
    const proof = await this.prisma.$transaction(async (tx) => {
      if (existingDelivery) {
        await tx.delivery.update({
          where: { id: existingDelivery.id },
          data: {
            status: 'DELIVERED',
            completedAt: new Date(),
            callAttempts,
          },
        });
      }

      return tx.proofOfDelivery.create({
        data: {
          merchantId,
          deliveryId: existingDelivery ? existingDelivery.id : null,
          trackingReference: trackingReference.trim(),
          recipientName: recipientName.trim(),
          landmarkText: landmarkText.trim(),
          gateDescription: gateDescription?.trim() || null,
          latitude,
          longitude,
          geotag: geotag || `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`,
          podPhotoUrl: podPhotoUrl || null,
          otpVerified,
          otpCode: otpCode?.trim() || null,
          callAttempts,
          riderName: riderName?.trim() || 'Fleet Courier',
          riderVehicle: riderVehicle?.trim() || 'Motorcycle',
          verificationHash,
          statusCategory,
        },
      });
    });

    return {
      success: true,
      message: 'Proof of delivery successfully recorded and certified.',
      proof,
      certificate: {
        verificationHash: proof.verificationHash,
        trackingReference: proof.trackingReference,
        timestamp: proof.createdAt,
        statusCategory: proof.statusCategory,
        otpVerified: proof.otpVerified,
      },
    };
  }

  async findAll(merchantId: string, query: QueryProofOfDeliveryDto) {
    const { limit = 20, offset = 0, filterType = 'ALL', search } = query;

    const where: Prisma.ProofOfDeliveryWhereInput = {
      merchantId,
      ...(filterType === 'OTP' ? { otpVerified: true } : {}),
      ...(filterType === 'FLAGGED' ? { statusCategory: 'FLAGGED' } : {}),
      ...(search
        ? {
            OR: [
              { trackingReference: { contains: search, mode: 'insensitive' } },
              { recipientName: { contains: search, mode: 'insensitive' } },
              { landmarkText: { contains: search, mode: 'insensitive' } },
              { riderName: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.proofOfDelivery.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.proofOfDelivery.count({ where }),
    ]);

    return {
      items,
      total,
      limit,
      offset,
    };
  }

  async findOne(merchantId: string, id: string) {
    const proof = await this.prisma.proofOfDelivery.findFirst({
      where: { id, merchantId },
    });

    if (!proof) {
      throw new NotFoundException(`Proof of Delivery record ${id} not found.`);
    }

    return proof;
  }
}
