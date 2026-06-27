// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { DisputesService } from '@domains/platform/disputes/disputes.service';
import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { ConfigService } from '@nestjs/config';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class DisputeSlaCron implements OnModuleInit {
  private readonly logger = new Logger(DisputeSlaCron.name);
  private isRunning = false;

  constructor(
    private readonly config: ConfigService,
    private readonly scheduler: SchedulerRegistry,
    private readonly disputes: DisputesService
  ) {}

  onModuleInit(): void {
    if (!this.config.get<boolean>('CRON_ENABLED', true)) {
      this.logger.log('CRON_ENABLED=false → dispute-sla not scheduled');
      return;
    }
    const expr = this.config.get<string>('DISPUTE_SLA_CRON', '0 * * * *');
    const job = new CronJob(expr, () => {
      void this.run();
    });
    this.scheduler.addCronJob('dispute-sla', job);
    job.start();
    this.logger.log(`dispute-sla scheduled: ${expr}`);
  }

  async run(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('dispute-sla already running; skipping tick');
      return;
    }
    this.isRunning = true;
    try {
      const thresholdHours = this.config.get<number>('DISPUTE_SLA_HOURS', 48);
      const overdue = await this.disputes.findOverdueDisputes(
        Date.now(),
        thresholdHours
      );
      for (const d of overdue) {
        this.logger.warn(
          `dispute_sla_breach escrowId=${d.escrowId} engagementId=${d.engagementId} ` +
            `buyerId=${d.buyerId} sellerId=${d.sellerId} hoursOpen=${d.hoursOpen}`
        );
      }
      this.logger.log(
        `dispute-sla done thresholdHours=${thresholdHours} overdueCount=${overdue.length}`
      );
    } catch (err) {
      this.logger.error(`dispute-sla failed: ${(err as Error).message}`);
    } finally {
      this.isRunning = false;
    }
  }
}
