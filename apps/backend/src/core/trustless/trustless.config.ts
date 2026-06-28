export type TlwNetwork = 'testnet' | 'mainnet';

// Base URLs confirmed from @trustless-work/escrow dist (Task 2 Step 1):
// `type baseURL = "https://api.trustlesswork.com" | "https://dev.api.trustlesswork.com"`.
export const TLW_BASE_URLS: Record<TlwNetwork, string> = {
  testnet: 'https://dev.api.trustlesswork.com',
  mainnet: 'https://api.trustlesswork.com',
};
