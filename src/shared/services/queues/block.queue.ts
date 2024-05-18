import { BaseQueue } from './base.queue';
import { blockWorker } from '@worker/block.worker';
import { IBlockedUserJobData } from '@follower/interfaces/follower.interface';

class BlockQueue extends BaseQueue {
  constructor() {
    super('blockQueue');
    this.processJob('addBlockUnBlockUserFromDB', 5, blockWorker.addBlockUnBlockUserFromDB);
    this.processJob('removeBlockUnBlockUserFromDB', 5, blockWorker.addBlockUnBlockUserFromDB);

  }
  public addBlockUnblockUserJob(name: string, data: IBlockedUserJobData): void {
    this.addJob(name, data);
  }
}

export const blockQueue: BlockQueue = new BlockQueue();
