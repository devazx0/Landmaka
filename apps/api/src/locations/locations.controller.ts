import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiParam,
} from '@nestjs/swagger';
import { LocationsService } from './locations.service.js';
import { CreateLocationDto } from './dto/create-location.dto.js';
import { UpdateLocationDto } from './dto/update-location.dto.js';
import { QueryLocationsDto } from './dto/query-locations.dto.js';
import { ApiKeyGuard } from '../auth/api-key.guard.js';
import { CurrentMerchant } from '../auth/current-merchant.decorator.js';
import type { Merchant } from '../generated/prisma/client.js';

@ApiTags('Locations')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
@Controller('api/v1/locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Capture a new location (FR1–FR3)',
    description:
      'Creates a new delivery destination with precise GPS pin, prominent landmark, structured gate description, path to unit, and optional photo. Initializes version 1 with unverified status.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Location captured and stored cleanly with initial version.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid API key.',
  })
  async create(
    @CurrentMerchant() merchant: Merchant,
    @Body() dto: CreateLocationDto,
  ) {
    return this.locationsService.create(merchant.id, dto);
  }

  @Post('capture')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Capture a new location alias (FR1–FR3)',
    description: 'Alias for POST /api/v1/locations',
  })
  async capture(
    @CurrentMerchant() merchant: Merchant,
    @Body() dto: CreateLocationDto,
  ) {
    return this.locationsService.create(merchant.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List locations',
    description:
      'Retrieves stored locations for the authenticated partner merchant, with pagination and search.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paginated list of locations.',
  })
  async findAll(
    @CurrentMerchant() merchant: Merchant,
    @Query() query: QueryLocationsDto,
  ) {
    return this.locationsService.findAll(merchant.id, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get location details and version history',
    description:
      'Returns a location record with its complete append-only version history.',
  })
  @ApiParam({
    name: 'id',
    description: 'Location CUID',
    example: 'cm123abc456',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Location details and version history.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Location not found.',
  })
  async findOne(
    @CurrentMerchant() merchant: Merchant,
    @Param('id') id: string,
  ) {
    return this.locationsService.findOne(merchant.id, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update location pin and metadata (FR1–FR3)',
    description:
      'Updates landmark text, gate description, unit path, coordinates, or verification status. Automatically creates a new immutable version in the location history.',
  })
  @ApiParam({
    name: 'id',
    description: 'Location CUID',
    example: 'cm123abc456',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Location updated with new version.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Location not found.',
  })
  async update(
    @CurrentMerchant() merchant: Merchant,
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.locationsService.update(merchant.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a location record',
    description: 'Deletes a location record and its version history.',
  })
  @ApiParam({
    name: 'id',
    description: 'Location CUID',
    example: 'cm123abc456',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Location deleted successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Location not found.',
  })
  async remove(
    @CurrentMerchant() merchant: Merchant,
    @Param('id') id: string,
  ) {
    return this.locationsService.remove(merchant.id, id);
  }
}
