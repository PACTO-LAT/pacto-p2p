import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

declare module 'express' {
  interface Request {
    traceId?: string;
  }
}

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const incoming = req.header('x-request-id');
  const traceId = incoming && incoming.length > 0 ? incoming : randomUUID();
  req.traceId = traceId;
  res.setHeader('X-Request-Id', traceId);
  next();
}
