import 'dotenv/config';
import {z} from 'zod';

const ConfigSchema = z.object({
});

export default (() => {
  try {
    return ConfigSchema.parse(
      Object.keys(process.env)
        .reduce(
          (env, key) => {
            if (!isNaN(Number(process.env[key]))) {
              env[key] = Number(process.env[key]);
            } else if (['true', 'false'].includes(process.env[key]!.toLowerCase())) {
              env[key] = process.env[key]!.toLowerCase() === 'true';
            } else {
              env[key] = process.env[key];
            }
            return env;
          },
          {} as Record<string, unknown>
        )
    );
  } catch (e) {
    console.log(`🚫 Configuration loading has failed: ${e}`);
    process.exit(1);
  }
})();
