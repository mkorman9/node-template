import {RequestHandler, Request} from 'express';

export type ThrottleOptions<TParams, TQuery, TBody, TLocals extends Record<string, unknown>> = {
  limit?: number;
  windowMs?: number;
  statusCodes?: number[];
  key?: (req: Request<TParams, unknown, TBody, TQuery, TLocals>) => string;
};

type ClientEntry = {
  hits: number;
  expiresAt: number;
};

export function throttle<TParams, TQuery, TBody, TLocals extends Record<string, unknown>>(
  opts?: ThrottleOptions<TParams, TQuery, TBody, TLocals>
): RequestHandler<TParams, unknown, TBody, TQuery, TLocals> {
  const limit = opts?.limit || 100;
  const windowMs = opts?.windowMs || 5000;
  const key = opts?.key || (req => req.ip!);
  const entries = new Map<string, ClientEntry>();

  return (req, res, next) => {
    let entry = entries.get(key(req));
    if (entry && entry.expiresAt >= Date.now()) {
      if (entry.hits >= limit) {
        return res.status(429).json({
          title: 'Request has been throttled',
          type: 'Throttled'
        });
      }
    } else {
      entry = {
        hits: 0,
        expiresAt: Date.now() + windowMs
      };
      entries.set(key(req), entry);
    }

    res.on('finish', () => {
      if (!opts?.statusCodes || opts?.statusCodes.includes(res.statusCode)) {
        entry!.hits += 1;
      }
    });

    next();
  };
}
