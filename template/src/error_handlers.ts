import log from './log';

process.on('SIGINT', () => {
  log.info('Exiting due to signal');
  process.exit(0);
});

process.on('uncaughtException', err => {
  log.error('Unhandled exception', { stack: err.stack });
});

process.on('unhandledRejection', (reason, p) => {
  if (reason instanceof Error) {
    log.error(`Unhandled Promise (${p}) rejection`, { stack: reason.stack });
  } else {
    log.error(`Unhandled Promise (${p}) rejection: ${reason}`);
  }
});
