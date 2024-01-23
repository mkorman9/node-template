import config from './config';

import {createServer, startServer, stopServer} from './http/server';
import app from './app';

const server = createServer(app);
startServer(server, config.HTTP_HOST, config.HTTP_PORT)
  .then(address => console.log(`✅ Server started on ${address}`))
  .catch(err => {
    console.log(`🚫 Failed to start the server: ${err.stack}`);
    process.exit(1);
  });

process.on('SIGINT', () => {
  stopServer(server)
    .then(() => console.log('⛔ Server has stopped'))
    .catch(() => console.log('🚫 Timeout while stopping the server'))
    .finally(() => process.exit(0));
});
