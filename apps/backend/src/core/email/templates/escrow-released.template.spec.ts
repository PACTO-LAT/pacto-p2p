import { renderEscrowReleasedEmail } from '@core/email/templates/escrow-released.template';

describe('renderEscrowReleasedEmail', () => {
  it('produces subject/text/html and greets by name when provided', () => {
    const out = renderEscrowReleasedEmail({
      recipientName: 'Alice',
      role: 'buyer',
      engagementId: 'eng1',
      amount: 250,
    });
    expect(out.subject).toMatch(/liberad/i);
    expect(out.text).toContain('Alice');
    expect(out.text).toContain('eng1');
    expect(out.text).toContain('250');
    expect(out.html).toContain('eng1');
  });

  it('uses seller copy and a generic greeting without a name', () => {
    const buyer = renderEscrowReleasedEmail({
      role: 'buyer',
      engagementId: 'e',
      amount: 1,
    });
    const seller = renderEscrowReleasedEmail({
      role: 'seller',
      engagementId: 'e',
      amount: 1,
    });
    expect(seller.text).not.toEqual(buyer.text);
    expect(seller.text).toContain('Hola,');
  });
});
