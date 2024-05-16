import { config } from '@root/config';
import { follwerService } from '@service/db/follower.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('followerWorker');
class FollowerWorker {
  async addFollowerToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo, username, followerDocumentId } = job.data;
      await follwerService.addFollowerToDB(keyOne, keyTwo, username, followerDocumentId);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async removeFollowerFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo, } = job.data;
      await follwerService.removeFollowerFromDB(keyOne, keyTwo,);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

}

export const followerWorker: FollowerWorker = new FollowerWorker();