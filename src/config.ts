import 'dotenv/config';
import {z} from 'zod';

const str = () => z.string();
const bool = () => z.string().transform(v => ['true', '1'].includes(v.toLowerCase()));
const int = () => z.preprocess(Number, z.number().int());

const ConfigSchema = z.object({
  HTTP_HOST: str().default('0.0.0.0'),
  HTTP_PORT: int().default(8080)
});

export default (() => {
  try {
    return ConfigSchema.parse(process.env);
  } catch (e) {
    console.log(`🚫 Configuration loading has failed: ${e}`);
    process.exit(1);
  }
})();
