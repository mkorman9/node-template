import {Express} from 'express';
import {Server} from 'http';
import {AddressInfo} from 'net';

export type ServerProcess = {
  address: string;
  stop: () => Promise<void>;
};

const ServerStopTimeout = 5000;

export function startServer(app: Express, host: string, port: number): Promise<ServerProcess> {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, host, () => {
      resolve(createServerProcess(server));
    });
    
    server.on('error', err => {
      reject(err);
    });
  });
}

function createServerProcess(server: Server): ServerProcess {
  const addr = server.address() as AddressInfo;
  return {
    address: `${addr.address}:${addr.port}`,
    stop: () => new Promise((resolve, reject) => {
      server.close(() => resolve());
      setTimeout(() => reject(), ServerStopTimeout);
    })
  };
}
