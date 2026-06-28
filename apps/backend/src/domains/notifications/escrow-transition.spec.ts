import { detectEscrowTransition } from '@domains/notifications/escrow-transition';

describe('detectEscrowTransition', () => {
  it('fires escrow_released on a non-released → released transition', () => {
    expect(detectEscrowTransition('funded', 'released')).toEqual({
      kind: 'escrow_released',
    });
    expect(detectEscrowTransition('active', 'released')).toEqual({
      kind: 'escrow_released',
    });
    expect(detectEscrowTransition('disputed', 'released')).toEqual({
      kind: 'escrow_released',
    });
  });

  it('does NOT fire when already released (idempotent re-index)', () => {
    expect(detectEscrowTransition('released', 'released')).toBeNull();
  });

  it('does NOT fire for non-released targets', () => {
    expect(detectEscrowTransition('active', 'funded')).toBeNull();
    expect(detectEscrowTransition('funded', 'disputed')).toBeNull();
  });

  it('anti-backfill: null/undefined prior status never fires (baseline)', () => {
    expect(detectEscrowTransition(null, 'released')).toBeNull();
    expect(detectEscrowTransition(undefined, 'released')).toBeNull();
  });
});
