import { IAuthJob } from '@auth/interfaces/auth.interface';
import { BaseQueue } from './base.queue';
import { userWorker } from '@worker/user.worker';

class UserQueue extends BaseQueue {
  constructor() {
    super('userQueue');
    this.processJob('addUserToDB', 5, userWorker.addUserToDB);
    this.processJob('removeBgImgFromDB', 5, userWorker.removeBgImgFromDB);

  }
  public addUserJob(name: string, data: IAuthJob): void {
    this.addJob(name, data);
  }
}

export const userQueue: UserQueue = new UserQueue();
