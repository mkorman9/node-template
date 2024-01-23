import {Application} from 'express';
import {AddressInfo} from 'net';
import * as http from 'http';

export function createServer(app: Application): http.Server {
  return http.createServer(app);
}

export function startServer(server: http.Server, host: string, port: number): Promise<string> {
  return new Promise((resolve, reject) => {
    server.listen(port, host, () => {
      const addr = server.address();
      if (typeof addr === 'string') {
        resolve(addr);
      } else {
        const addrInfo = addr as AddressInfo;
        resolve(`${addrInfo.address}:${addrInfo.port}`);
      }
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
