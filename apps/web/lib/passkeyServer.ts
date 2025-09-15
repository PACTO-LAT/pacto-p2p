import { PasskeyServer } from 'passkey-kit';

let singleton: PasskeyServer | null = null;

export function getPasskeyServer() {
  if (typeof window !== 'undefined') {
    throw new Error('getPasskeyServer must be called on the server');
  }

  if (singleton) return singleton;

  const rpcUrl = process.env.NEXT_PUBLIC_rpcUrl as string | undefined;
  const launchtubeUrl = process.env
    .NEXT_PUBLIC_launchtubeUrl as string | undefined;
  const launchtubeJwt = process.env.PRIVATE_launchtubeJwt as
    | string
    | undefined;
  const mercuryUrl = process.env.NEXT_PUBLIC_mercuryUrl as string | undefined;
  const mercuryJwt = process.env.PRIVATE_mercuryJwt as string | undefined;
  const mercuryProjectName = process.env.MERCURY_PROJECT_NAME as
    | string
    | undefined;
  const mercuryKey = process.env.PRIVATE_mercuryKey as string | undefined;

  if (
    !rpcUrl ||
    !launchtubeUrl ||
    !launchtubeJwt ||
    !mercuryUrl ||
    (!mercuryJwt && !mercuryKey) ||
    !mercuryProjectName
  ) {
    throw new Error(
      'Missing Passkey server env. Ensure NEXT_PUBLIC_rpcUrl, NEXT_PUBLIC_launchtubeUrl, PRIVATE_launchtubeJwt, NEXT_PUBLIC_mercuryUrl, (PRIVATE_mercuryJwt or PRIVATE_mercuryKey), and MERCURY_PROJECT_NAME are set.'
    );
  }

  singleton = new PasskeyServer({
    rpcUrl,
    launchtubeUrl,
    launchtubeJwt,
    mercuryUrl,
    mercuryJwt,
    mercuryKey,
    mercuryProjectName,
  });
  return singleton;
}

export function isPasskeyServerConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_rpcUrl &&
      process.env.NEXT_PUBLIC_launchtubeUrl &&
      process.env.PRIVATE_launchtubeJwt &&
      process.env.NEXT_PUBLIC_mercuryUrl &&
      process.env.PRIVATE_mercuryJwt
  );
}


