import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { config } from '@root/config';
import Queue, { Job } from 'bull';
import Logger from 'bunyan';
import { IAuthJob } from '@auth/interfaces/auth.interface';
import { IPostJobData } from '@post/interfaces/post.interface';
import { IEmailJob } from '@user/interfaces/user.interface';
import { IReactionJob } from '@reaction/interfaces/reaction.interface';
import { ICommentJob } from '@comment/interfaces/comment.interface';
import { IBlockedUserJobData, IFollowerJobData } from '@follower/interfaces/follower.interface';
<<<<<<< Updated upstream

let bullAdapters: BullAdapter[] = [];
type IBaseJobData = IEmailJob | IAuthJob | IPostJobData | IReactionJob | ICommentJob | IFollowerJobData | IBlockedUserJobData;
=======
import { INotificationJobData } from '@notification/interfaces/notification.interface';
import { EventEmitter } from 'events';
import { IFileImageJobData } from '@image/interfaces/image.interface';

let bullAdapters: BullAdapter[] = [];
type IBaseJobData = IEmailJob | IAuthJob | IPostJobData | IReactionJob | ICommentJob | IFollowerJobData | IBlockedUserJobData | INotificationJobData | IFileImageJobData;
>>>>>>> Stashed changes
export let serverAdapter: ExpressAdapter;

export abstract class BaseQueue {
  queue: Queue.Queue;
  log: Logger;
  constructor(queueName: string) {
    this.queue = new Queue(queueName, `${config.REDIS_HOST}`);
    bullAdapters.push(new BullAdapter(this.queue));
    bullAdapters = [...new Set(bullAdapters)];
    serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/queues');

    createBullBoard({
      queues: bullAdapters,
      serverAdapter,
    });

    this.log = config.createLogger(`${queueName}Queue`);

    this.queue.on('completed', (job: Job) => {
      job.remove();
    });
    this.queue.on('global:completed', (jobId: string) => {
      this.log.info(`Job with ${jobId} is completed`);
    });
    this.queue.on('global:stalled', (jobId: string) => {
      this.log.info(`Job with ${jobId} is stalled`);
    });
  }

  protected addJob(name: string, data: IBaseJobData) {
    this.queue.add(name, data, { attempts: 3, backoff: { type: 'fixed', delay: 5000 } });
  }


  protected processJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>): void {
    this.queue.process(name, concurrency, callback);
  }

}

