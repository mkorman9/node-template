import 'dotenv/config';
import {z} from 'zod';

const ConfigSchema = z.object({
  HTTP_HOST: z.string().default('0.0.0.0'),
  HTTP_PORT: z.coerce.number().int().default(8080),
  HTTP_CORS_ORIGIN: z.string().optional(),
  HTTP_TRUST_PROXIES: z.string().transform(v => JSON.parse(v)).pipe(z.boolean()).default('true')
});

export default (() => {
  try {
    return ConfigSchema.parse(process.env);
  } catch (e) {
    console.log(`🚫 Configuration loading has failed: ${e}`);
    process.exit(1);
  }
})();
