import log from './log';

process.on('uncaughtException', err => {
  log.error('Unhandled exception', { stack: err.stack });
});

process.on('unhandledRejection', reason => {
  if (reason instanceof Error) {
    log.error(`Unhandled Promise rejection`, { stack: reason.stack });
  } else {
    log.error(`Unhandled Promise rejection: ${reason}`);
  }
});
