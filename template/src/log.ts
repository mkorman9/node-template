import winston from 'winston';

export default winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss.SSS'
    }),
    winston.format.printf(info => {
      if (info.stack) {
        return `${info.timestamp} | ${info.level} | ${info.message}: ${info.stack}`;
      }

      return `${info.timestamp} | ${info.level} | ${info.message}`;
    })
  )
});
