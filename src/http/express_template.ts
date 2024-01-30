import express, {Application, NextFunction, Request, Response} from 'express';
import cors from 'cors';
import 'express-async-errors';

export type ExpressAppOptions = {
  corsOrigin: string;
  trustProxies: boolean;
};

export function createExpressApp(opts?: Partial<ExpressAppOptions>): Application {
  return express()
    .set('trust proxy', opts?.trustProxies ? ['loopback', 'linklocal', 'uniquelocal'] : [])
    .disable('x-powered-by')
    .disable('etag')
    .use(cors({origin: opts?.corsOrigin}));
}

export function attachDefaultHandlers(app: Application): Application {
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      title: 'The requested resource was not found',
      type: 'NotFound'
    });
  });

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      return next(err);
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
