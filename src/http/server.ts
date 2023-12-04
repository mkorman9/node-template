import app from './app';

export function startServer(host: string, port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, host, () => {
      console.log(`✅ Server started on ${host}:${port}`);
    });
    
    server.on('error', err => {
      console.log(`🚫 Failed to start the server: ${err.stack}`);
      reject(err);
    });
  
    process.on('SIGINT', () => {
      if (!server.listening) {
        resolve();
        return;
      }
    
      server.close(() => {
        console.log('⛔ Server has stopped');
        resolve();
      });
    
      setTimeout(() => {
        console.log('🚫 Timeout when stopping the server');
        resolve();
      }, 5000);
    });
  });
}
