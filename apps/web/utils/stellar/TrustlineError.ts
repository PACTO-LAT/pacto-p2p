/**
 * Typed error thrown when a required Stellar trustline is missing.
 *
 * Use `instanceof TrustlineError` in catch blocks to display the
 * `TrustlineBanner` UI component instead of a generic error toast.
 */
export class TrustlineError extends Error {
  readonly role: 'buyer' | 'seller';
  readonly assetCode: string;

  constructor(role: 'buyer' | 'seller', assetCode: string) {
    const message =
      role === 'seller'
        ? `Seller wallet does not have a trustline for ${assetCode}. The seller must set it up in their Stellar wallet before trading.`
        : `Your wallet does not have a trustline for ${assetCode}. Please add it in your Stellar wallet before proceeding.`;

    super(message);
    this.name = 'TrustlineError';
    this.role = role;
    this.assetCode = assetCode;
  }
}
