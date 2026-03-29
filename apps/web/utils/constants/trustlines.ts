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
    issuerName: 'Circle',
    logoFile: 'usdc.svg',
    issuer:
      process.env.NEXT_PUBLIC_USDC_ISSUER_ADDRESS ||
      'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
    symbol: 'USDC',
    decimals: 10000000,
    address:
      process.env.NEXT_PUBLIC_USDC_ISSUER_ADDRESS ||
      'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
  },
  {
    name: 'XLM',
    issuerName: 'Stellar',
    logoFile: 'xlm.png',
    issuer:
      process.env.NEXT_PUBLIC_XLM_SAC_ADDRESS ||
      'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    symbol: 'XLM',
    decimals: 10000000,
    address:
      process.env.NEXT_PUBLIC_XLM_SAC_ADDRESS ||
      'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  },
  {
    name: 'CRCX',
    issuer: process.env.NEXT_PUBLIC_CRCX_ISSUER_ADDRESS || '', // TODO: Add CRCX testnet issuer address
    symbol: 'CRCX',
    decimals: 100,
    address: process.env.NEXT_PUBLIC_CRCX_ISSUER_ADDRESS || '',
  },
  {
    name: 'MXNX',
    issuer: process.env.NEXT_PUBLIC_MXNX_ISSUER_ADDRESS || '',
    symbol: 'MXNX',
    decimals: 100,
    address: process.env.NEXT_PUBLIC_MXNX_ISSUER_ADDRESS || '',
  },
];
