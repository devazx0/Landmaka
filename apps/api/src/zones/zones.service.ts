import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateZoneDto } from './dto/create-zone.dto.js';
import type { Zone } from '../generated/prisma/client.js';

export interface ZoneCheckResult {
  isCovered: boolean;
  latitude: number;
  longitude: number;
  matchingZones: Array<{
    id: string;
    name: string;
  }>;
}

@Injectable()
export class ZonesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(merchantId: string, dto: CreateZoneDto): Promise<Zone> {
    return this.prisma.zone.create({
      data: {
        merchantId,
        name: dto.name,
        boundaryGeoJson: dto.boundaryGeoJson,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(merchantId: string): Promise<Zone[]> {
    return this.prisma.zone.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Checks whether a coordinate point falls within the merchant's agreed pilot zones.
   */
  async checkCoordinate(
    merchantId: string,
    latitude: number,
    longitude: number,
  ): Promise<ZoneCheckResult> {
    const zones = await this.prisma.zone.findMany({
      where: { merchantId, isActive: true },
    });

    const matchingZones: Array<{ id: string; name: string }> = [];

    for (const zone of zones) {
      try {
        const geoJson = JSON.parse(zone.boundaryGeoJson) as {
          type: string;
          coordinates: number[][][];
        };

        if (geoJson.type === 'Polygon' && geoJson.coordinates[0]) {
          const polygon = geoJson.coordinates[0]; // array of [lon, lat]
          if (this.isPointInPolygon(longitude, latitude, polygon)) {
            matchingZones.push({ id: zone.id, name: zone.name });
          }
        }
      } catch {
        // Skip malformed geometry
      }
    }

    return {
      isCovered: matchingZones.length > 0,
      latitude,
      longitude,
      matchingZones,
    };
  }

  /**
   * Ray-casting algorithm for GeoJSON polygon containment
   */
  private isPointInPolygon(
    x: number,
    y: number,
    polygon: number[][],
  ): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0];
      const yi = polygon[i][1];
      const xj = polygon[j][0];
      const yj = polygon[j][1];

      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }
}
