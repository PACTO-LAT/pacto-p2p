import { NotificationsController } from '@domains/notifications/notifications.controller';
import { NotificationsService } from '@domains/notifications/notifications.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
