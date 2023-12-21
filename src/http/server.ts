import {Application} from 'express';
import {Server} from 'http';

const ServerStopTimeout = 5000;

export function startServer(app: Application, host: string, port: number) {
  serverListen(app, host, port)
    .then(server => {
      console.log(`✅ Server started on ${host}:${port}`);
      process.on('SIGINT', () => stopServer(server));
    })
    .catch(err => {
      console.log(`🚫 Failed to start the server: ${err.stack}`);
      process.exit(1);
    });
}

function serverListen(app: Application, host: string, port: number): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, host, () => {
      resolve(server);
    });
    
    server.on('error', err => {
      reject(err);
    });
  });
}

function stopServer(server: Server) {
  server.close(() => {
    console.log('⛔ Server has stopped');
    process.exit(0);
  });

  setTimeout(() => {
    console.log('🚫 Timeout while stopping the server');
  }, ServerStopTimeout);
}
