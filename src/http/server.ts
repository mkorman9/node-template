import {Application} from 'express';
import {AddressInfo} from 'net';
import * as http from 'http';

export function createServer(app: Application): http.Server {
  return http.createServer(app);
}

export function startServer(server: http.Server, host: string, port: number): Promise<string> {
  return new Promise((resolve, reject) => {
    server.listen(port, host, () => {
      const addr = server.address() as AddressInfo;
      const host = addr.address.indexOf(':') >= 0 ? `[${addr.address}]` : addr.address;
      resolve(`${host}:${addr.port}`);
    });
    server.on('error', err => reject(err));
  });
}

export function stopServer(server: http.Server, timeout: number = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close(() => resolve());
    setTimeout(() => reject(), timeout);
  });
}
