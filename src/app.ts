import {createApp, attachDefaultHandlers} from './http/app_template';
import config from './config';

const app = createApp({
  corsOrigin: config.HTTP_CORS_ORIGIN,
  trustProxies: config.HTTP_TRUST_PROXIES
});



export default attachDefaultHandlers(app);
