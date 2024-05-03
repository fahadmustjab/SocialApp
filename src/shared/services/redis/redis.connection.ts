import { config } from '@root/config';
import Logger from 'bunyan';
import { BaseCache } from './base.cache';

const log: Logger = config.createLogger('redisConnection');

class RedisConnection extends BaseCache {
  constructor() {
    super('redisConnection');
  }
  async connect(): Promise<void> {
    try {
      await this.client.connect();
      await this.client.ping();
      log.info('Redis Connection Eastablished');
    } catch (error) {
      log.error(error);
    }
  }

}

export const redisConnection: RedisConnection = new RedisConnection();
