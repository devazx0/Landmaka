import { Injectable, NotFoundException } from '@nestjs/common';
import crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateApiKeyDto } from './dto/create-api-key.dto.js';

@Injectable()
export class ApiKeysService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(merchantId: string) {
    const keys = await this.prisma.apiKey.findMany({
      where: { merchantId, isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        key: true,
        type: true,
        rateLimitPerMin: true,
        isActive: true,
        createdAt: true,
      },
    });

    return {
      items: keys,
      total: keys.length,
    };
  }

  async create(merchantId: string, dto: CreateApiKeyDto) {
    const prefix = dto.type === 'PUBLIC' ? 'pk_live_' : 'sk_live_';
    const key = `${prefix}${crypto.randomBytes(16).toString('hex')}`;

    const created = await this.prisma.apiKey.create({
      data: {
        merchantId,
        name: dto.name.trim(),
        key,
        type: dto.type || 'SECRET',
        rateLimitPerMin: dto.rateLimitPerMin || 1000,
        isActive: true,
      },
    });

    return {
      success: true,
      message: 'API Key generated successfully.',
      key: created,
    };
  }

  async revoke(merchantId: string, id: string) {
    const key = await this.prisma.apiKey.findFirst({
      where: { id, merchantId },
    });

    if (!key) {
      throw new NotFoundException(`API Key ${id} not found.`);
    }

    const updated = await this.prisma.apiKey.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      success: true,
      message: 'API Key revoked successfully.',
      key: updated,
    };
  }
}
