import './config';
import './error_handlers';



process.on('SIGINT', () => {
  process.exit(0);
});
