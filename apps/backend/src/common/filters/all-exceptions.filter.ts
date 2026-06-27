import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: ConfigService kept as a value import for DI consistency with the rest of the codebase
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly config: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const isProd = this.config.get<string>('NODE_ENV') === 'production';

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Internal server error';
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
        code = exception.name;
      } else if (body && typeof body === 'object') {
        const b = body as Record<string, unknown>;
        code = (b.code as string) ?? exception.name;
        message = (b.message as string) ?? message;
        details = b.details;
      }
    }

    res.status(status).json({
      code,
      message: isProd && status >= 500 ? 'Internal server error' : message,
      traceId: req.traceId,
      details: isProd ? undefined : details,
    });
  }
}
