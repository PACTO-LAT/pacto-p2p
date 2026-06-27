// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { EscrowService } from '@domains/escrow/escrow.service';
import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('escrows')
@Controller()
export class EscrowController {
  constructor(private readonly escrows: EscrowService) {}

  @Get('escrows/users/:id')
  @ApiOperation({
    summary: 'Indexed escrow state for a user (buyer or seller).',
  })
  async forUser(@Param('id', ParseUUIDPipe) id: string) {
    return { escrows: await this.escrows.getEscrowsForUser(id) };
  }
}
