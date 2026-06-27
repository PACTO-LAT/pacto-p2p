import {
  type DisputeRow,
  selectOverdue,
} from '@domains/platform/disputes/disputes.service';

const NOW = Date.parse('2026-06-26T00:00:00Z');
const H = 3_600_000;

function row(
  hoursAgo: number,
  status: string,
  overrides: Partial<DisputeRow> = {}
): DisputeRow {
  return {
    created_at: new Date(NOW - hoursAgo * H).toISOString(),
    trade_chats: {
      escrow_id: 'e1',
      buyer_id: 'b1',
      seller_id: 's1',
      escrows: { status, engagement_id: 'eng1' },
    },
    ...overrides,
  };
}

describe('selectOverdue', () => {
  it('includes active disputes older than the threshold', () => {
    const out = selectOverdue([row(50, 'active')], NOW, 48);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      escrowId: 'e1',
      engagementId: 'eng1',
      buyerId: 'b1',
      sellerId: 's1',
    });
    expect(out[0].hoursOpen).toBeCloseTo(50, 5);
  });

  it('excludes disputes younger than the threshold', () => {
    expect(selectOverdue([row(10, 'active')], NOW, 48)).toHaveLength(0);
  });

  it('excludes resolved/cancelled/completed disputes regardless of age', () => {
    const rows = [
      row(100, 'resolved'),
      row(100, 'cancelled'),
      row(100, 'completed'),
    ];
    expect(selectOverdue(rows, NOW, 48)).toHaveLength(0);
  });

  it('skips rows with no chat or no escrow', () => {
    const noChat: DisputeRow = {
      created_at: new Date(NOW - 100 * H).toISOString(),
      trade_chats: null,
    };
    const noEscrow = row(100, 'active', {
      trade_chats: {
        escrow_id: 'e1',
        buyer_id: 'b1',
        seller_id: 's1',
        escrows: null,
      },
    });
    expect(selectOverdue([noChat, noEscrow], NOW, 48)).toHaveLength(0);
  });

  it('skips rows with an unparseable timestamp', () => {
    const bad = row(100, 'active', { created_at: 'not-a-date' });
    expect(selectOverdue([bad], NOW, 48)).toHaveLength(0);
  });
});
