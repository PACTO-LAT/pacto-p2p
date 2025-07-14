import { TRUSTLINES } from './constants/trustlines';

export const getTrustline = (token: string) => {
  const trustline = TRUSTLINES.find((t) => t.name === token);

  return trustline;
};

export const getTrustlineName = (token: string) => {
  const trustline = TRUSTLINES.find((t) => t.address === token);

  if (!trustline) {
    return 'Unknown Token';
  }
  return trustline.name;
};
