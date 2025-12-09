/**
 * Trustline configuration for supported tokens
 * 
 * IMPORTANT: As of the latest API update, trustline.address should contain
 * the issuer address (G...) instead of the SAC address (C...).
 * The API will automatically resolve the SAC address using the issuer + symbol.
 * 
 * Testnet USDC issuer: GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
 * Mainnet USDC issuer: GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN
 */
export const TRUSTLINES = [
  // TESTNET
  {
    name: 'USDC',
    // Issuer address (G...) - API will resolve to SAC address automatically
    issuer:
      process.env.NEXT_PUBLIC_USDC_ISSUER_ADDRESS ||
      'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5', // Testnet issuer
    symbol: 'USDC',
    decimals: 10000000,
    // Keep address for backward compatibility (now points to issuer, not SAC)
    address:
      process.env.NEXT_PUBLIC_USDC_ISSUER_ADDRESS ||
      'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
  },
  {
    name: 'CRCX',
    issuer:
      process.env.NEXT_PUBLIC_CRCX_ISSUER_ADDRESS ||
      '', // TODO: Add CRCX testnet issuer address
    symbol: 'CRCX',
    decimals: 100,
    address:
      process.env.NEXT_PUBLIC_CRCX_ISSUER_ADDRESS ||
      '',
  },
  {
    name: 'MXNX',
    issuer:
      process.env.NEXT_PUBLIC_MXNX_ISSUER_ADDRESS || '',
    symbol: 'MXNX',
    decimals: 100,
    address:
      process.env.NEXT_PUBLIC_MXNX_ISSUER_ADDRESS || '',
  },
];
