import {BaseApp} from './structures/app/BaseApp.js';
import {inspect} from 'util';
import {Logger} from './structures/logger/Logger.js';
import cluster from 'cluster';

if (cluster.isMaster) {
  process.title = 'Server Process Manager';
  let x = 0;
  let calledTerm = false;
  const logger = new Logger();
  let node: cluster.Worker;
  process
    .on('SIGTERM', async () => {
      logger.log(
        'ProcessManager received SIGTERM, Shutting down gracefully...',
        'INFO',
        'SIGTERM'
      );
      calledTerm = true;
      node.process.emit('exit');
      cluster.once('exit', () => process.exit(0));
    })
    .on('SIGINT', async () => {
      logger.log(
        'ProcessManager received SIGINT, Shutting down gracefully...',
        'INFO',
        'SIGINT'
      );
      calledTerm = true;
      node.process.emit('exit');
      cluster.once('exit', () => process.exit(0));
    });
  logger.log(
    `Server Process Manager Online, PID: ${process.pid}`,
    'INFO',
    'ProcessManager'
  );
  node = cluster.fork();
  cluster.on('exit', (worker: cluster.Worker, code: number, signal: string) => {
    if (!calledTerm) {
      x++;
      logger.log(
        `Worker (PID: ${worker.process.pid}) exited with code: ${code} and signal ${signal}`,
        'INFO',
        'ProcessManager'
      );
      logger.log(`Termination count: ${x}`, 'INFO', 'ProcessManager');
      node = cluster.fork();
    }
  });
} else {
  process.title = 'Server Worker Node';
  const Server = new BaseApp();
  Server.logger.log(
    `Worker process started with pid: ${process.pid}`,
    'INFO',
    'WorkerNode'
  );
  process
    .on('exit', async (code: number | undefined) => {
      Server.logger.log(
        `Process about to exit with code: ${code}`,
        'INFO',
        'BeforeExit'
      );
      Server.logger.log('Disconnecting MongoDB...', 'INFO', 'BeforeExit');
      Server.mongo.isConnected() ? await Server.mongo.close() : undefined;
      Server.logger.log('MongoDB Disconnected', 'INFO', 'BeforeExit');
      Server.logger.log(
        `Generating logs and Exiting with code: ${code}`,
        'INFO',
        'BeforeExit'
      );
      Server.logger.generateLogFile();
    })
    .on('unhandledRejection', (reason: unknown, promise: unknown) => {
      Server.logger.log(
        `Unhandled Rejection at: ${inspect(promise)} reason: ${inspect(
          reason
        )}`,
        'Error',
        'UnhandledRejection'
      );
    })
    .on('uncaughtException', (err: Error, origin: unknown) => {
      Server.logger.log(
        `Error: ${inspect(err)} at ${inspect(origin)}`,
        'Error',
        'UncaughtException'
      );
    });
  Server.setup();
}
