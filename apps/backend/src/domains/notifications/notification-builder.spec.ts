import { buildReleasedNotifications } from '@domains/notifications/notification-builder';

const input = {
  escrowId: 'esc-1',
  buyerId: 'buyer-1',
  sellerId: 'seller-1',
  engagementId: 'eng-1',
  amount: 250,
};

describe('buildReleasedNotifications', () => {
  it('produces one draft per party with role-aware data', () => {
    const drafts = buildReleasedNotifications(input);
    expect(drafts).toHaveLength(2);
    const buyer = drafts.find((d) => d.user_id === 'buyer-1');
    const seller = drafts.find((d) => d.user_id === 'seller-1');
    expect(buyer?.type).toBe('escrow_released');
    expect(buyer?.escrow_id).toBe('esc-1');
    expect(buyer?.data.role).toBe('buyer');
    expect(buyer?.data.counterparty_id).toBe('seller-1');
    expect(seller?.data.role).toBe('seller');
    expect(seller?.data.engagement_id).toBe('eng-1');
    expect(seller?.body).not.toEqual(buyer?.body);
  });
});
