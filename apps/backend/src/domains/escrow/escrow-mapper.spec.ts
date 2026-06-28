import { toEscrowPatch } from '@domains/escrow/escrow-mapper';

const NOW = Date.parse('2026-06-26T00:00:00Z');

function escrow(overrides: Record<string, unknown> = {}): any {
  return {
    engagementId: 'eng1',
    amount: 100,
    balance: 0,
    flags: {},
    ...overrides,
  };
}

describe('toEscrowPatch', () => {
  it('maps balance, token_amount and flags', () => {
    const p = toEscrowPatch(
      escrow({ amount: 250, balance: 250, flags: { disputed: true } }),
      NOW
    );
    expect(p.balance).toBe(250);
    expect(p.token_amount).toBe(250);
    expect(p.on_chain_flags).toEqual({ disputed: true });
    expect(p.last_indexed_at).toBe(new Date(NOW).toISOString());
  });

  it('persists the full input escrow as on_chain_snapshot', () => {
    const e = escrow({ amount: 250, balance: 250, flags: { disputed: true } });
    const p = toEscrowPatch(e, NOW);
    expect(p.on_chain_snapshot).toBe(e);
    expect(p.on_chain_snapshot).toEqual(e);
  });

  it('derives on_chain_status by flag precedence then funding', () => {
    expect(
      toEscrowPatch(escrow({ flags: { resolved: true } }), NOW).on_chain_status
    ).toBe('resolved');
    expect(
      toEscrowPatch(escrow({ flags: { released: true } }), NOW).on_chain_status
    ).toBe('released');
    expect(
      toEscrowPatch(escrow({ flags: { disputed: true } }), NOW).on_chain_status
    ).toBe('disputed');
    expect(
      toEscrowPatch(escrow({ balance: 10, flags: {} }), NOW).on_chain_status
    ).toBe('funded');
    expect(
      toEscrowPatch(escrow({ balance: 0, flags: {} }), NOW).on_chain_status
    ).toBe('active');
  });

  it('handles missing balance/flags safely', () => {
    const p = toEscrowPatch(
      escrow({ balance: undefined, flags: undefined }),
      NOW
    );
    expect(p.balance).toBe(0);
    expect(p.on_chain_flags).toEqual({});
    expect(p.on_chain_status).toBe('active');
  });
});
