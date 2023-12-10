import express, {Express, NextFunction, Request, Response} from 'express';
import 'express-async-errors';

import {RequestValidationError} from './validation';

export function createApp(): Express {
  return express()
    .set('trust proxy', ['loopback', 'linklocal', 'uniquelocal'])
    .disable('x-powered-by')
    .disable('etag');
}

export function appendErrorHandlers(app: Express): Express {
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      title: 'The request resource was not found',
      type: 'NotFound'
    });
  });

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      return next(err);
    }

    if (err instanceof RequestValidationError) {
      return res.status(400).json(err.response);
    }

    console.log(`🚫 Unhandled error while processing the request (${req.method} ${req.path}): ${err.stack}`);

    res.status(500).json({
      title: 'Server has encountered an error when processing the request',
      type: 'InternalServerError',
      cause: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
  });

  return app;
}
