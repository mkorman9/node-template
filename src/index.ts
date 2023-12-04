import config from './config';
import './hooks';

import { startServer } from './http/server';

startServer(config.HTTP_HOST, config.HTTP_PORT)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
