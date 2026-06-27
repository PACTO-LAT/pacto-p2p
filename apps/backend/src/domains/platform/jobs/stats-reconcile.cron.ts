// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { StatsService } from '@domains/platform/stats/stats.service';
import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { ConfigService } from '@nestjs/config';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class StatsReconcileCron implements OnModuleInit {
  private readonly logger = new Logger(StatsReconcileCron.name);
  private isRunning = false;

  constructor(
    private readonly config: ConfigService,
    private readonly scheduler: SchedulerRegistry,
    private readonly stats: StatsService
  ) {}

  onModuleInit(): void {
    if (!this.config.get<boolean>('CRON_ENABLED', true)) {
      this.logger.log('CRON_ENABLED=false → stats-reconcile not scheduled');
      return;
    }
    const expr = this.config.get<string>('RECONCILE_CRON', '0 3 * * *');
    const job = new CronJob(expr, () => {
      void this.run();
    });
    this.scheduler.addCronJob('stats-reconcile', job);
    job.start();
    this.logger.log(`stats-reconcile scheduled: ${expr}`);
  }

  async run(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('stats-reconcile already running; skipping tick');
      return;
    }
    this.isRunning = true;
    const start = Date.now();
    try {
      const result = await this.stats.recomputeAll();
      this.logger.log(
        `stats-reconcile done users=${result.users} durationMs=${Date.now() - start}`
      );
    } catch (err) {
      this.logger.error(`stats-reconcile failed: ${(err as Error).message}`);
    } finally {
      this.isRunning = false;
    }
  }
}
