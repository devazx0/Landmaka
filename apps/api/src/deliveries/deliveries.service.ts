import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateDeliveryDto } from './dto/create-delivery.dto.js';
import type { UpdateDeliveryDto } from './dto/update-delivery.dto.js';
import type { RecordDeliveryOutcomeDto } from './dto/record-delivery-outcome.dto.js';
import type { QueryDeliveriesDto } from './dto/query-deliveries.dto.js';
import type { Delivery, Prisma } from '../generated/prisma/client.js';

@Injectable()
export class DeliveriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registers a new delivery job for the merchant (supports both pre-pilot baseline and active pilot).
   */
  async create(merchantId: string, dto: CreateDeliveryDto): Promise<Delivery> {
    const {
      trackingReference,
      locationId,
      recipientName,
      recipientPhone,
      isBaseline = false,
      notes,
    } = dto;

    return this.prisma.delivery.create({
      data: {
        merchantId,
        trackingReference,
        locationId,
        recipientName,
        recipientPhone,
        isBaseline,
        notes,
        status: 'PENDING',
        dispatchedAt: new Date(),
      },
      include: {
        location: true,
      },
    });
  }

  /**
   * Records the final outcome of a delivery (call attempts, failure reason, duration).
   * Feeds the baseline vs. pilot scorecard.
   */
  async recordOutcome(
    merchantId: string,
    id: string,
    dto: RecordDeliveryOutcomeDto,
  ): Promise<Delivery> {
    const existing = await this.prisma.delivery.findFirst({
      where: { id, merchantId },
    });

    if (!existing) {
      throw new NotFoundException(`Delivery with ID ${id} not found.`);
    }

    return this.prisma.delivery.update({
      where: { id },
      data: {
        status: dto.status,
        callAttempts: dto.callAttempts,
        failureReason: dto.failureReason || null,
        transitDurationMinutes: dto.transitDurationMinutes || null,
        notes: dto.notes ? `${existing.notes ? existing.notes + ' | ' : ''}${dto.notes}` : existing.notes,
        completedAt: new Date(),
      },
      include: {
        location: true,
      },
    });
  }

  /**
   * Lists deliveries for the merchant with filters.
   */
  async findAll(merchantId: string, query: QueryDeliveriesDto) {
    const { limit = 20, offset = 0, status, isBaseline, search } = query;

    const where: Prisma.DeliveryWhereInput = {
      merchantId,
      ...(status ? { status } : {}),
      ...(typeof isBaseline === 'boolean' ? { isBaseline } : {}),
      ...(search
        ? {
            OR: [
              { trackingReference: { contains: search, mode: 'insensitive' } },
              { recipientName: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.delivery.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          location: true,
        },
      }),
      this.prisma.delivery.count({ where }),
    ]);

    return {
      items,
      total,
      limit,
      offset,
    };
  }

  /**
   * Retrieves single delivery record.
   */
  async findOne(merchantId: string, id: string): Promise<Delivery> {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id, merchantId },
      include: {
        location: true,
      },
    });

    if (!delivery) {
      throw new NotFoundException(`Delivery with ID ${id} not found.`);
    }

    return delivery;
  }

  /**
   * Updates delivery lifecycle status, recipient info, or notes.
   */
  async update(
    merchantId: string,
    id: string,
    dto: UpdateDeliveryDto,
  ): Promise<Delivery> {
    const existing = await this.prisma.delivery.findFirst({
      where: { id, merchantId },
    });

    if (!existing) {
      throw new NotFoundException(`Delivery with ID ${id} not found.`);
    }

    const isFinished =
      dto.status === 'DELIVERED' ||
      dto.status === 'FAILED' ||
      dto.status === 'RESCHEDULED';

    return this.prisma.delivery.update({
      where: { id },
      data: {
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.recipientName ? { recipientName: dto.recipientName } : {}),
        ...(dto.recipientPhone ? { recipientPhone: dto.recipientPhone } : {}),
        ...(dto.notes ? { notes: dto.notes } : {}),
        ...(typeof dto.callAttempts === 'number'
          ? { callAttempts: dto.callAttempts }
          : {}),
        ...(typeof dto.transitDurationMinutes === 'number'
          ? { transitDurationMinutes: dto.transitDurationMinutes }
          : {}),
        ...((dto.status === 'IN_TRANSIT' || dto.status === 'DISPATCHED') &&
        !existing.dispatchedAt
          ? { dispatchedAt: new Date() }
          : {}),
        ...(isFinished && !existing.completedAt
          ? { completedAt: new Date() }
          : {}),
      },
      include: {
        location: true,
      },
    });
  }
}
