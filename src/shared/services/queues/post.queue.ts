import { BaseQueue } from './base.queue';
import { postWorker } from '@worker/post.worker';
import { IPostJobData } from '@post/interfaces/post.interface';

class PostQueue extends BaseQueue {
  constructor() {
    super('postQueue');
    this.processJob('addPostToDB', 5, postWorker.savePostToDB);
    this.processJob('deletePostFromDB', 5, postWorker.deletePostFromDB);

  }
  public addPostJob(name: string, data: IPostJobData): void {
    this.addJob(name, data);
  }
}

export const postQueue: PostQueue = new PostQueue();
