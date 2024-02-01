import {RequestHandler} from 'express';

export type ThrottleOptions = {
  limit?: number;
  windowMs?: number;
  statusCodes?: number[];
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

    let entry = entries.get(req.ip);
    if (entry && entry.expiresAt >= Date.now()) {
      if (entry.hits >= limit) {
        return res.status(429).json({
          title: 'Request has been throttled',
          type: 'TooManyRequests'
        });
      }
    } else {
      entry = {
        hits: 0,
        expiresAt: Date.now() + windowMs
      };
      entries.set(req.ip, entry);
    }

    res.on('finish', () => {
      if (!req.ip) {
        return;
      }

      if (!opts?.statusCodes || opts?.statusCodes.includes(res.statusCode)) {
        entry!.hits += 1;
      }
    });

    next();
  };
}
