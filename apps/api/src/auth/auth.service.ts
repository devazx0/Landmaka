import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import crypto from 'crypto';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service.js';
import type { OnboardDto } from './dto/onboard.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import type { User, Merchant } from '../generated/prisma/client.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // Password hashing utility using scrypt and crypto
  hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return `${salt}:${derivedKey.toString('hex')}`;
  }

  verifyPassword(password: string, storedHash: string): boolean {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  }

  private setAuthCookie(res: Response, token: string): void {
    // Adheres to Rule 6.1
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
  }

  // Pre-defined pilot zone coordinates
  private getCorridorCoordinates(corridor: string): number[][][] {
    if (corridor.includes('Ikeja')) {
      return [
        [
          [3.345, 6.580],
          [3.375, 6.580],
          [3.375, 6.605],
          [3.345, 6.605],
          [3.345, 6.580],
        ],
      ];
    }
    // Default to Lekki Phase 1 corridor
    return [
      [
        [3.450, 6.435],
        [3.495, 6.435],
        [3.495, 6.465],
        [3.450, 6.465],
        [3.450, 6.435],
      ],
    ];
  }

  async onboard(dto: OnboardDto, res?: Response) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.adminEmail.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new ConflictException(
        `An account with email ${dto.adminEmail} already exists. Please sign in instead.`,
      );
    }

    const tenantSlug =
      dto.orgName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `workspace-${Date.now().toString().slice(-4)}`;

    const secretKey = `sk_live_${crypto.randomBytes(16).toString('hex')}`;
    const clientKey = `pk_live_${crypto.randomBytes(16).toString('hex')}`;
    const passwordHash = this.hashPassword(dto.password);

    const corridorCoords = this.getCorridorCoordinates(dto.corridor);
    const boundaryGeoJson = JSON.stringify({
      type: 'Polygon',
      coordinates: corridorCoords,
    });

    // Run creation in a Prisma transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create Merchant
      const merchant = await tx.merchant.create({
        data: {
          name: dto.orgName.trim(),
          slug: tenantSlug,
          apiKey: secretKey,
          clientKey,
          webhookUrl: dto.webhookUrl?.trim() || null,
          rateLimitTier: dto.deliveryTier.includes('Enterprise')
            ? 'tier_enterprise'
            : dto.deliveryTier.includes('Growth')
            ? 'tier_growth'
            : 'tier_pilot',
          profile: dto.profile,
          techStack: dto.techStack,
          corridor: dto.corridor,
          deliveryTier: dto.deliveryTier,
        },
      });

      // 2. Create Admin User
      const user = await tx.user.create({
        data: {
          merchantId: merchant.id,
          name: dto.leadName.trim(),
          email: dto.adminEmail.toLowerCase().trim(),
          passwordHash,
          role: 'ADMIN',
        },
      });

      // 3. Create Master Secret Key record
      await tx.apiKey.create({
        data: {
          merchantId: merchant.id,
          name: 'Master Secret Key',
          key: secretKey,
          type: 'SECRET',
          rateLimitPerMin: dto.deliveryTier.includes('Enterprise') ? 5000 : 1000,
        },
      });

      // 4. Create Client Public Key record
      await tx.apiKey.create({
        data: {
          merchantId: merchant.id,
          name: 'Client-Side Key',
          key: clientKey,
          type: 'PUBLIC',
          rateLimitPerMin: 2000,
        },
      });

      // 5. Create Pilot Corridor Zone
      const zone = await tx.zone.create({
        data: {
          merchantId: merchant.id,
          name: `${dto.corridor} Pilot Corridor`,
          boundaryGeoJson,
          isActive: true,
        },
      });

      return { merchant, user, zone };
    });

    // Sign JWT session token
    const token = this.jwtService.sign({
      sub: result.user.id,
      email: result.user.email,
      merchantId: result.merchant.id,
      role: result.user.role,
    });

    if (res) {
      this.setAuthCookie(res, token);
    }

    return {
      success: true,
      message: 'Workspace and credentials provisioned successfully.',
      merchant: {
        id: result.merchant.id,
        name: result.merchant.name,
        slug: result.merchant.slug,
        profile: result.merchant.profile,
        techStack: result.merchant.techStack,
        corridor: result.merchant.corridor,
        deliveryTier: result.merchant.deliveryTier,
        webhookUrl: result.merchant.webhookUrl,
        createdAt: result.merchant.createdAt,
      },
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
      credentials: {
        secretKey,
        clientKey,
      },
      zone: {
        id: result.zone.id,
        name: result.zone.name,
      },
      token,
    };
  }

  async login(dto: LoginDto, res?: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: { merchant: true },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isValid = this.verifyPassword(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      merchantId: user.merchantId,
      role: user.role,
    });

    if (res) {
      this.setAuthCookie(res, token);
    }

    return {
      success: true,
      message: 'Successfully authenticated.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      merchant: {
        id: user.merchant.id,
        name: user.merchant.name,
        slug: user.merchant.slug,
        clientKey: user.merchant.clientKey,
        profile: user.merchant.profile,
        corridor: user.merchant.corridor,
      },
      token,
    };
  }

  logout(res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return { success: true, message: 'Logged out successfully.' };
  }

  async getMe(userId: string): Promise<{ user: Partial<User>; merchant: Partial<Merchant> }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { merchant: true },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User account not found.');
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      merchant: {
        id: user.merchant.id,
        name: user.merchant.name,
        slug: user.merchant.slug,
        clientKey: user.merchant.clientKey,
        profile: user.merchant.profile,
        techStack: user.merchant.techStack,
        corridor: user.merchant.corridor,
        deliveryTier: user.merchant.deliveryTier,
        webhookUrl: user.merchant.webhookUrl,
        createdAt: user.merchant.createdAt,
      },
    };
  }
}
