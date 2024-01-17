import 'dotenv/config';
import {bool, cleanEnv, port, str} from 'envalid';

const envs = {
  HTTP_HOST: str({default: '0.0.0.0'}),
  HTTP_PORT: port({default: 8080}),
  HTTP_CORS_ORIGIN: str({default: undefined}),
  HTTP_TRUST_PROXIES: bool({default: true})
};

export default (() => {
  try {
    return cleanEnv(process.env, envs);
  } catch (e) {
    console.log(`🚫 Configuration loading has failed: ${e}`);
    process.exit(1);
  }
})();
