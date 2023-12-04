import config from './config';
import './hooks';

import app from './app';

const server = app.listen(config.HTTP_PORT, config.HTTP_HOST, () => {
  console.log(`✅ Server started on ${config.HTTP_HOST}:${config.HTTP_PORT}`);
});

server.on('error', err => {
  console.log(`🚫 Failed to start the server: ${err.stack}`);
  process.exit(1);
});

process.on('SIGINT', () => {
  if (!server.listening) {
    process.exit(0);
  }

  server.close(() => {
    console.log('⛔ Server has stopped');
    process.exit(0);
  });

  setTimeout(() => {
    console.log('🚫 Timeout when stopping the server');
    process.exit(1);
  }, 5000);
});
