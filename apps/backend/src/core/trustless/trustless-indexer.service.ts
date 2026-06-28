import {
  TLW_BASE_URLS,
  type TlwNetwork,
} from '@core/trustless/trustless.config';
import { Injectable, Logger } from '@nestjs/common';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { ConfigService } from '@nestjs/config';
import type { Escrow } from '@pacto-p2p/types';

@Injectable()
export class TrustlessIndexerService {
  private readonly logger = new Logger(TrustlessIndexerService.name);

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return (
      !!this.config.get<string>('TLW_API_KEY') &&
      !!this.config.get<string>('PLATFORM_ROLE_ADDRESS')
    );
  }

  async getPlatformEscrows(): Promise<Escrow[]> {
    const apiKey = this.config.get<string>('TLW_API_KEY', '');
    const roleAddress = this.config.get<string>('PLATFORM_ROLE_ADDRESS', '');
    const network = this.config.get<TlwNetwork>('TLW_NETWORK', 'testnet');
    const baseUrl = TLW_BASE_URLS[network] ?? TLW_BASE_URLS.testnet;

    // GET /helper/get-escrows-by-role — confirmed from @trustless-work/escrow dist:
    // params { role, roleAddress, type }, Bearer auth, response is a bare array.
    const url = new URL(`${baseUrl}/helper/get-escrows-by-role`);
    url.searchParams.set('role', 'platformAddress');
    url.searchParams.set('roleAddress', roleAddress);
    url.searchParams.set('type', 'single-release');

    let res: Response;
    try {
      res = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(15_000),
      });
    } catch (err) {
      this.logger.warn(`TLW request failed: ${(err as Error).message}`);
      throw new Error(`TLW request failed: ${(err as Error).message}`);
    }
    if (!res.ok) {
      this.logger.warn(
        `TLW get-escrows-by-role non-ok: ${res.status} ${res.statusText}`
      );
      throw new Error(
        `TLW get-escrows-by-role failed: ${res.status} ${res.statusText}`
      );
    }
    const body = (await res.json()) as unknown;
    return Array.isArray(body) ? (body as Escrow[]) : [];
  }
}
