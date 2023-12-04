import express, {Express, NextFunction, Request, Response} from 'express';

export function createApp(): Express {
  return express()
    .set('trust proxy', ['loopback', 'linklocal', 'uniquelocal'])
    .disable('x-powered-by')
    .disable('etag');
}

export function appendErrorHandlers(app: Express): Express {
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not found'
    });
  });

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      return next(err);
    }

    console.log(`Error when handling request ${req.method} ${req.path}: ${err.stack}`);

    res.status(500).json({
      error: 'Internal server error'
    });
  });

  return app;
}
