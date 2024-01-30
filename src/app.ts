import {createExpressApp, attachDefaultHandlers} from './http/express_template';
import config from './config';

const app = createExpressApp({
  corsOrigin: config.HTTP_CORS_ORIGIN,
  trustProxies: config.HTTP_TRUST_PROXIES
});



export default attachDefaultHandlers(app);
