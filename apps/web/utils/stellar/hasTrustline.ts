/**
 * Checks whether a Stellar account has an active trustline for a given asset.
 *
 * Queries the Horizon REST API — no SDK dependency required.
 * Returns `false` (never throws) when the account doesn't exist or the network
 * is unreachable, so callers can decide how to surface the error.
 *
 * @param accountAddress - Stellar G… address to check
 * @param assetCode      - Token symbol, e.g. "USDC"
 * @param assetIssuer    - Issuer address (G…) of the token
 */
export async function hasTrustline(
  accountAddress: string,
  assetCode: string,
  assetIssuer: string
): Promise<boolean> {
  const isMainnet = process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet';
  const horizonBase = isMainnet
    ? 'https://horizon.stellar.org'
    : 'https://horizon-testnet.stellar.org';

  try {
    const res = await fetch(`${horizonBase}/accounts/${accountAddress}`);
    if (!res.ok) return false;

    const account = await res.json();

    return (
      account.balances?.some(
        (b: { asset_code?: string; asset_issuer?: string }) =>
          b.asset_code === assetCode && b.asset_issuer === assetIssuer
      ) ?? false
    );
  } catch {
    // Network error — treat as unknown / not verified
    return false;
  }
}
