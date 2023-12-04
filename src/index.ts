import config from './config';
import './hooks';

import {startServer} from './http/server';

startServer(config.HTTP_HOST, config.HTTP_PORT)
  .then(server => {
    console.log(`✅ Server started on ${server.address}`);

    process.on('SIGINT', () => {
      server.stop()
        .then(() => console.log('⛔ Server has stopped'))
        .catch(() => console.log('🚫 Timeout when stopping the server'))
        .finally(() => process.exit(0));
    });
  })
  .catch(err => {
    console.log(`🚫 Failed to start the server: ${err.stack}`);
    process.exit(1);
  });
