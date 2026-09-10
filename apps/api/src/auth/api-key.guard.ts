import {
  Injectable,
  CanActivate,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1. Check for x-api-key header or query parameter
    const apiKey =
      request.headers['x-api-key'] ||
      request.query.apiKey ||
      request.query.api_key;

    if (apiKey && typeof apiKey === 'string') {
      const trimmedKey = apiKey.trim();

      // Check merchant primary key first using O(1) unique index lookup
      let merchant = await this.prisma.merchant.findUnique({
        where: { apiKey: trimmedKey },
      });

      if (!merchant) {
        // Fallback for clientKey or secondary registered keys
        merchant = await this.prisma.merchant.findFirst({
          where: {
            OR: [
              { clientKey: trimmedKey },
              { apiKeys: { some: { key: trimmedKey, isActive: true } } },
            ],
          },
        });
      }

      if (!merchant) {
        throw new UnauthorizedException(
          'Invalid API key. Please check your partner credentials.',
        );
      }

      request.merchant = merchant;
      return true;
    }

    // 2. Check for HTTP-only access_token cookie or Bearer authorization header
    const token =
      request.cookies?.access_token ||
      (request.headers.authorization?.startsWith('Bearer ')
        ? request.headers.authorization.split(' ')[1]
        : null);

    if (token) {
      try {
        const payload = this.jwtService.verify(token);
        if (payload?.merchantId) {
          const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            include: { merchant: true },
          });

          if (user && !user.deletedAt && user.merchant) {
            request.user = user;
            request.merchant = user.merchant;
            return true;
          }
        }
      } catch {
        // Invalid or expired token, fall through to error
      }
    }

    throw new UnauthorizedException(
      'Missing or invalid authentication. Provide x-api-key header or valid access cookie.',
    );
  }
}

