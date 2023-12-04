import express, {NextFunction, Request, Response} from 'express';
import routes from './routes';

const app = express();

app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);
app.disable('x-powered-by');
app.disable('etag');

routes(app);

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

export default app;