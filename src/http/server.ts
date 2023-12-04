import {Express} from 'express';
import {Server} from 'http';

export type ServerProcess = {
  address: string;
  stop: () => Promise<void>;
};

const ServerStopTimeout = 5000;

export function startServer(app: Express, host: string, port: number): Promise<ServerProcess> {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, host, () => {
      resolve(createServerProcess(host, port, server));
    });
    
    server.on('error', err => {
      reject(err);
    });
  });
}

function createServerProcess(host: string, port: number, server: Server): ServerProcess {
  return {
    address: `${host}:${port}`,
    stop: () => new Promise((resolve, reject) => {
      server.close(() => resolve());
      setTimeout(() => reject(), ServerStopTimeout);
    })
  };
}
