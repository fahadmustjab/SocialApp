import express, { Express } from 'express';
import { AppServer } from './setupServer';
import databaseConnection from './setupDatabase';
import { config } from './config';

class Application {
  public initialize(): void {
    this.lodConfig();
    databaseConnection();
    const app: Express = express();
    const server: AppServer = new AppServer(app);
    server.start();
  }
  private lodConfig(): void {
    config.validateConfig();
    config.cloudinaryConfig();
  }
}

const application = new Application();
application.initialize();
