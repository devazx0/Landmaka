import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateLocationDto } from './dto/create-location.dto.js';
import type { UpdateLocationDto } from './dto/update-location.dto.js';
import type { QueryLocationsDto } from './dto/query-locations.dto.js';
import type { Location, Prisma } from '../generated/prisma/client.js';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(merchantId: string, dto: CreateLocationDto): Promise<Location> {
    const {
      latitude,
      longitude,
      landmarkText,
      gateDescription,
      unitPath,
      photoUrl,
      contactName,
      contactPhone,
      createdBy,
    } = dto;

    const location = await this.prisma.location.create({
      data: {
        merchantId,
        latitude,
        longitude,
        landmarkText,
        gateDescription,
        unitPath,
        photoUrl,
        contactName,
        contactPhone,
        confidenceScore: 0.2,
        status: 'UNVERIFIED',
        version: 1,
        createdBy: createdBy || 'CUSTOMER',
        versions: {
          create: {
            versionNumber: 1,
            latitude,
            longitude,
            landmarkText,
            gateDescription,
            unitPath,
            photoUrl,
            changeSummary: 'Initial location capture',
          },
        },
      },
      include: {
        versions: true,
      },
    });

    return location;
  }

  async findAll(merchantId: string, query: QueryLocationsDto) {
    const { limit = 20, offset = 0, status, search } = query;

    const where: Prisma.LocationWhereInput = {
      merchantId,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { landmarkText: { contains: search, mode: 'insensitive' } },
              { gateDescription: { contains: search, mode: 'insensitive' } },
              { unitPath: { contains: search, mode: 'insensitive' } },
              { contactName: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.location.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.location.count({ where }),
    ]);

    return {
      items,
      total,
      limit,
      offset,
    };
  }

  async findOne(merchantId: string, id: string): Promise<Location> {
    const location = await this.prisma.location.findFirst({
      where: {
        id,
        merchantId,
      },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
        },
      },
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found.`);
    }

    return location;
  }

  async update(
    merchantId: string,
    id: string,
    dto: UpdateLocationDto,
  ): Promise<Location> {
    const existing = await this.prisma.location.findFirst({
      where: { id, merchantId },
    });

    if (!existing) {
      throw new NotFoundException(`Location with ID ${id} not found.`);
    }

    const nextVersionNumber = existing.version + 1;
    const newLat = dto.latitude ?? existing.latitude;
    const newLng = dto.longitude ?? existing.longitude;
    const newLandmark = dto.landmarkText ?? existing.landmarkText;
    const newGate =
      dto.gateDescription !== undefined
        ? dto.gateDescription
        : existing.gateDescription;
    const newUnit =
      dto.unitPath !== undefined ? dto.unitPath : existing.unitPath;
    const newPhoto =
      dto.photoUrl !== undefined ? dto.photoUrl : existing.photoUrl;

    const location = await this.prisma.location.update({
      where: { id },
      data: {
        latitude: newLat,
        longitude: newLng,
        landmarkText: newLandmark,
        gateDescription: newGate,
        unitPath: newUnit,
        photoUrl: newPhoto,
        contactName:
          dto.contactName !== undefined
            ? dto.contactName
            : existing.contactName,
        contactPhone:
          dto.contactPhone !== undefined
            ? dto.contactPhone
            : existing.contactPhone,
        status: dto.status ?? existing.status,
        confidenceScore: dto.confidenceScore ?? existing.confidenceScore,
        version: nextVersionNumber,
        versions: {
          create: {
            versionNumber: nextVersionNumber,
            latitude: newLat,
            longitude: newLng,
            landmarkText: newLandmark,
            gateDescription: newGate,
            unitPath: newUnit,
            photoUrl: newPhoto,
            changeSummary: dto.changeSummary || 'Updated location metadata',
          },
        },
      },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
        },
      },
    });

    return location;
  }

  async remove(
    merchantId: string,
    id: string,
  ): Promise<{ success: boolean; id: string }> {
    const existing = await this.prisma.location.findFirst({
      where: { id, merchantId },
    });

    if (!existing) {
      throw new NotFoundException(`Location with ID ${id} not found.`);
    }

    await this.prisma.location.delete({
      where: { id },
    });

    return { success: true, id };
  }
}
