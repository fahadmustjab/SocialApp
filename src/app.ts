import express, { Express } from 'express';
import { AppServer } from './setupServer';
import databaseConnection from './setupDatabase';
import { config } from './config';
import Logger from 'bunyan';

const log: Logger = config.createLogger('app');
class Application {
  public initialize(): void {
    this.lodConfig();
    databaseConnection();
    const app: Express = express();
    const server: AppServer = new AppServer(app);
    server.start();
    Application.handleExit();
  }
  private lodConfig(): void {
    config.validateConfig();
    config.cloudinaryConfig();
  }

  private static handleExit(): void {
    log.info('Exiting application.');
    process.on('uncaughtException', (error: Error) => {
      log.error('Uncaught Exception', error);
      Application.shutDownProperly(1);
    });
    process.on('unhandledRejection', (error: Error) => {
      log.error('Unhandled Rejection', error);
      Application.shutDownProperly(2);
    });
    process.on('SIGINT', () => {
      log.info('Received SIGINT.');
      Application.shutDownProperly(128 + 2);
    });
  }

  private static shutDownProperly(exitCode: number): void {
    log.info('Shutting down application.');
    Promise.resolve().then(() => {
      log.info('Shutdown complete.');
      process.exit(exitCode);
    }).catch((error: Error) => {
      log.error('Error during shutdown.', error);
      process.exit(1);
    });
  }

}



const application = new Application();
application.initialize();
