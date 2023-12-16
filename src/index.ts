import './config';

console.log('✅ Application has started successfully');

process.on('SIGINT', () => {
  process.exit(0);
});
