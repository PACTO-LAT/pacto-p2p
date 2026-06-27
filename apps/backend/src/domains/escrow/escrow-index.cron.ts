// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { EscrowIndexerService } from '@domains/escrow/escrow-indexer.service';
import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { ConfigService } from '@nestjs/config';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class EscrowIndexCron implements OnModuleInit {
  private readonly logger = new Logger(EscrowIndexCron.name);
  private isRunning = false;

  constructor(
    private readonly config: ConfigService,
    private readonly scheduler: SchedulerRegistry,
    private readonly indexer: EscrowIndexerService
  ) {}

  onModuleInit(): void {
    if (!this.config.get<boolean>('CRON_ENABLED', true)) {
      this.logger.log('CRON_ENABLED=false → escrow-index not scheduled');
      return;
    }
    const expr = this.config.get<string>('ESCROW_INDEX_CRON', '*/2 * * * *');
    const job = new CronJob(expr, () => {
      void this.run();
    });
    this.scheduler.addCronJob('escrow-index', job);
    job.start();
    this.logger.log(`escrow-index scheduled: ${expr}`);
  }

  async run(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('escrow-index already running; skipping tick');
      return;
    }
    this.isRunning = true;
    const start = Date.now();
    try {
      const res = await this.indexer.indexAll();
      this.logger.log(
        `escrow-index done indexed=${res.indexed} unmatched=${res.unmatched} durationMs=${Date.now() - start}`
      );
    } catch (err) {
      this.logger.error(`escrow-index failed: ${(err as Error).message}`);
    } finally {
      this.isRunning = false;
    }
  }
}
