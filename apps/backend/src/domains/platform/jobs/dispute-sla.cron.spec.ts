import type {
  DisputesService,
  OverdueDispute,
} from '@domains/platform/disputes/disputes.service';
import { DisputeSlaCron } from '@domains/platform/jobs/dispute-sla.cron';
import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { SchedulerRegistry } from '@nestjs/schedule';

describe('DisputeSlaCron.run', () => {
  it('logs a breach per overdue dispute and a summary count', async () => {
    const overdue: OverdueDispute[] = [
      {
        escrowId: 'e1',
        engagementId: 'eng1',
        buyerId: 'b1',
        sellerId: 's1',
        disputeRaisedAt: 'x',
        hoursOpen: 50,
      },
      {
        escrowId: 'e2',
        engagementId: 'eng2',
        buyerId: 'b2',
        sellerId: 's2',
        disputeRaisedAt: 'y',
        hoursOpen: 72,
      },
    ];
    const config = {
      get: <T>(_k: string, d?: T) => d,
    } as unknown as ConfigService;
    const scheduler = {} as unknown as SchedulerRegistry;
    const disputes = {
      findOverdueDisputes: jest.fn().mockResolvedValue(overdue),
    } as unknown as DisputesService;

    const warn = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
    const log = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);

    const cron = new DisputeSlaCron(config, scheduler, disputes);
    await cron.run();

    expect(disputes.findOverdueDisputes).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0][0]).toContain('dispute_sla_breach');
    expect(
      log.mock.calls.some((c) => String(c[0]).includes('overdueCount=2'))
    ).toBe(true);

    warn.mockRestore();
    log.mockRestore();
  });
});
