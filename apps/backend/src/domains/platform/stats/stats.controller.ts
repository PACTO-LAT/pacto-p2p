// biome-ignore lint/style/useImportType: class-validator needs RecomputeDto as a runtime value for @Body() validation
import { RecomputeDto } from '@domains/platform/stats/dto/recompute.dto';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { StatsService } from '@domains/platform/stats/stats.service';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('stats')
@Controller()
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get('users/:id/stats')
  @ApiOperation({
    summary: 'Get persisted reputation + trade stats for a user.',
  })
  async userStats(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.stats.getUserStats(id);
    if (!data) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND' });
    }
    return data;
  }

  @Get('merchants/:id/stats')
  @ApiOperation({
    summary: 'Get persisted reputation + trade stats for a merchant.',
  })
  async merchantStats(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.stats.getMerchantStats(id);
    if (!data) {
      throw new NotFoundException({ code: 'MERCHANT_NOT_FOUND' });
    }
    return data;
  }

  @Post('internal/stats/recompute')
  @ApiOperation({
    summary:
      'Recompute + persist stats for the given users (and their merchant).',
  })
  async recompute(@Body() dto: RecomputeDto) {
    return { results: await this.stats.recomputeForUsers(dto.userIds) };
  }

  @Post('internal/stats/recompute-all')
  @ApiOperation({
    summary: 'Recompute + persist stats for every user (idempotent).',
  })
  async recomputeAll() {
    return this.stats.recomputeAll();
  }
}
