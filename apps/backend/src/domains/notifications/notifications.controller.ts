// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { NotificationsService } from '@domains/notifications/notifications.service';
import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller()
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get('notifications/users/:id')
  @ApiOperation({
    summary: 'Recent notifications for a user (most recent first).',
  })
  async forUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit') limit?: string
  ) {
    const max = Math.min(Math.max(Number(limit) || 50, 1), 200);
    return { notifications: await this.notifications.listForUser(id, max) };
  }

  @Get('notifications/users/:id/unread-count')
  @ApiOperation({ summary: 'Count of unread notifications for a user.' })
  async unreadCount(@Param('id', ParseUUIDPipe) id: string) {
    return { count: await this.notifications.unreadCount(id) };
  }

  @Patch('notifications/:id/read')
  @ApiOperation({ summary: 'Mark a notification as read.' })
  async markRead(@Param('id', ParseUUIDPipe) id: string) {
    return { notification: await this.notifications.markRead(id) };
  }
}
