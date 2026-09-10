import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { OnboardDto } from './dto/onboard.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ApiKeyGuard } from './api-key.guard.js';
import { CurrentUser } from './current-user.decorator.js';

@ApiTags('Authentication & Onboarding')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('onboard')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Onboard and register a new partner merchant workspace',
    description:
      'Creates the tenant workspace, admin user account, provisions master secret and public API keys, configures pilot delivery corridor zone, and issues secure HTTP-only access cookie.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Workspace provisioned successfully.',
  })
  async onboard(
    @Body() dto: OnboardDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.onboard(dto, res);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Alias for /onboard' })
  async register(
    @Body() dto: OnboardDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.onboard(dto, res);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate merchant administrator',
    description: 'Verifies email and password, setting secure HTTP-only session cookie.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Authenticated successfully.',
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(dto, res);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log out current session and clear cookie',
  })
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  @Get('ping')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'API latency & operational handshake check',
    description:
      'Used by the Onboarding wizard Step 3 auto-ping test to verify connectivity and latency.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Handshake successful with current server timestamp.',
  })
  async ping() {
    return {
      status: 'ok',
      message: 'Landmaka Delivery Infrastructure API is live and operational.',
      timestamp: Date.now(),
      cluster: 'af-south-1',
    };
  }

  @Get('me')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('x-api-key')
  @ApiOperation({
    summary: 'Get current authenticated user and merchant details',
  })
  async getMe(@Req() req: Request, @CurrentUser() user: any) {
    if (user?.id) {
      return this.authService.getMe(user.id);
    }
    // If authenticated via ApiKeyGuard (which attaches request.merchant)
    const merchant = (req as any).merchant;
    return {
      user: null,
      merchant,
    };
  }
}
