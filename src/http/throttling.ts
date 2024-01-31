import {RequestHandler} from 'express';

export type ThrottleOptions = {
  limit?: number;
  windowMs?: number;
};

type ClientEntry = {
  hits: number;
  expiresAt: number;
};

export function throttle<TParams, TQuery, TBody, TLocals extends Record<string, unknown>>(
  opts?: ThrottleOptions
): RequestHandler<TParams, unknown, TBody, TQuery, TLocals> {
  const limit = opts?.limit || 100;
  const windowMs = opts?.windowMs || 5000;
  const entries = new Map<string, ClientEntry>();

  return (req, res, next) => {
    if (!req.ip) {
      return next();
    }

    const entry = entries.get(req.ip);
    if (entry && entry.expiresAt >= Date.now()) {
      entry.hits += 1;

      if (entry.hits > limit) {
        return res.status(429).json({
          title: 'Request has been throttled',
          type: 'TooManyRequests'
        });
      }
    } else {
      entries.set(req.ip, {
        hits: 1,
        expiresAt: Date.now() + windowMs
      });
    }

    next();
  };
}
