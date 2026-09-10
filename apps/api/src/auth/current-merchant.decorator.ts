import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Merchant } from '../generated/prisma/client.js';

export const CurrentMerchant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Merchant => {
    const request = ctx.switchToHttp().getRequest();
    return request.merchant;
  },
);
