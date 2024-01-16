import {createApp, appendErrorHandlers} from './http/app_template';
import config from './config';

const app = createApp({
  trustProxies: true,
  corsOrigin: config.HTTP_CORS_ORIGIN
});



export default appendErrorHandlers(app);
