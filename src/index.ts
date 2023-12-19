import config from './config';

import {ServerProcess, startServer} from './http/server';
import app from './app';

async function shutdown() {
  
}

async function stopServer(server: ServerProcess) {
  try {
    await server.stop();
    console.log('⛔ Server has stopped');
  } catch (e) {
    console.log(`🚫 Error while stopping the server: ${e instanceof Error ? e.stack : e}`);
  }

  try {
    await shutdown();
  } catch (e) {
    console.log(`🚫 Error during shutdown: ${e instanceof Error ? e.stack : e}`);
  }

  process.exit(0);
}

startServer(app, config.HTTP_HOST, config.HTTP_PORT)
  .then(server => {
    console.log(`✅ Server started on ${server.address}`);
    process.on('SIGINT', stopServer);
  })
  .catch(err => {
    console.log(`🚫 Failed to start the server: ${err.stack}`);
    process.exit(1);
  });
