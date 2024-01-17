import {cleanEnv} from 'envalid';

const envs = {
};

export default (() => {
  try {
    return cleanEnv(process.env, envs);
  } catch (e) {
    console.log(`🚫 Configuration loading has failed: ${e}`);
    process.exit(1);
  }
})();
