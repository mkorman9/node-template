import 'dotenv/config';
import {bool, cleanEnv, port, str} from 'envalid';

export default cleanEnv(process.env, {
  HTTP_HOST: str({default: '0.0.0.0'}),
  HTTP_PORT: port({default: 8080}),
  HTTP_CORS_ORIGIN: str({default: undefined}),
  HTTP_TRUST_PROXIES: bool({default: true})
});
