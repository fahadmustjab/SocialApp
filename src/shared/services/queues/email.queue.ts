import { BaseQueue } from './base.queue';
import { IEmailJob } from '@user/interfaces/user.interface';
import { emailWorker } from '@worker/email.worker';

class EmailQueue extends BaseQueue {
  constructor() {
    super('emails');
    this.processJob('resetPasswordEmail', 5, emailWorker.sendEmailJob);
    this.processJob('commentsEmail', 5, emailWorker.sendEmailJob);
    this.processJob('followerEmail', 5, emailWorker.sendEmailJob);
    this.processJob('reactionsEmail', 5, emailWorker.sendEmailJob);
    this.processJob('directMessageEmail', 5, emailWorker.sendEmailJob);


  }
  public addEmailJob(name: string, data: IEmailJob): void {
    this.addJob(name, data);
  }
}

export const emailQueue: EmailQueue = new EmailQueue();
