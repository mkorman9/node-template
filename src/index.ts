import config from './config';

import {startServer, stopServer} from './http/server';
import app from './app';

const server = startServer(
  app,
  config.HTTP_HOST,
  config.HTTP_PORT,
  (err?: Error) => {
    if (err) {
      console.log(`🚫 Failed to start the server: ${err.stack}`);
      process.exit(1);
    }

    console.log(`✅ Server started on ${config.HTTP_HOST}:${config.HTTP_PORT}`);
  }
);

process.on('SIGINT', () => {
  stopServer(server)
    .then(() => {
      console.log('⛔ Server has stopped');
    })
    .catch(() => {
      console.log('🚫 Timeout while stopping the server');
    })
    .finally(() => {
      process.exit(0);
    });
});
