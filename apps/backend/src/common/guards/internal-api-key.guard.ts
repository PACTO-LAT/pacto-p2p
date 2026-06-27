import { timingSafeEqual } from 'node:crypto';
import { SKIP_AUTH_KEY } from '@common/decorators/skip-auth.decorator';
import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
// ConfigService must be a value import: NestJS DI relies on the runtime
// constructor metadata emitted by emitDecoratorMetadata.
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { ConfigService } from '@nestjs/config';
// Reflector must be a value import: NestJS DI relies on the runtime
// constructor metadata emitted by emitDecoratorMetadata.
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const presented = req.header('x-internal-key');
    const expected = this.config.get<string>('INTERNAL_API_KEY');
    if (!expected || !presented || !safeEqual(presented, expected)) {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED' });
    }
    return true;
  }
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) {
    return false;
  }
  return timingSafeEqual(ab, bb);
}
