import type { NextFunction, Request, Response } from 'express';

function stripMongoKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripMongoKeys);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (key.startsWith('$') || key.includes('.')) continue;
      out[key] = stripMongoKeys(nested);
    }
    return out;
  }
  return value;
}

export function mongoSanitize(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = stripMongoKeys(req.body) as typeof req.body;
  }
  if (req.query && typeof req.query === 'object') {
    const cleaned = stripMongoKeys(req.query);
    for (const key of Object.keys(req.query)) delete (req.query as Record<string, unknown>)[key];
    Object.assign(req.query, cleaned);
  }
  next();
}
