import {Application} from 'express';
import {Server} from 'http';

export function startServer(
  app: Application,
  host: string,
  port: number,
  callback: (err?: Error) => void
): Server {
  const server = app.listen(port, host, () => callback());
  server.on('error', err => callback(err));
  return server;
}

export function stopServer(server: Server, timeout: number = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close(() => resolve());
    setTimeout(() => reject(), timeout);
  });
}
