import config from './config';

import {startServer} from './http/server';
import app from './app';

startServer(app, config.HTTP_HOST, config.HTTP_PORT);
