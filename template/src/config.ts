import 'dotenv/config';
import {z} from 'zod';

const ConfigSchema = z.object({
});

export default (() => {
  try {
    return ConfigSchema.parse(process.env);
  } catch (e) {
    console.log(`🚫 Configuration loading has failed: ${e}`);
    process.exit(1);
  }
})();
